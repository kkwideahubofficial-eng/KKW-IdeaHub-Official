import express from 'express';
import { requireAuth, requireCoordinator } from '../middlewares/auth.js';
import * as machineryController from '../controllers/machineryController.js';
import * as requestController from '../controllers/machineryRequestController.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Upload generic image (Machinery or Request photos)
router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Construct URL. Since server.js serves '/uploads', we return that path.
  // Note: Adjust if your server URL needs to be absolute
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url });
});

// Middleware to check if user is Head
const requireHead = (req, res, next) => {
  if (req.user && (req.user.role === 'head' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Setup requires Head role.' });
  }
};

// --- Machinery Management Routes ---

// --- Machinery Request Routes ---

// Create request (Student)
router.post('/requests', requireAuth, requestController.createRequest);

// Get requests (Head views all, Student views theirs)
router.get('/requests', requireAuth, requestController.getRequests);

// Update request status (Head only)
router.patch('/requests/:id/status', requireAuth, requireHead, requestController.updateRequestStatus);


// --- Machinery Management Routes ---

// Get all machinery (Public/Auth)
router.get('/', requireAuth, machineryController.getAllMachinery);

// Create machinery (Head only)
router.post('/', requireAuth, requireHead, machineryController.createMachinery);

// Route for getting machinery records (Coordinator, Head, Admin only)
router.get('/records', requireAuth, requireCoordinator, machineryController.getMachineryRecords);

// Get single machinery details (Dynamic parameter :id matches anything, so keep at bottom)
router.get('/:id', requireAuth, machineryController.getMachineryById);

// Update machinery (Head only)
router.put('/:id', requireAuth, requireHead, machineryController.updateMachinery);

// Get availability stats
router.get('/:id/availability', requireAuth, machineryController.getMachineryAvailability);

// Delete machinery (Head only)
router.delete('/:id', requireAuth, requireHead, machineryController.deleteMachinery);

export default router;
