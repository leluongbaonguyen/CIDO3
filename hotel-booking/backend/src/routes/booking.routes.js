import { Router } from 'express';
import { 
  createBooking, 
  myBookings, 
  getBookingDetail, 
  cancelBooking,
  validateVoucher,
  createReview
} from '../controllers/booking.controller.js';
import { protect, optionalProtect, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/', optionalProtect, createBooking);
router.get('/validate-voucher/:code', validateVoucher);
router.get('/my', protect, authorize('CUSTOMER'), myBookings);
router.get('/:id', protect, getBookingDetail);
router.patch('/:id/cancel', protect, cancelBooking);
router.post('/:id/reviews', protect, createReview);

export default router;
