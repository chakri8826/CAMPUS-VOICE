import * as commentRepository from '../repositories/commentRepository.js';
import Complaint from '../models/Complaint.js';
import Comment from '../models/Comment.js';

export async function getCommentsService(complaintId) {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) return { error: 'Complaint not found' };
  const comments = await commentRepository.getCommentsForComplaint(complaintId);
  return { comments, complaint };
}

export async function addCommentService({ complaintId, content, user }) {
  const commentData = {
    content,
    complaint: complaintId,
    author: user.id,
    isOfficial: user.role === 'admin' || user.role === 'faculty'
  };
  const comment = await commentRepository.createComment(commentData);
  await comment.populate('author', 'name department');
  await Complaint.findByIdAndUpdate(complaintId, { $push: { comments: comment._id } });
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
  await comment.populate('author', 'name department');
  return { comment };
}

export async function deleteCommentService({ commentId, user }) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) return { error: 'Comment not found' };
  if (comment.author.toString() !== user.id && user.role !== 'admin') {
    return { error: 'Not authorized to delete this comment', status: 401 };
  }
  // Hard delete the comment
  await Comment.deleteOne({ _id: commentId });
  await Complaint.findByIdAndUpdate(comment.complaint, { $pull: { comments: comment._id } });
  return { success: true };
}

export async function getMyCommentsService({ userId }) {
  const comments = await Comment.find({ author: userId })
    .populate('complaint', 'title category status')
    .sort({ createdAt: -1 });
  return { comments };
}

