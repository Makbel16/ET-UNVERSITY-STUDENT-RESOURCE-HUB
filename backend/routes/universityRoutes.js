import express from 'express';
import {
  getUniversities,
  createUniversity,
  getDepartments,
  createDepartment,
  getCourses,
  createCourse,
} from '../controllers/universityController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getUniversities)
  .post(protect, admin, createUniversity);

router.route('/:universityId/departments')
  .get(getDepartments)
  .post(protect, admin, createDepartment);

router.route('/departments/:departmentId/courses')
  .get(getCourses)
  .post(protect, admin, createCourse);

export default router;
