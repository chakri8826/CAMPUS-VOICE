import * as complaintRepository from '../repositories/complaintRepository.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { sendNotification, sendMultipleNotifications } from '../utils/sendNotification.js';
import { assignBadges } from '../utils/assignBadges.js';

export async function getComplaintsService({ filter, page, limit }) {
  const complaints = await complaintRepository.getFilteredComplaints(filter, page, limit);
  const total = await complaintRepository.countComplaints(filter);
  return { complaints, total };
}

export async function getComplaintService(id) {
  const complaint = await complaintRepository.findComplaintById(id);
  if (!complaint) return { error: 'Complaint not found' };
  await complaint.incrementViews();
  return { complaint };
}

export async function createComplaintService({ data, user, uploadedFiles }) {
  data.submittedBy = user.id;
  if (uploadedFiles && uploadedFiles.length > 0) {
    data.attachments = uploadedFiles;
  }
  const complaint = await complaintRepository.createComplaint(data);
  await complaint.populate('submittedBy', 'name avatar department role');
  await User.findByIdAndUpdate(user.id, { $inc: { complaintsSubmitted: 1 } });
  await assignBadges(user.id, 'complaints_submitted');
  const admins = await User.find({ role: 'admin', isActive: true });
  const notifications = admins.map(admin => ({
    recipient: admin._id,
    type: 'complaint_created',
    title: 'New Complaint Submitted',
    message: `A new ${complaint.category} complaint has been submitted: ${complaint.title}`,
    targetType: 'complaint',
    targetId: complaint._id,
    priority: complaint.priority === 'urgent' ? 'high' : 'medium'
  }));
  if (notifications.length > 0) {
    await sendMultipleNotifications(notifications);
  }
  return { complaint };
}

export async function updateComplaintService({ id, data, user, uploadedFiles }) {
  let complaint = await complaintRepository.findComplaintById(id);
  if (!complaint) return { error: 'Complaint not found' };
  if (complaint.submittedBy.toString() !== user.id && user.role !== 'admin') {
    return { error: 'Not authorized to update this complaint', status: 401 };
  }
  if (uploadedFiles && uploadedFiles.length > 0) {
    data.attachments = [...(complaint.attachments || []), ...uploadedFiles];
  }
  complaint = await complaintRepository.updateComplaintById(id, data, { new: true, runValidators: true });
  await complaint.populate('submittedBy', 'name avatar department role');
  if (data.status && data.status !== complaint.status) {
    await sendNotification({
      recipient: complaint.submittedBy._id,
      type: 'complaint_updated',
      title: 'Complaint Status Updated',
      message: `Your complaint "${complaint.title}" status has been updated to ${data.status}`,
      targetType: 'complaint',
      targetId: complaint._id,
      priority: 'medium'
    });
  }
  return { complaint };
}

export async function deleteComplaintService({ id, user }) {
  const complaint = await complaintRepository.findComplaintById(id);
  if (!complaint) return { error: 'Complaint not found' };
  if (complaint.submittedBy.toString() !== user.id && user.role !== 'admin') {
    return { error: 'Not authorized to delete this complaint', status: 401 };
  }
  await Comment.deleteMany({ complaint: complaint._id });
  await complaint.deleteOne();
  return { success: true };
}

export async function voteComplaintService({ id, voteType, user }) {
  if (!['upvote', 'downvote'].includes(voteType)) {
    return { error: 'Invalid vote type', status: 400 };
  }
  const complaint = await complaintRepository.findComplaintById(id);
  if (!complaint) return { error: 'Complaint not found' };
  await complaint.addVote(user.id, voteType);
  if (complaint.submittedBy.toString() !== user.id) {
    await sendNotification({
      recipient: complaint.submittedBy,
      type: 'vote_received',
      title: 'New Vote Received',
      message: `Your complaint "${complaint.title}" received a ${voteType}`,
      targetType: 'complaint',
      targetId: complaint._id,
      priority: 'low'
    });
  }
  return { upvotes: complaint.upvotes, downvotes: complaint.downvotes, voteCount: complaint.voteCount };
}

export async function getMyComplaintsService({ userId, page, limit }) {
  const complaints = await complaintRepository.getFilteredComplaints({ submittedBy: userId }, page, limit);
  const total = await complaintRepository.countComplaints({ submittedBy: userId });
  return { complaints, total };
}

