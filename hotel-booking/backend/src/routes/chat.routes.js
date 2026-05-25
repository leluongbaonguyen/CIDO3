import { Router } from 'express';
import { protect, optionalProtect, authorize } from '../middlewares/auth.js';
import {
  customerListConversations,
  customerCreateConversation,
  customerGetMessages,
  customerSendMessage,
  customerCloseConversation,
  adminListConversations,
  adminGetConversationDetail,
  adminAssignStaff,
  adminSendMessage,
  adminUpdateStatus,
  adminCloseConversation
} from '../controllers/chat.controller.js';

const router = Router();

// --- CUSTOMER / GUEST ENDPOINTS ---
router.get('/conversations', protect, authorize('CUSTOMER'), customerListConversations);
router.post('/conversations', optionalProtect, customerCreateConversation);
router.get('/conversations/:id/messages', optionalProtect, customerGetMessages);
router.post('/conversations/:id/messages', optionalProtect, customerSendMessage);
router.patch('/conversations/:id/close', optionalProtect, customerCloseConversation);

// --- ADMIN / STAFF ENDPOINTS ---
router.get('/admin/conversations', protect, authorize('ADMIN', 'STAFF'), adminListConversations);
router.get('/admin/conversations/:id', protect, authorize('ADMIN', 'STAFF'), adminGetConversationDetail);
router.patch('/admin/conversations/:id/assign', protect, authorize('ADMIN', 'STAFF'), adminAssignStaff);
router.post('/admin/conversations/:id/messages', protect, authorize('ADMIN', 'STAFF'), adminSendMessage);
router.patch('/admin/conversations/:id/status', protect, authorize('ADMIN', 'STAFF'), adminUpdateStatus);
router.patch('/admin/conversations/:id/close', protect, authorize('ADMIN', 'STAFF'), adminCloseConversation);

export default router;
