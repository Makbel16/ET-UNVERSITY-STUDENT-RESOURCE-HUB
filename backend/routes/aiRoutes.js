import express from 'express';
import {
  naturalLanguageSearch,
  summarizeResource,
  generateQuiz,
  chatAssistant,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/search', naturalLanguageSearch);
router.post('/summarize/:resourceId', protect, summarizeResource);
router.post('/quiz/:resourceId', protect, generateQuiz);
router.post('/chat', protect, chatAssistant);

export default router;
