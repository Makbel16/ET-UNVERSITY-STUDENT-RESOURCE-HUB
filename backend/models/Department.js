import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a department name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please add a department code (e.g. CS, EE)'],
      trim: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compounding unique index so departments are unique per university
departmentSchema.index({ name: 1, university: 1 }, { unique: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
