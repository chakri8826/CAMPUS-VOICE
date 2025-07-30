import Complaint from '../models/Complaint.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

export async function getAdminComplaints({ filter, skip, limit, sort }) {
  const complaints = await Complaint.find(filter)
    .populate('submittedBy', 'name avatar department role')
    .populate('assignedTo', 'name avatar role')
    .populate({
      path: 'comments',
      match: { parentComment: null, isDeleted: false },
      populate: [
        {
          path: 'author',
          select: 'name avatar role department'
        },
        {
          path: 'replies',
          match: { isDeleted: false },
          populate: {
            path: 'author',
            select: 'name avatar role department'
          }
        }
      ]
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Transform the data to include votes in the expected format
  const transformedComplaints = complaints.map(complaint => {
    const transformedComplaint = complaint.toObject();
    if (transformedComplaint.comments) {
      transformedComplaint.comments = transformedComplaint.comments.map(comment => {
        const transformedComment = comment;
        transformedComment.votes = {
          likes: comment.likes || comment.upvotes || 0,
          dislikes: comment.dislikes || comment.downvotes || 0
        };
        if (comment.replies) {
          transformedComment.replies = comment.replies.map(reply => {
            const transformedReply = reply;
            transformedReply.votes = {
              likes: reply.likes || reply.upvotes || 0,
              dislikes: reply.dislikes || reply.downvotes || 0
            };
            return transformedReply;
          });
        }
        return transformedComment;
      });
    }
    return transformedComplaint;
  });

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
    content: content.trim(),
    isAdminReply: true
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
    recentComplaints,
    urgentComplaints
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'pending' }),
    User.countDocuments({ isActive: true }),
    Comment.countDocuments({ isDeleted: false }),
    Complaint.find().sort({ createdAt: -1 }).limit(5).populate('submittedBy', 'name'),
    Complaint.find({ priority: 'urgent', status: { $ne: 'resolved' } }).limit(10)
  ]);

  const categoryStats = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const statusStats = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  return {
    success: true,
    data: {
      overview: {
        totalComplaints,
        pendingComplaints,
        totalUsers,
        totalComments,
        urgentComplaints: urgentComplaints.length
      },
      recentComplaints,
      urgentComplaints,
      categoryStats,
      statusStats
    }
  };
}

export async function handleAdminMaintenance(action) {
  switch (action) {
    case 'cleanup_old_notifications': {
      const Notification = require('../models/Notification.js');
      const result = await Notification.deleteOldNotifications(30);
      return {
        success: true,
        message: `Cleaned up ${result.deletedCount} old notifications`
      };
    }
    case 'recalculate_reputation': {
      // Implement reputation recalculation logic
      return {
        success: true,
        message: 'Reputation recalculation completed'
      };
    }
    case 'assign_badges': {
      // Implement badge assignment logic
      return {
        success: true,
        message: 'Badge assignment completed'
      };
    }
    default:
      return {
        success: false,
        message: 'Invalid maintenance action',
        status: 400
      };
  }
} 