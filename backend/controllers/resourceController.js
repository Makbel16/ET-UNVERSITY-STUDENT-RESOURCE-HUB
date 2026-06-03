import Resource from '../models/Resource.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { awardPoints } from '../utils/badgeHelper.js';

// @desc    Get resources with filtering & search
// @route   GET /api/resources
// @access  Public
export const getResources = async (req, res) => {
  try {
    const {
      search,
      university,
      department,
      course,
      year,
      semester,
      fileType,
      sort,
      limit,
    } = req.query;

    const query = { isApproved: true };

    if (university) query.university = university;
    if (department) query.department = department;
    if (course) query.course = course;
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (fileType) query.fileType = fileType;

    // Search query using regex or text index
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let resourcesQuery = Resource.find(query)
      .populate('university', 'name abbreviation')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('uploadedBy', 'name avatar');

    // Sorting
    if (sort === 'downloads') {
      resourcesQuery = resourcesQuery.sort({ downloads: -1 });
    } else if (sort === 'rating') {
      resourcesQuery = resourcesQuery.sort({ averageRating: -1 });
    } else {
      resourcesQuery = resourcesQuery.sort({ createdAt: -1 }); // default: new releases
    }

    if (limit) {
      resourcesQuery = resourcesQuery.limit(Number(limit));
    }

    const resources = await resourcesQuery;
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Public
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('university', 'name abbreviation')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('uploadedBy', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/upload a new resource
// @route   POST /api/resources
// @access  Private
export const createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      university,
      college,
      department,
      course,
      year,
      semester,
      fileType,
      fileSize,
      fileUrl, // optional if uploaded directly
      tutorialLinks,
    } = req.body;

    let finalFileUrl = fileUrl || '';
    if (req.file) {
      // Local path relative to backend root
      finalFileUrl = `/uploads/${req.file.filename}`;
    }

    if (!finalFileUrl) {
      return res.status(400).json({ message: 'Please upload a file or specify a file URL' });
    }

    // Auto-approve if uploaded by admin
    const isApproved = req.user.role === 'admin';

    const parsedLinks = typeof tutorialLinks === 'string' 
      ? JSON.parse(tutorialLinks) 
      : (tutorialLinks || []);

    const resource = await Resource.create({
      title,
      description,
      fileUrl: finalFileUrl,
      fileType: fileType || 'pdf',
      fileSize: fileSize || (req.file ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown'),
      university,
      college,
      department,
      course,
      year: Number(year),
      semester: Number(semester),
      uploadedBy: req.user._id,
      isApproved,
      tutorialLinks: parsedLinks,
    });

    // Reward points to contributor (15 points for upload)
    await awardPoints(req.user._id, 15);

    // Notify admins if not auto-approved
    if (!isApproved) {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          title: 'Pending Resource Approval',
          message: `Student ${req.user.name} uploaded "${title}". Review required.`,
          type: 'upload',
          link: '/admin/dashboard',
        });
      }
    }

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track download and award points
// @route   POST /api/resources/:id/download
// @access  Private
export const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment downloads
    resource.downloads += 1;
    await resource.save();

    // Add to user download history
    const user = await User.findById(req.user._id);
    if (user) {
      const alreadyDownloaded = user.downloadHistory.some(
        (h) => h.resource.toString() === resource._id.toString()
      );
      if (!alreadyDownloaded) {
        user.downloadHistory.push({ resource: resource._id });
        await awardPoints(user._id, 2); // 2 points for downloading & reading
        await user.save();

        // Award uploader points (5 points for helping others download)
        await awardPoints(resource.uploadedBy, 5);
      }
    }

    res.json({ message: 'Download tracked successfully', downloads: resource.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate a resource
// @route   POST /api/resources/:id/rate
// @access  Private
export const rateResource = async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: 'Rating score must be between 1 and 5' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if already rated by user
    const existingRating = resource.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.score = Number(score);
    } else {
      resource.ratings.push({ user: req.user._id, score: Number(score) });
    }

    // Recalculate average
    const totalScore = resource.ratings.reduce((sum, r) => sum + r.score, 0);
    resource.averageRating = Number((totalScore / resource.ratings.length).toFixed(1));

    await resource.save();

    // Reward points for feedback
    await awardPoints(req.user._id, 3);

    res.json({ averageRating: resource.averageRating, ratingsCount: resource.ratings.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to resource
// @route   POST /api/resources/:id/comment
// @access  Private
export const commentOnResource = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const newComment = {
      user: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text,
    };

    resource.comments.push(newComment);
    await resource.save();

    // Reward uploader points & student points
    await awardPoints(req.user._id, 3); // 3 points for commenting

    // Notify resource owner
    if (resource.uploadedBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: resource.uploadedBy,
        title: 'New Comment on Upload',
        message: `${req.user.name} commented on your resource "${resource.title}".`,
        type: 'comment',
        link: `/resources/${resource._id}`,
      });
    }

    res.status(201).json(resource.comments[resource.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle bookmark for user
// @route   POST /api/resources/:id/bookmark
// @access  Private
export const bookmarkResource = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resourceId = req.params.id;
    const isBookmarked = user.bookmarks.includes(resourceId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((id) => id.toString() !== resourceId);
    } else {
      user.bookmarks.push(resourceId);
    }

    await user.save();
    res.json({ isBookmarked: !isBookmarked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a resource as broken/inappropriate
// @route   POST /api/resources/:id/report
// @access  Private
export const reportResource = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required for report' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Avoid double reporting by same user
    const alreadyReported = resource.reports.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this resource' });
    }

    resource.reports.push({ user: req.user._id, reason });
    await resource.save();

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'Resource Reported',
        message: `Resource "${resource.title}" reported. Reason: ${reason}`,
        type: 'info',
        link: '/admin/dashboard',
      });
    }

    res.json({ message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
