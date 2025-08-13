import * as adminRepository from '../repositories/adminRepository.js';
import User from '../models/User.js';

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

  // Get the complaint first to check if status is changing to resolved
  const existingComplaint = await adminRepository.findComplaintById(complaintId);
  if (!existingComplaint) {
    return {
      success: false,
      message: 'Complaint not found',
      status: 404
    };
  }

  const wasResolved = existingComplaint.status === 'resolved';
  const willBeResolved = status === 'resolved';

  const complaint = await adminRepository.updateComplaintStatus(complaintId, status);
  if (!complaint) {
    return {
      success: false,
      message: 'Complaint not found',
      status: 404
    };
  }

  // If status is changing to resolved, increment complaintsResolved for the user
  if (!wasResolved && willBeResolved) {
    await User.findByIdAndUpdate(complaint.submittedBy, { $inc: { complaintsResolved: 1 } });
  }
  // If status is changing from resolved to something else, decrement complaintsResolved
  else if (wasResolved && !willBeResolved) {
    await User.findByIdAndUpdate(complaint.submittedBy, { $inc: { complaintsResolved: -1 } });
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

