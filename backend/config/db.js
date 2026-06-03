import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ethiostudyhub';
    console.log(`Connecting to MongoDB at: ${connStr}...`);
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Ensure MongoDB service is running locally or specify MONGODB_URI in your environment.');
    // Do not crash the process immediately to allow mock or temporary operations if needed
  }
};

export default connectDB;
