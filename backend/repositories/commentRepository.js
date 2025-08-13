import Comment from '../models/Comment.js';

export async function findCommentById(id) {
  return Comment.findById(id);
}

export async function createComment(data) {
  return Comment.create(data);
}

export async function updateCommentById(id, update, options) {
  return Comment.findByIdAndUpdate(id, update, options);
}

export async function getCommentsForComplaint(complaintId) {
  return Comment.getCommentsForComplaint(complaintId);
}

export async function aggregateComments(pipeline) {
  return Comment.aggregate(pipeline);
}