import Complaint from '../models/Complaint.js';

export async function findComplaintById(id) {
  return Complaint.findById(id);
}

export async function createComplaint(data) {
  return Complaint.create(data);
}

export async function updateComplaintById(id, update, options) {
  return Complaint.findByIdAndUpdate(id, update, options);
}

export async function deleteComplaintById(id) {
  return Complaint.findByIdAndDelete(id);
}

export async function getFilteredComplaints(filter, page = 1, limit = 10) {
  return Complaint.getFilteredComplaints(filter, page, limit);
}

export async function countComplaints(filter) {
  return Complaint.countDocuments(filter);
} 