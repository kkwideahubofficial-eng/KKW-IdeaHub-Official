import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth, requireCoordinator } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import {
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
} from '../controllers/achievementController.js';

const router = Router();

// Public routes
router.get('/', getAllAchievements);
router.get('/:id', param('id').isMongoId(), getAchievementById);

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
    body('achievedBy').not().isEmpty().withMessage('Achieved by is required'),
  ],
  createAchievement
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
    body('achievedBy').optional().not().isEmpty(),
  ],
  updateAchievement
);

router.delete('/:id', requireAuth, requireCoordinator, param('id').isMongoId(), deleteAchievement);

export default router;
