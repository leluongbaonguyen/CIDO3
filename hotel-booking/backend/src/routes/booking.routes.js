import { Router } from 'express';
import { cancelBooking, createBooking, myBookings, payBooking } from '../controllers/booking.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/', protect, authorize('CUSTOMER'), createBooking);
router.get('/mine', protect, authorize('CUSTOMER'), myBookings);
router.post('/:bookingId/pay', protect, authorize('CUSTOMER'), payBooking);
router.patch('/:bookingId/cancel', protect, authorize('CUSTOMER'), cancelBooking);

export default router;
