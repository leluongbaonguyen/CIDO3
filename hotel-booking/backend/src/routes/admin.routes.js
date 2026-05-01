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
  deleteReview,
  updateUserStatus,
  listSupport,
  seedData,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  createEmployee,
  updateEmployee,
  createBooking
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

// Dashboard
router.get('/dashboard', protect, authorize('ADMIN', 'EMPLOYEE'), getDashboardStats);

// Bookings
router.get('/bookings', protect, authorize('ADMIN', 'EMPLOYEE'), listAllBookings);
router.post('/bookings', protect, authorize('ADMIN', 'EMPLOYEE'), createBooking);
router.patch('/bookings/:bookingId/status', protect, authorize('ADMIN', 'EMPLOYEE'), updateBookingStatus);

// Rooms
router.get('/rooms', protect, authorize('ADMIN', 'EMPLOYEE'), listRooms);
router.post('/rooms', protect, authorize('ADMIN', 'EMPLOYEE'), createRoom);
router.put('/rooms/:roomId', protect, authorize('ADMIN', 'EMPLOYEE'), updateRoom);
router.delete('/rooms/:roomId', protect, authorize('ADMIN'), deleteRoom);

// Management Modules
router.get('/customers', protect, authorize('ADMIN', 'EMPLOYEE'), listCustomers);
router.get('/employees', protect, authorize('ADMIN'), listEmployees);
router.post('/employees', protect, authorize('ADMIN'), createEmployee);
router.put('/employees/:id', protect, authorize('ADMIN'), updateEmployee);
router.get('/roles', protect, authorize('ADMIN'), listRoles);

router.get('/room-types', protect, authorize('ADMIN', 'EMPLOYEE'), listRoomTypes);
router.post('/room-types', protect, authorize('ADMIN', 'EMPLOYEE'), createRoomType);
router.put('/room-types/:id', protect, authorize('ADMIN', 'EMPLOYEE'), updateRoomType);
router.delete('/room-types/:id', protect, authorize('ADMIN'), deleteRoomType);

router.get('/amenities', protect, authorize('ADMIN', 'EMPLOYEE'), listAmenities);
router.post('/amenities', protect, authorize('ADMIN', 'EMPLOYEE'), createAmenity);
router.put('/amenities/:id', protect, authorize('ADMIN', 'EMPLOYEE'), updateAmenity);
router.delete('/amenities/:id', protect, authorize('ADMIN'), deleteAmenity);
router.get('/reviews', protect, authorize('ADMIN', 'EMPLOYEE'), listReviews);
router.delete('/reviews/:reviewId', protect, authorize('ADMIN'), deleteReview);

// User Status Management
router.patch('/users/:userId/status', protect, authorize('ADMIN'), updateUserStatus);

router.get('/support', protect, authorize('ADMIN', 'EMPLOYEE'), listSupport);
router.get('/seed-data', seedData); // Tạm thời để public để nạp dữ liệu nhanh

export default router;
