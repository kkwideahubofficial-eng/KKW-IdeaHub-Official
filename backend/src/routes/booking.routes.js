import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireAuth, requireCoordinator } from '../middlewares/auth.js';
import { 
  getAvailableSlots, 
  createBooking, 
  getPendingBookings, 
  decideBooking, 
  getDashboardStats 
} from '../controllers/bookingController.js';

const router = Router();

router.get(
  '/available',
  [query('date').isString().matches(/^\d{4}-\d{2}-\d{2}$/)],
  requireAuth,
  getAvailableSlots
);

router.post(
  '/',
  [
    body('slotDate').isString().matches(/^\d{4}-\d{2}-\d{2}$/),
    body('startTime').isString(),
    body('endTime').isString(),
    body('purpose').isString().isLength({ min: 3 }),
    body('description').optional().isString(),
    body('teamName').optional().isString()
  ],
  requireAuth,
  createBooking
);

// Allow team members to see their own pending bookings, coordinators to see all
router.get('/pending', requireAuth, getPendingBookings);

// Only coordinators can approve/reject bookings
router.patch(
  '/:id/decision',
  [param('id').isMongoId(), body('decision').isIn(['approved', 'rejected']), body('reason').optional().isString()],
  requireAuth,
  requireCoordinator,
  decideBooking
);

// Dashboard stats for coordinators only
router.get('/dashboard-stats', requireAuth, requireCoordinator, getDashboardStats);

export default router;

