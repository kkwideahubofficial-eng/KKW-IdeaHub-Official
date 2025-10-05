import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login } from '../controllers/authController.js';

const router = Router();

// Validation chains
const validateSignup = [
  body('name').isString().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min length 6'),
  body('role').optional().isIn(['team', 'coordinator']).withMessage('Invalid role'),
  body('teamName').optional().isString(),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isString().withMessage('Password required'),
];

// Simple validation error handler
function handleValidation(req, res, next) {
  const { validationErrors } = req;
  next();
}

import { validationResult } from 'express-validator';
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
}

router.post('/signup', validateSignup, validate, signup);
router.post('/login', validateLogin, validate, login);

export default router;

