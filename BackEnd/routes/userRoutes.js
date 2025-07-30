import express from 'express';
import {
  getUsers,
  getUser,
  getUserProfile,
  updateUser,
  deleteUser,
  getUserActivity,
  searchUsers,
  getUserBadges,
  updateAvatar
} from '../controllers/userController.js';

import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/profile/:id', getUserProfile);
router.get('/:id/badges', getUserBadges);

// Protected routes
router.get('/search', protect, searchUsers);
router.put('/avatar', protect, uploadSingle, updateAvatar);

// Admin only routes
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.get('/:id/activity', protect, getUserActivity);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router; 