import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userAvatar: {
    type: String,
  },
  text: {
    type: String,
    required: [true, 'Comment content cannot be empty'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a resource title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a resource description'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'Please add the resource file URL'],
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'pptx', 'xlsx', 'zip', 'image', 'other'],
      default: 'pdf',
    },
    fileSize: {
      type: String,
      default: 'Unknown size',
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    college: {
      type: String,
      default: 'College of Natural Sciences',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        score: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema],
    isApproved: {
      type: Boolean,
      default: false,
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tutorialLinks: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    aiSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Create compound text index for fast text searches
resourceSchema.index({ title: 'text', description: 'text' });

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
