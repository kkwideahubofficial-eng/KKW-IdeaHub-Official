import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth, requireCoordinator } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { listProducts, createProduct, deleteProduct } from '../controllers/productController.js';

const router = Router();

router.get('/', listProducts);

router.post(
  '/',
  requireAuth,
  requireCoordinator,
  upload.single('image'),
  [
    body('title').not().isEmpty(),
    body('description').not().isEmpty(),
    body('price').isFloat({ min: 0 }),
  ],
  createProduct
);

router.delete('/:id', requireAuth, requireCoordinator, param('id').isMongoId(), deleteProduct);

export default router;


