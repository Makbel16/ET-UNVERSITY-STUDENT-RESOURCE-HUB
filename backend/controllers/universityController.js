import University from '../models/University.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';

// @desc    Get all universities
// @route   GET /api/universities
// @access  Public
export const getUniversities = async (req, res) => {
  try {
    const universities = await University.find({});
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a university
// @route   POST /api/universities
// @access  Private/Admin
export const createUniversity = async (req, res) => {
  try {
    const { name, abbreviation, logo, description } = req.body;
    const universityExists = await University.findOne({ name });

    if (universityExists) {
      return res.status(400).json({ message: 'University already exists' });
    }

    const university = await University.create({
      name,
      abbreviation,
      logo,
      description,
    });

    res.status(201).json(university);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get departments of a university
// @route   GET /api/universities/:universityId/departments
// @access  Public
export const getDepartments = async (req, res) => {
  try {
    const { universityId } = req.params;
    const departments = await Department.find({ university: universityId });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a department in a university
// @route   POST /api/universities/:universityId/departments
// @access  Private/Admin
export const createDepartment = async (req, res) => {
  try {
    const { universityId } = req.params;
    const { name, code, description } = req.body;

    const departmentExists = await Department.findOne({ name, university: universityId });
    if (departmentExists) {
      return res.status(400).json({ message: 'Department already exists in this university' });
    }

    const department = await Department.create({
      name,
      code,
      university: universityId,
      description,
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get courses of a department
// @route   GET /api/departments/:departmentId/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const courses = await Course.find({ department: departmentId });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a course in a department
// @route   POST /api/departments/:departmentId/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name, code, year, semester } = req.body;

    const courseExists = await Course.findOne({ code, department: departmentId });
    if (courseExists) {
      return res.status(400).json({ message: 'Course with this code already exists in this department' });
    }

    const course = await Course.create({
      name,
      code,
      department: departmentId,
      year,
      semester,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
