import * as complaintRepository from '../repositories/complaintRepository.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';




export async function getComplaintsService({ filter }) {
  const complaints = await complaintRepository.getFilteredComplaints(filter);
  return { complaints };
}

export async function getComplaintService(id) {
  const complaint = await complaintRepository.findComplaintById(id);
  if (!complaint) return { error: 'Complaint not found' };
  return { complaint };
}

export async function createComplaintService({ data, user, uploadedFiles }) {
  data.submittedBy = user.id;

  if (uploadedFiles && uploadedFiles.length > 0) {
    // Cloudinary upload is already handled in middleware
    data.attachments = uploadedFiles;
  }

  const complaint = await complaintRepository.createComplaint(data);
  await complaint.populate('submittedBy', 'name avatar department role');
  await User.findByIdAndUpdate(user.id, { $inc: { complaintsSubmitted: 1 } });

  return { complaint };
}

export async function updateComplaintService({ id, data, user, uploadedFiles }) {
  let complaint = await complaintRepository.findComplaintById(id);
  if (!complaint) return { error: 'Complaint not found' };
  if (complaint.submittedBy.toString() !== user.id && user.role !== 'admin') {
    return { error: 'Not authorized to update this complaint', status: 401 };
  }

  if (uploadedFiles && uploadedFiles.length > 0) {
    // Cloudinary upload is already handled in middleware
    data.attachments = uploadedFiles;
  }

  complaint = await complaintRepository.updateComplaintById(id, data, { new: true, runValidators: true });
  await complaint.populate('submittedBy', 'name avatar department role');
  return { complaint };
}

export async function deleteComplaintService({ id, user }) {
  const complaint = await complaintRepository.findComplaintById(id);
  if (!complaint) return { error: 'Complaint not found' };
  if (complaint.submittedBy.toString() !== user.id && user.role !== 'admin') {
    return { error: 'Not authorized to delete this complaint', status: 401 };
  }

  // Decrement complaintsSubmitted for the user who submitted the complaint
  await User.findByIdAndUpdate(complaint.submittedBy, { $inc: { complaintsSubmitted: -1 } });

  await Comment.deleteMany({ complaint: complaint._id });
  await complaint.deleteOne();
  return { success: true };
}

export async function getMyComplaintsService({ userId }) {
  const complaints = await complaintRepository.getFilteredComplaints({ submittedBy: userId });
  return { complaints };
}
