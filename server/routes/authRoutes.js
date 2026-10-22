import { Router } from 'express';
import { getMe, guestLogin, login, register } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.get('/me', protect, getMe);

export default router;