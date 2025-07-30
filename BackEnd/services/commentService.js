import * as commentRepository from '../repositories/commentRepository.js';
import Complaint from '../models/Complaint.js';
import { sendNotification } from '../utils/sendNotification.js';

export async function getCommentsService(complaintId, page, limit) {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) return { error: 'Complaint not found' };
  const comments = await commentRepository.getCommentsForComplaint(complaintId, page, limit);
  const total = await commentRepository.countComments({ complaint: complaintId, parentComment: null, isDeleted: false });
  return { comments, total, complaint };
}

export async function addCommentService({ complaintId, content, parentCommentId, user, uploadedFiles }) {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) return { error: 'Complaint not found' };
  if (parentCommentId) {
    const parentComment = await commentRepository.findCommentById(parentCommentId);
    if (!parentComment) return { error: 'Parent comment not found' };
  }
  const commentData = {
    content,
    complaint: complaintId,
    author: user.id,
    isOfficial: user.role === 'admin' || user.role === 'faculty'
  };
  if (parentCommentId) commentData.parentComment = parentCommentId;
  if (uploadedFiles && uploadedFiles.length > 0) commentData.attachments = uploadedFiles;
  const comment = await commentRepository.createComment(commentData);
  await comment.populate('author', 'name avatar role department');
  await Complaint.findByIdAndUpdate(complaintId, { $push: { comments: comment._id } });
  if (parentCommentId) {
    await commentRepository.findCommentByIdAndUpdate(
      parentCommentId,
      { $push: { replies: comment._id } }
    );
  }
  if (complaint.submittedBy.toString() !== user.id) {
    await sendNotification({
      recipient: complaint.submittedBy,
      type: 'comment_added',
      title: 'New Comment on Your Complaint',
      message: `Someone commented on your complaint "${complaint.title}"`,
      targetType: 'comment',
      targetId: comment._id,
      priority: 'medium'
    });
  }
  if (parentCommentId) {
    const parentComment = await commentRepository.findCommentById(parentCommentId);
    if (parentComment && parentComment.author.toString() !== user.id) {
      await sendNotification({
        recipient: parentComment.author,
        type: 'comment_replied',
        title: 'Reply to Your Comment',
        message: `Someone replied to your comment on "${complaint.title}"`,
        targetType: 'comment',
        targetId: comment._id,
        priority: 'medium'
      });
    }
  }
  return { comment };
}

export async function updateCommentService({ commentId, content, user }) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) return { error: 'Comment not found' };
  if (comment.author.toString() !== user.id && user.role !== 'admin') {
    return { error: 'Not authorized to update this comment', status: 401 };
  }
  comment.content = content;
  await comment.editComment(content);
  await comment.populate('author', 'name avatar role department');
  return { comment };
}

export async function deleteCommentService({ commentId, user }) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) return { error: 'Comment not found' };
  if (comment.author.toString() !== user.id && user.role !== 'admin') {
    return { error: 'Not authorized to delete this comment', status: 401 };
  }
  await comment.softDelete();
  await Complaint.findByIdAndUpdate(comment.complaint, { $pull: { comments: comment._id } });
  if (comment.parentComment) {
    await commentRepository.findCommentByIdAndUpdate(
      comment.parentComment,
      { $pull: { replies: comment._id } }
    );
  }
  return { success: true };
}

export async function voteCommentService({ commentId, voteType, user }) {
  if (!['upvote', 'downvote'].includes(voteType)) {
    return { error: 'Invalid vote type', status: 400 };
  }
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) return { error: 'Comment not found' };
  await comment.addVote(user.id, voteType);
  if (comment.author.toString() !== user.id) {
    await sendNotification({
      recipient: comment.author,
      type: 'vote_received',
      title: 'New Vote on Your Comment',
      message: `Your comment received a ${voteType}`,
      targetType: 'comment',
      targetId: comment._id,
      priority: 'low'
    });
  }
  return { upvotes: comment.upvotes, downvotes: comment.downvotes, voteCount: comment.voteCount };
}

export async function getMyCommentsService({ userId, page, limit }) {
  const comments = await Comment.find({ author: userId, isDeleted: false })
    .populate('complaint', 'title category status')
    .populate('parentComment', 'content')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Comment.countDocuments({ author: userId, isDeleted: false });
  return { comments, total };
}

export async function getCommentStatsService({ complaintId }) {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) return { error: 'Complaint not found' };
  const stats = await commentRepository.aggregateComments([
    { $match: { complaint: complaint._id, isDeleted: false } },
    { $group: {
      _id: null,
      total: { $sum: 1 },
      official: { $sum: { $cond: [{ $eq: ['$isOfficial', true] }, 1, 0] } },
      replies: { $sum: { $cond: [{ $ne: ['$parentComment', null] }, 1, 0] } },
      totalVotes: { $sum: { $add: ['$upvotes', '$downvotes'] } }
    } }
  ]);
  const topCommenters = await commentRepository.aggregateComments([
    { $match: { complaint: complaint._id, isDeleted: false } },
    { $group: { _id: '$author', count: { $sum: 1 }, totalVotes: { $sum: { $add: ['$upvotes', '$downvotes'] } } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  const User = (await import('../models/User.js')).default;
  const populatedTopCommenters = await Promise.all(
    topCommenters.map(async (commenter) => {
      const user = await User.findById(commenter._id).select('name avatar department');
      return { ...commenter, user };
    })
  );
  return {
    complaint: { title: complaint.title, id: complaint._id },
    stats: stats[0] || { total: 0, official: 0, replies: 0, totalVotes: 0 },
    topCommenters: populatedTopCommenters
  };
} 