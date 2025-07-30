import * as userRepository from '../repositories/userRepository.js';
import Complaint from '../models/Complaint.js';

export async function getUsersService({ filter, page, limit }) {
  const users = await userRepository.findUsers(filter, page, limit);
  
  // Normalize avatar paths for all users
  users.forEach(user => {
    if (user.avatar) {
      user.avatar = user.avatar.replace(/\\/g, '/');
    }
  });
  
  const total = await userRepository.countUsers(filter);
  return { users, total };
}

export async function getUserService(id) {
  const user = await userRepository.findUserById(id);
  if (!user) return { error: 'User not found' };
  
  // Normalize avatar path
  if (user.avatar) {
    user.avatar = user.avatar.replace(/\\/g, '/');
  }
  
  return { user };
}

export async function getUserProfileService(id) {
  const user = await userRepository.findUserProfileById(id);
  if (!user) return { error: 'User not found' };
  
  // Normalize avatar path
  if (user.avatar) {
    user.avatar = user.avatar.replace(/\\/g, '/');
  }
  
  const recentComplaints = await Complaint.find({ submittedBy: user._id })
    .select('title category status createdAt upvotes downvotes')
    .sort({ createdAt: -1 })
    .limit(5);
  return { user, recentComplaints };
}

export async function updateUserService(id, data) {
  const user = await userRepository.updateUserById(id, data);
  if (!user) return { error: 'User not found' };
  
  // Normalize avatar path
  if (user.avatar) {
    user.avatar = user.avatar.replace(/\\/g, '/');
  }
  
  return { user };
}

export async function deleteUserService(id) {
  const user = await userRepository.softDeleteUserById(id);
  if (!user) return { error: 'User not found' };
  return { success: true };
}

export async function getUserStatsService() {
  const stats = await userRepository.aggregateUserStats();
  const departmentStats = await userRepository.aggregateDepartmentStats();
  const topUsers = await userRepository.findTopUsers();
  
  // Normalize avatar paths for top users
  topUsers.forEach(user => {
    if (user.avatar) {
      user.avatar = user.avatar.replace(/\\/g, '/');
    }
  });
  
  return {
    overall: stats[0] || {
      total: 0, active: 0, verified: 0, students: 0, faculty: 0, admins: 0
    },
    byDepartment: departmentStats,
    topUsers
  };
}

export async function getUserActivityService(id, page, limit) {
  const complaints = await Complaint.find({ submittedBy: id })
    .select('title category status createdAt upvotes downvotes')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Complaint.countDocuments({ submittedBy: id });
  return { complaints, total };
}

export async function searchUsersService({ filter, page, limit }) {
  const users = await userRepository.searchUsersDB(filter, page, limit);
  
  // Normalize avatar paths for all users
  users.forEach(user => {
    if (user.avatar) {
      user.avatar = user.avatar.replace(/\\/g, '/');
    }
  });
  
  const total = await userRepository.countUsers(filter);
  return { users, total };
}

export async function getUserBadgesService(id) {
  const user = await userRepository.findUserBadgesById(id);
  if (!user) return { error: 'User not found' };
  return { badges: user.badges };
}

export async function updateAvatarService(userId, avatarFile) {
  if (!avatarFile) {
    return { error: 'Please upload an image', status: 400 };
  }
  if (!avatarFile.mimetype.startsWith('image/')) {
    return { error: 'Please upload a valid image file', status: 400 };
  }
  
  // After saving file:
  const avatarPath = avatarFile.path.replace(/\\/g, '/'); // Normalize Windows path
  
  const user = await userRepository.updateUserAvatar(userId, avatarPath);
  
  // Normalize the returned avatar path
  const normalizedAvatar = user.avatar?.replace(/\\/g, '/');
  
  return { avatar: normalizedAvatar };
} 