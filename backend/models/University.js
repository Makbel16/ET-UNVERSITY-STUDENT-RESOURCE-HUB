import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a university name'],
      unique: true,
      trim: true,
    },
    abbreviation: {
      type: String,
      required: [true, 'Please add a abbreviation (e.g. AAU)'],
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=150',
    },
    description: {
      type: String,
      default: 'Ethiopian Higher Education Institution',
    },
  },
  {
    timestamps: true,
  }
);

const University = mongoose.model('University', universitySchema);
export default University;
