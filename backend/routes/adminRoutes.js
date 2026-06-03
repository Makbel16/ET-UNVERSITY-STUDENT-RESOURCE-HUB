import express from 'express';
import {
  getDashboardStats,
  getPendingResources,
  approveResource,
  deleteResource,
  getReportedResources,
  dismissReports,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/pending', getPendingResources);
router.put('/approve/:id', approveResource);
router.delete('/resources/:id', deleteResource);
router.get('/reports', getReportedResources);
router.put('/reports/dismiss/:id', dismissReports);

export default router;
