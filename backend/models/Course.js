import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a course name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please add a course code (e.g. CoSc2102)'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: course code per department must be unique
courseSchema.index({ code: 1, department: 1 }, { unique: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
