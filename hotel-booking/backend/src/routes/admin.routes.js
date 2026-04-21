import { Router } from 'express';
import { createRoom, deleteRoom, listAllBookings, updateBookingStatus, updateRoom } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/bookings', protect, authorize('ADMIN', 'STAFF'), listAllBookings);
router.patch('/bookings/:bookingId/status', protect, authorize('ADMIN', 'STAFF'), updateBookingStatus);
router.post('/rooms', protect, authorize('ADMIN', 'STAFF'), createRoom);
router.put('/rooms/:roomId', protect, authorize('ADMIN', 'STAFF'), updateRoom);
router.delete('/rooms/:roomId', protect, authorize('ADMIN'), deleteRoom);

export default router;
