import Complaint from '../models/Complaint.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

export async function getAdminComplaints({ filter, skip, limit, sort }) {
  const complaints = await Complaint.find(filter)
    .populate('submittedBy', 'name avatar department role')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'name avatar role department'
      }
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const transformedComplaints = complaints.map(complaint => complaint.toObject());

  const total = await Complaint.countDocuments(filter);
  return { complaints: transformedComplaints, total };
}

export async function updateComplaintStatus(complaintId, status) {
  return Complaint.findByIdAndUpdate(
    complaintId,
    { status },
    { new: true, runValidators: true }
  ).populate('submittedBy', 'name avatar department role');
}

export async function findComplaintById(complaintId) {
  return Complaint.findById(complaintId);
}

export async function createAdminReply({ complaintId, content, userId }) {
  const comment = await Comment.create({
    complaint: complaintId,
    author: userId,
    content: content.trim()
  });
  await comment.populate('author', 'name avatar role department');
  return comment;
}

export async function getAdminDashboard() {
  const [
    totalComplaints,
    pendingComplaints,
    totalUsers,
    totalComments,
    recentComplaints
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'pending' }),
    User.countDocuments(),
    Comment.countDocuments(),
    Complaint.find().sort({ createdAt: -1 }).limit(5).populate('submittedBy', 'name')
  ]);


  return {
    success: true,
    data: {
      overview: {
        totalComplaints,
        pendingComplaints,
        totalUsers,
        totalComments
      },
      recentComplaints
    }
  };
}

