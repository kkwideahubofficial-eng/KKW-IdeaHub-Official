import express from 'express';
import { requireAuth, requireCoordinator } from '../middlewares/auth.js';
import {
  checkRoomAvailability,
  createRoomRequest,
  updateRoomRequest,
  facultyVerifyRequest,
  coordinatorDecision,
  headDecision,
  cancelRequest,
  getRoomRequests,
  getRoomRequestById,
  getStudentStats,
  getCoordinatorStats,
  getHeadStats,
  getAnalytics,
  getCalendarBookings,
  getRoomInventory,
  downloadRoomPermissionPdf,
  sendManualReminder
} from '../controllers/roomPermissionController.js';

const router = express.Router();

// Publicly accessible endpoints (e.g. for faculty email actions or QR scanner)
router.put('/:id/faculty-verify', facultyVerifyRequest);
router.get('/:id/verify-public', getRoomRequestById);

// Authenticated Routes
router.get('/availability', requireAuth, checkRoomAvailability);
router.get('/inventory', requireAuth, getRoomInventory);
router.post('/submit', requireAuth, createRoomRequest);
router.put('/:id/update', requireAuth, updateRoomRequest);
router.put('/:id/cancel', requireAuth, cancelRequest);
router.get('/student-stats', requireAuth, getStudentStats);
router.get('/coordinator-stats', requireAuth, requireCoordinator, getCoordinatorStats);
router.get('/head-stats', requireAuth, requireCoordinator, getHeadStats);
router.get('/analytics', requireAuth, requireCoordinator, getAnalytics);
router.get('/calendar-bookings', requireAuth, requireCoordinator, getCalendarBookings);
router.get('/', requireAuth, getRoomRequests);
router.get('/:id', requireAuth, getRoomRequestById);
router.get('/:id/pdf', downloadRoomPermissionPdf);
router.post('/:id/send-reminder', requireAuth, requireCoordinator, sendManualReminder);
router.put('/:id/coordinator-decision', requireAuth, requireCoordinator, coordinatorDecision);
router.put('/:id/head-decision', requireAuth, requireCoordinator, headDecision);

export default router;
