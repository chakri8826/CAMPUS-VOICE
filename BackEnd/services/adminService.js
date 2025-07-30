import * as adminRepository from '../repositories/adminRepository.js';
import { ENV_VARS } from '../config/envVars.js';

export async function getAdminComplaintsService({ page, limit, category, status, priority, search, sortBy, sortOrder }) {
  // Build filter object
  const filter = {};
  if (category && category !== 'All') filter.category = category;
  if (status && status !== 'All') filter.status = status;
  if (priority && priority !== 'All') filter.priority = priority;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  const skip = (page - 1) * limit;
  const sort = {};
  sort[sortBy] = sortOrder;

  const { complaints, total } = await adminRepository.getAdminComplaints({ filter, skip, limit, sort });

  return {
    success: true,
    count: complaints.length,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    },
    data: complaints
  };
}

export async function updateComplaintStatusService({ complaintId, status }) {
  if (!['pending', 'in_progress', 'resolved', 'rejected', 'closed'].includes(status)) {
    return {
      success: false,
      message: 'Invalid status',
      status: 400
    };
  }
  const complaint = await adminRepository.updateComplaintStatus(complaintId, status);
  if (!complaint) {
    return {
      success: false,
      message: 'Complaint not found',
      status: 404
    };
  }
  return {
    success: true,
    message: 'Complaint status updated successfully',
    data: complaint
  };
}

export async function addAdminReplyService({ complaintId, content, userId }) {
  if (!content || content.trim() === '') {
    return {
      success: false,
      message: 'Reply content is required',
      status: 400
    };
  }
  const complaint = await adminRepository.findComplaintById(complaintId);
  if (!complaint) {
    return {
      success: false,
      message: 'Complaint not found',
      status: 404
    };
  }
  const comment = await adminRepository.createAdminReply({ complaintId, content, userId });
  return {
    success: true,
    message: 'Reply added successfully',
    data: comment
  };
}

export async function getAdminDashboardService() {
  return await adminRepository.getAdminDashboard();
}

export async function getAdminHealthService() {
  // Simple health check response, matching /api/health
  return {
    success: true,
    message: 'Campus Voice API is running',
    timestamp: new Date().toISOString(),
    environment: ENV_VARS.NODE_ENV
  };
}

export async function getAdminLogsService() {
  // Placeholder for logs
  return {
    success: true,
    message: 'Logs endpoint - implement logging service integration',
    data: []
  };
}

export async function postAdminMaintenanceService(action) {
  return await adminRepository.handleAdminMaintenance(action);
} 