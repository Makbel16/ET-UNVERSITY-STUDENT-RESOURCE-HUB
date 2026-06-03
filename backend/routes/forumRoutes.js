import express from 'express';
import {
  getForumPosts,
  createForumPost,
  replyToForumPost,
  upvoteForumPost,
} from '../controllers/forumController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getForumPosts)
  .post(protect, createForumPost);

router.route('/:id/reply')
  .post(protect, replyToForumPost);

router.route('/:id/upvote')
  .post(protect, upvoteForumPost);

export default router;
