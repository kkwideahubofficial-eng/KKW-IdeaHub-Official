import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth, requireCoordinator } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';

const router = Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', param('id').isMongoId(), getEventById);

// Coordinator-only routes
router.post(
  '/',
  requireAuth,
  requireCoordinator,
  upload.single('image'),
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('description').not().isEmpty().withMessage('Description is required'),
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
    body('organizer').not().isEmpty().withMessage('Organizer is required'),
  ],
  createEvent
);

router.put(
  '/:id',
  requireAuth,
  requireCoordinator,
  upload.single('image'),
  param('id').isMongoId(),
  [
    body('title').optional().not().isEmpty(),
    body('description').optional().not().isEmpty(),
    body('date').optional().isISO8601().toDate(),
    body('organizer').optional().not().isEmpty(),
  ],
  updateEvent
);

router.delete('/:id', requireAuth, requireCoordinator, param('id').isMongoId(), deleteEvent);

export default router;
