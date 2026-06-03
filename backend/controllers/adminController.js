import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Department from '../models/Department.js';
import University from '../models/University.js';
import Notification from '../models/Notification.js';

// @desc    Get Admin Dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalResources = await Resource.countDocuments({});
    const pendingResources = await Resource.countDocuments({ isApproved: false });

    // Sum of all download counts
    const downloadStats = await Resource.aggregate([
      { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } },
    ]);
    const totalDownloads = downloadStats.length > 0 ? downloadStats[0].totalDownloads : 0;

    // Most popular resources
    const popularResources = await Resource.find({ isApproved: true })
      .sort({ downloads: -1 })
      .limit(5)
      .populate('course', 'name code')
      .populate('university', 'abbreviation');

    // Count by file type
    const fileTypeStats = await Resource.aggregate([
      { $group: { _id: '$fileType', count: { $sum: 1 } } },
    ]);

    // Active universities list
    const totalUniversities = await University.countDocuments({});
    const totalDepartments = await Department.countDocuments({});

    res.json({
      totalUsers,
      totalResources,
      pendingResources,
      totalDownloads,
      popularResources,
      fileTypeStats,
      totalUniversities,
      totalDepartments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending resources
// @route   GET /api/admin/pending
// @access  Private/Admin
export const getPendingResources = async (req, res) => {
  try {
    const pending = await Resource.find({ isApproved: false })
      .populate('university', 'name abbreviation')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('uploadedBy', 'name email');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a pending resource
// @route   PUT /api/admin/approve/:id
// @access  Private/Admin
export const approveResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.isApproved = true;
    await resource.save();

    // Notify uploader
    await Notification.create({
      user: resource.uploadedBy,
      title: 'Resource Approved! 🎉',
      message: `Your upload "${resource.title}" has been approved and is now live.`,
      type: 'badge',
      link: `/resources/${resource._id}`,
    });

    res.json({ message: 'Resource approved successfully', resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/admin/resources/:id
// @access  Private/Admin
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reported resources
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReportedResources = async (req, res) => {
  try {
    const reported = await Resource.find({ 'reports.0': { $exists: true } })
      .populate('university', 'name abbreviation')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('uploadedBy', 'name email')
      .populate('reports.user', 'name email');
    res.json(reported);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dismiss reports on a resource
// @route   PUT /api/admin/reports/dismiss/:id
// @access  Private/Admin
export const dismissReports = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.reports = [];
    await resource.save();

    res.json({ message: 'Reports dismissed successfully', resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
