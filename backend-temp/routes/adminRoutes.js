import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAdminComplaints,
  updateComplaintStatus,
  addAdminReply,
  getAdminDashboard
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/complaints', getAdminComplaints);
router.put('/complaints/:id/status', updateComplaintStatus);
router.post('/complaints/:id/reply', addAdminReply);
router.get('/dashboard', getAdminDashboard);

export default router;