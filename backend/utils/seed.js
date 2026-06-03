import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import University from '../models/University.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Resource from '../models/Resource.js';
import ForumPost from '../models/ForumPost.js';

dotenv.config();

const seedDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ethiostudyhub';
    console.log(`Connecting to database at ${connStr} for seeding...`);
    await mongoose.connect(connStr);

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await University.deleteMany({});
    await Department.deleteMany({});
    await Course.deleteMany({});
    await Resource.deleteMany({});
    await ForumPost.deleteMany({});

    console.log('Seeding Universities...');
    const unis = await University.create([
      { name: 'Addis Ababa University', abbreviation: 'AAU', abbreviationLow: 'aau', description: 'The oldest higher learning institution in Ethiopia.' },
      { name: 'Bahir Dar University', abbreviation: 'BDU', abbreviationLow: 'bdu', description: 'Top tier university located near Lake Tana.' },
      { name: 'Jimma University', abbreviation: 'JU', abbreviationLow: 'ju', description: 'Ethiopia’s pioneer community-oriented education center.' },
      { name: 'Adama Science and Technology University', abbreviation: 'ASTU', abbreviationLow: 'astu', description: 'Specialized science and technology research institution.' },
      { name: 'Hawassa University', abbreviation: 'HU', abbreviationLow: 'hu', description: 'Prominent educational institution in Southern Ethiopia.' },
    ]);

    const aau = unis[0];
    const bdu = unis[1];

    console.log('Seeding Departments...');
    const depts = await Department.create([
      { name: 'Computer Science', code: 'CS', university: aau._id, description: 'Department of Computer Science & Software Engineering.' },
      { name: 'Electrical Engineering', code: 'EE', university: aau._id, description: 'Electrical & Computer Engineering.' },
      { name: 'Information Technology', code: 'IT', university: bdu._id, description: 'School of Information Technology.' },
    ]);

    const csDept = depts[0];
    const eeDept = depts[1];

    console.log('Seeding Courses...');
    const courses = await Course.create([
      // AAU CS courses
      { name: 'Database Systems', code: 'CoSc3111', department: csDept._id, year: 3, semester: 1 },
      { name: 'Object Oriented Programming', code: 'CoSc2102', department: csDept._id, year: 2, semester: 1 },
      { name: 'Web Programming', code: 'CoSc3212', department: csDept._id, year: 3, semester: 2 },
      { name: 'Data Structures and Algorithms', code: 'CoSc2101', department: csDept._id, year: 2, semester: 2 },
      // AAU EE courses
      { name: 'Calculus I', code: 'Math1011', department: eeDept._id, year: 1, semester: 1 },
      { name: 'Introduction to Electronics', code: 'ECEg2141', department: eeDept._id, year: 2, semester: 2 },
    ]);

    console.log('Seeding Users...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@ethiostudyhub.com',
      password: 'adminpassword123',
      role: 'admin',
      university: aau._id,
      department: csDept._id,
      year: 4,
      semester: 2,
      points: 120,
      badges: ['Knowledge Donor', 'Campus Mentor'],
    });

    const studentUser = await User.create({
      name: 'Abenezer Yosef',
      email: 'student@ethiostudyhub.com',
      password: 'studentpassword123',
      role: 'student',
      university: aau._id,
      department: csDept._id,
      year: 3,
      semester: 1,
      points: 35,
      badges: ['First Contributor'],
    });

    console.log('Seeding Resources...');
    const resources = await Resource.create([
      {
        title: 'Database Systems Mid Exam - AAU (2025)',
        description: 'Past mid-semester exam questions covering Relational Algebra, ER Models, Normalization, and SQL queries.',
        fileUrl: '/uploads/sample_db_exam.pdf',
        fileType: 'pdf',
        fileSize: '1.24 MB',
        university: aau._id,
        college: 'College of Natural Sciences',
        department: csDept._id,
        course: courses[0]._id,
        year: 3,
        semester: 1,
        uploadedBy: adminUser._id,
        downloads: 58,
        ratings: [{ user: studentUser._id, score: 5 }],
        averageRating: 5.0,
        isApproved: true,
        tutorialLinks: [
          { label: 'SQL Tutorial (W3Schools)', url: 'https://www.w3schools.com/sql/' },
          { label: 'Database Design Course (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=ztHopE5Wubs' },
        ],
        comments: [
          { user: studentUser._id, userName: 'Abenezer Yosef', text: 'This was extremely helpful, exactly matching our curriculum!' },
        ],
      },
      {
        title: 'Object Oriented Programming Lecture Slides (Java)',
        description: 'Complete lecture slides package for OOP concepts including encapsulation, polymorphism, inheritance, exception handling, and GUI design.',
        fileUrl: '/uploads/sample_oop_lecture.pptx',
        fileType: 'pptx',
        fileSize: '3.82 MB',
        university: aau._id,
        college: 'College of Natural Sciences',
        department: csDept._id,
        course: courses[1]._id,
        year: 2,
        semester: 1,
        uploadedBy: studentUser._id,
        downloads: 24,
        isApproved: true,
        tutorialLinks: [
          { label: 'Java OOP Course (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=aQktrLiLt0E' },
        ],
        comments: [],
      },
      {
        title: 'Web Programming Final Year Project Report',
        description: 'A comprehensive project report outlining the design, implementation, and testing of a responsive student library management portal using MERN stack.',
        fileUrl: '/uploads/sample_web_project.zip',
        fileType: 'zip',
        fileSize: '12.4 MB',
        university: aau._id,
        college: 'College of Natural Sciences',
        department: csDept._id,
        course: courses[2]._id,
        year: 3,
        semester: 2,
        uploadedBy: studentUser._id,
        downloads: 12,
        isApproved: true,
        comments: [],
      },
    ]);

    console.log('Seeding Forum Posts...');
    await ForumPost.create([
      {
        title: 'How to understand 3NF Normalization in Databases?',
        content: 'I am struggling to determine when a table is in 3NF versus BCNF. Can someone give a simplified breakdown or guide for the upcoming exam?',
        category: 'Exam Prep',
        author: studentUser._id,
        authorName: studentUser.name,
        authorAvatar: studentUser.avatar,
        upvotes: [adminUser._id],
        replies: [
          {
            author: adminUser._id,
            authorName: adminUser.name,
            authorAvatar: adminUser.avatar,
            content: 'Great question! In simple terms:\n- **1NF**: Atomic values (no repeating groups).\n- **2NF**: In 1NF and no partial dependencies (every non-key depends on the whole primary key).\n- **3NF**: In 2NF and no transitive dependencies (non-key fields depend ONLY on the primary key, not on other non-key fields).\n- **BCNF**: A stronger version of 3NF where for every functional dependency X -> Y, X must be a super key.',
            upvotes: [studentUser._id],
          },
        ],
      },
    ]);

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
