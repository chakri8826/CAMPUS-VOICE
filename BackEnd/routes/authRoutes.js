import express from 'express';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword,
  verifyAccount
} from '../controllers/authController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/logout', protect, logout);
router.post('/verify', protect, verifyAccount);

export default router; 