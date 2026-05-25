import { Router } from 'express';
import { 
  getDashboardStats, 
  listAllBookings, 
  listRooms, 
  createRoom, 
  updateRoom, 
  listEmployees,
  createEmployee,
  updateEmployee,
  listRoomTypes,
  listAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  confirmBooking,
  checkIn,
  checkOut,
  updateRoomStatus,
  listCustomers,
  updateUserStatus,
  listSupportTickets,
  listReviews,
  deleteReview,
  toggleReviewVisibility,
  updateSupportTicketStatus,
  getBookingDetail,
  qrCheckIn,
  resendVoucher
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

// Dashboard
router.get('/dashboard', protect, authorize('ADMIN', 'STAFF'), getDashboardStats);

// Bookings
router.get('/bookings', protect, authorize('ADMIN', 'STAFF'), listAllBookings);
router.get('/bookings/:id', protect, authorize('ADMIN', 'STAFF'), getBookingDetail);
router.patch('/bookings/:id/confirm', protect, authorize('ADMIN', 'STAFF'), confirmBooking);
router.patch('/bookings/:id/check-in', protect, authorize('ADMIN', 'STAFF'), checkIn);
router.patch('/bookings/:id/check-out', protect, authorize('ADMIN', 'STAFF'), checkOut);
router.post('/bookings/qr-check-in', protect, authorize('ADMIN', 'STAFF'), qrCheckIn);
router.post('/bookings/qr-checkin', protect, authorize('ADMIN', 'STAFF'), qrCheckIn);
router.post('/bookings/:id/resend-voucher', protect, authorize('ADMIN', 'STAFF'), resendVoucher);

// Rooms
router.get('/rooms', protect, authorize('ADMIN', 'STAFF'), listRooms);
router.post('/rooms', protect, authorize('ADMIN', 'STAFF'), createRoom);
router.put('/rooms/:roomId', protect, authorize('ADMIN', 'STAFF'), updateRoom);
router.patch('/rooms/:roomId/status', protect, authorize('ADMIN', 'STAFF'), updateRoomStatus);


// Customers
router.get('/customers', protect, authorize('ADMIN', 'STAFF'), listCustomers);
router.patch('/users/:id/status', protect, authorize('ADMIN', 'STAFF'), updateUserStatus);

// Management
router.get('/employees', protect, authorize('ADMIN'), listEmployees);
router.post('/employees', protect, authorize('ADMIN'), createEmployee);
router.put('/employees/:id', protect, authorize('ADMIN'), updateEmployee);
router.get('/room-types', protect, authorize('ADMIN', 'STAFF'), listRoomTypes);
router.post('/room-types', protect, authorize('ADMIN', 'STAFF'), createRoomType);
router.put('/room-types/:id', protect, authorize('ADMIN', 'STAFF'), updateRoomType);
router.delete('/room-types/:id', protect, authorize('ADMIN', 'STAFF'), deleteRoomType);
router.get('/amenities', protect, authorize('ADMIN', 'STAFF'), listAmenities);
router.post('/amenities', protect, authorize('ADMIN', 'STAFF'), createAmenity);
router.put('/amenities/:id', protect, authorize('ADMIN', 'STAFF'), updateAmenity);
router.delete('/amenities/:id', protect, authorize('ADMIN', 'STAFF'), deleteAmenity);
router.get('/support', protect, authorize('ADMIN', 'STAFF'), listSupportTickets);
router.put('/support/:id/status', protect, authorize('ADMIN', 'STAFF'), updateSupportTicketStatus);
router.get('/reviews', protect, authorize('ADMIN', 'STAFF'), listReviews);
router.patch('/reviews/:id/visibility', protect, authorize('ADMIN', 'STAFF'), toggleReviewVisibility);
router.delete('/reviews/:id', protect, authorize('ADMIN'), deleteReview);

export default router;
