import express from 'express';
import {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  voteComplaint,
  getMyComplaints,
} from '../controllers/complaintController.js';

import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  voteComment,
} from '../controllers/commentController.js';

import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getComplaints);

// Protected routes
router.get('/user/me', protect, getMyComplaints);
router.post('/', protect, uploadMultiple, createComplaint);
router.post('/:id/vote', protect, voteComplaint);

// Single complaint routes
router.get('/:id', optionalAuth, getComplaint);
router.put('/:id', protect, uploadMultiple, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

// Comment routes
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, uploadMultiple, addComment);
router.put('/:id/comments/:commentId', protect, updateComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.post('/:id/comments/:commentId/vote', protect, voteComment);


export default router; 