import User from '../models/User.js';

export async function findUserByEmail(email) {
  return User.findOne({ email }).select('+password');
}

export async function findUserByStudentId(studentId) {
  return User.findOne({ studentId });
}

export async function createUser(userData) {
  return User.create(userData);
}

export async function findUserById(id) {
  return User.findById(id);
}

export async function findUserByIdWithPassword(id) {
  return User.findById(id).select('+password');
}

export async function updateUserById(id, update, options) {
  return User.findByIdAndUpdate(id, update, options);
}

export async function findUsers(filter, page, limit) {
  return User.find(filter)
    .select('-password')

    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function countUsers(filter) {
  return User.countDocuments(filter);
}

export async function findUserProfileById(id) {
  return User.findById(id)
    .select('name avatar department complaintsSubmitted complaintsResolved');
}

export async function updateUserAvatar(id, avatarPath) {
  return User.findByIdAndUpdate(id, { avatar: avatarPath }, { new: true }).select('-password');
}

export async function deleteUserById(id) {
  return User.findByIdAndDelete(id);
}

export async function searchUsersDB(filter) {
  return User.find(filter)
    .select('name email avatardepartment role')
    .sort({ name: 1 });
}

