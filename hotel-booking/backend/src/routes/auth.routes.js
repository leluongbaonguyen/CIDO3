import { Router } from 'express';
import { getProfile, updateProfile, login, register, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
