import express from 'express';
import {
  getUsers,
  getUser,
  getUserProfile,
  updateUser,
  deleteUser,
  getUserActivity,
  searchUsers,

  updateAvatar
} from '../controllers/userController.js';

import { protect, authorize } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();


// Protected routes
router.get('/profile/:id', protect, getUserProfile);

// Protected routes
router.put('/avatar', protect, uploadAvatar, updateAvatar);


// Admin only routes
router.get('/search', protect, authorize('admin'), searchUsers);
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.get('/:id/activity', protect, authorize('admin'), getUserActivity);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;