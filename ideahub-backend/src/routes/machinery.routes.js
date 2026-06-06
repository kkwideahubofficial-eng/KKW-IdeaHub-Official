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
  // Cloudinary storage provides the URL in req.file.path
  const url = req.file.path;
  res.json({ url });
});



// --- Machinery Management Routes ---

// --- Machinery Request Routes ---

// Create request (Student)
router.post('/requests', requireAuth, requestController.createRequest);

// Get requests (Head views all, Student views theirs)
router.get('/requests', requireAuth, requestController.getRequests);

// Update request status (Head only)
// Update request status (Head or Coordinator)
router.patch('/requests/:id/status', requireAuth, requireCoordinator, requestController.updateRequestStatus);

// Download machinery request PDF
router.get('/requests/:id/pdf', requireAuth, requestController.downloadMachineryPdf);


// --- Machinery Management Routes ---

// Get all machinery (Public/Auth)
router.get('/', requireAuth, machineryController.getAllMachinery);

// Create machinery (Head or Coordinator)
router.post('/', requireAuth, requireCoordinator, machineryController.createMachinery);

// Route for getting machinery records (Coordinator, Head, Admin only)
router.get('/records', requireAuth, requireCoordinator, machineryController.getMachineryRecords);

// Get single machinery details (Dynamic parameter :id matches anything, so keep at bottom)
router.get('/:id', requireAuth, machineryController.getMachineryById);

// Update machinery (Head or Coordinator)
router.put('/:id', requireAuth, requireCoordinator, machineryController.updateMachinery);

// Get availability stats
router.get('/:id/availability', requireAuth, machineryController.getMachineryAvailability);

// Delete machinery (Head or Coordinator)
router.delete('/:id', requireAuth, requireCoordinator, machineryController.deleteMachinery);

export default router;
