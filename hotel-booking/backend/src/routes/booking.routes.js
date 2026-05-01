import { Router } from 'express';
import { cancelBooking, createBooking, myBookings, payBooking } from '../controllers/booking.controller.js';
import { protect, authorize, optionalProtect } from '../middlewares/auth.js';

const router = Router();

router.post('/', optionalProtect, createBooking);
router.get('/mine', protect, authorize('CUSTOMER'), myBookings);
router.post('/:bookingId/pay', optionalProtect, payBooking);
router.patch('/:bookingId/cancel', protect, authorize('CUSTOMER'), cancelBooking);

export default router;
