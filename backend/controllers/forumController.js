import ForumPost from '../models/ForumPost.js';
import Notification from '../models/Notification.js';
import { awardPoints } from '../utils/badgeHelper.js';

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Public
export const getForumPosts = async (req, res) => {
  try {
    const { category, sort } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    let postsQuery = ForumPost.find(query)
      .populate('author', 'name avatar role')
      .populate('replies.author', 'name avatar role');

    if (sort === 'popular') {
      postsQuery = postsQuery.sort({ 'upvotes.length': -1, createdAt: -1 });
    } else {
      postsQuery = postsQuery.sort({ createdAt: -1 });
    }

    const posts = await postsQuery;
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create forum post
// @route   POST /api/forum
// @access  Private
export const createForumPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await ForumPost.create({
      title,
      content,
      category: category || 'General',
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
    });

    // Reward points for starting a discussion (10 points)
    await awardPoints(req.user._id, 10);

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add reply to forum post
// @route   POST /api/forum/:id/reply
// @access  Private
export const replyToForumPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Reply content cannot be empty' });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newReply = {
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      content,
      upvotes: [],
    };

    post.replies.push(newReply);
    await post.save();

    // Reward points for replying (5 points)
    await awardPoints(req.user._id, 5);

    // Notify post author
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.author,
        title: 'New Reply on Forum Post',
        message: `${req.user.name} replied to: "${post.title}"`,
        type: 'comment',
        link: `/community`,
      });
    }

    const savedReply = post.replies[post.replies.length - 1];
    res.status(201).json(savedReply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote/Like a forum post
// @route   POST /api/forum/:id/upvote
// @access  Private
export const upvoteForumPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isUpvoted = post.upvotes.includes(userId);

    if (isUpvoted) {
      post.upvotes = post.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.upvotes.push(userId);
      // Award author points for high quality post
      await awardPoints(post.author, 2);
    }

    await post.save();
    res.json({ upvotesCount: post.upvotes.length, isUpvoted: !isUpvoted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
