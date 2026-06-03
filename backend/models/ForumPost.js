import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorAvatar: {
    type: String,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a discussion title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please add post content'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [replySchema],
  },
  {
    timestamps: true,
  }
);

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
export default ForumPost;
