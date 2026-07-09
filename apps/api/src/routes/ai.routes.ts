import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  generateGig,
  regenerateGigSection,
  getGenerationHistory
} from '../controllers/ai.controller.js';

const router = Router();

// Apply auth middleware to all AI routes
router.use(authMiddleware);

router.post('/generate-gig', generateGig);
router.post('/regenerate-section', regenerateGigSection);
router.get('/history', getGenerationHistory);

export default router;
