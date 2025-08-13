import express from 'express';
import {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getMyComplaints,
} from '../controllers/complaintController.js';

import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';

import { protect } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getComplaints);

// Protected routes
router.get('/user/me', protect, getMyComplaints);
router.post('/', protect, uploadSingle, createComplaint);

// Single complaint routes
router.get('/:id', getComplaint);
router.put('/:id', protect, uploadSingle, updateComplaint);
router.delete('/:id', protect, deleteComplaint);


// Comment routes
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);
router.put('/:id/comments/:commentId', protect, updateComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);


export default router;