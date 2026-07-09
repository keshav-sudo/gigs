import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getGigs,
  createGig,
  getGigById,
  updateGig,
  deleteGig
} from '../controllers/gig.controller.js';

const router = Router();

// Apply auth middleware to all gig routes
router.use(authMiddleware);

router.get('/', getGigs);
router.post('/', createGig);
router.get('/:id', getGigById);
router.patch('/:id', updateGig);
router.delete('/:id', deleteGig);

export default router;
