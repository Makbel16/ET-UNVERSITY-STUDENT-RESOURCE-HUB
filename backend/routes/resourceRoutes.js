import express from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  downloadResource,
  rateResource,
  commentOnResource,
  bookmarkResource,
  reportResource,
} from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getResources)
  .post(protect, upload.single('file'), createResource);

router.route('/:id')
  .get(getResourceById);

router.route('/:id/download')
  .post(protect, downloadResource);

router.route('/:id/rate')
  .post(protect, rateResource);

router.route('/:id/comment')
  .post(protect, commentOnResource);

router.route('/:id/bookmark')
  .post(protect, bookmarkResource);

router.route('/:id/report')
  .post(protect, reportResource);

export default router;
