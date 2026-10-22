import { Router } from 'express';
import {
  createTrust,
  getTrusts,
  updateTrust,
  updateVerificationStatus,
} from '../controllers/trustController.js';
import { adminOnly, protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect);
router.route('/').post(createTrust).get(getTrusts);
router.put('/:id', updateTrust);
router.patch('/:id/verify', adminOnly, updateVerificationStatus);

export default router;