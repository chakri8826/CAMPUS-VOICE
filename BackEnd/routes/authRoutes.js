import express from 'express';
import {
  register,
  login,
  updateDetails,
  updatePassword,
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

export default router;