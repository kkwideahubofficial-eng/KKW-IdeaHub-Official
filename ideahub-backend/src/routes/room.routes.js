import express from 'express';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { requireAuth, requireCoordinator } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', requireAuth, getRooms);
router.post('/', requireAuth, requireCoordinator, createRoom);
router.put('/:id', requireAuth, requireCoordinator, updateRoom);
router.delete('/:id', requireAuth, requireCoordinator, deleteRoom);

export default router;
