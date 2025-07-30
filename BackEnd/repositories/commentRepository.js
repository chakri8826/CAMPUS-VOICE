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

export async function findCommentByIdAndUpdate(id, update, options) {
  return Comment.findByIdAndUpdate(id, update, options);
}

export async function getCommentsForComplaint(complaintId, page = 1, limit = 10) {
  return Comment.getCommentsForComplaint(complaintId, page, limit);
}

export async function countComments(filter) {
  return Comment.countDocuments(filter);
}

export async function aggregateComments(pipeline) {
  return Comment.aggregate(pipeline);
} 