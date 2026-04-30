import { Router } from 'express';
import { 
  getDashboardStats, 
  listAllBookings, 
  updateBookingStatus, 
  listRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  listCustomers,
  listEmployees,
  listRoles,
  listRoomTypes,
  listAmenities,
  listReviews,
  listSupport
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

// Dashboard
router.get('/dashboard', protect, authorize('ADMIN', 'STAFF'), getDashboardStats);

// Bookings
router.get('/bookings', protect, authorize('ADMIN', 'STAFF'), listAllBookings);
router.patch('/bookings/:bookingId/status', protect, authorize('ADMIN', 'STAFF'), updateBookingStatus);

// Rooms
router.get('/rooms', protect, authorize('ADMIN', 'STAFF'), listRooms);
router.post('/rooms', protect, authorize('ADMIN', 'STAFF'), createRoom);
router.put('/rooms/:roomId', protect, authorize('ADMIN', 'STAFF'), updateRoom);
router.delete('/rooms/:roomId', protect, authorize('ADMIN'), deleteRoom);

// Management Modules
router.get('/customers', protect, authorize('ADMIN', 'STAFF'), listCustomers);
router.get('/employees', protect, authorize('ADMIN'), listEmployees);
router.get('/roles', protect, authorize('ADMIN'), listRoles);
router.get('/room-types', protect, authorize('ADMIN', 'STAFF'), listRoomTypes);
router.get('/amenities', protect, authorize('ADMIN', 'STAFF'), listAmenities);
router.get('/reviews', protect, authorize('ADMIN', 'STAFF'), listReviews);
router.get('/support', protect, authorize('ADMIN', 'STAFF'), listSupport);

export default router;
