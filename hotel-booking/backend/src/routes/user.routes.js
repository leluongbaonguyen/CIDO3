import { Router } from 'express';
import { getProfile, updateProfile, createSupportTicket, getMySupportTickets } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.post('/me/tickets', protect, createSupportTicket);
router.get('/me/tickets', protect, getMySupportTickets);

export default router;
