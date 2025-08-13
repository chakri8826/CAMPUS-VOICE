import * as userRepository from '../repositories/userRepository.js';
import Complaint from '../models/Complaint.js';
import Comment from '../models/Comment.js';
import Vote from '../models/Vote.js';

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
    .select('title category status createdAt likes dislikes')
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
  const user = await userRepository.deleteUserById(id);
  if (!user) return { error: 'User not found' };

  // Delete all complaints submitted by this user
  await Complaint.deleteMany({ submittedBy: id });

  // Delete all comments made by this user
  await Comment.deleteMany({ author: id });

  // Delete all votes made by this user
  await Vote.deleteMany({ user: id });

  return { success: true };
}



export async function getUserActivityService(id) {
  const complaints = await Complaint.find({ submittedBy: id })
    .select('title category status createdAt likes dislikes')
    .sort({ createdAt: -1 });
  return { complaints };
}

export async function searchUsersService({ filter }) {
  const users = await userRepository.searchUsersDB(filter);

  // Normalize avatar paths for all users
  users.forEach(user => {
    if (user.avatar) {
      user.avatar = user.avatar.replace(/\\/g, '/');
    }
  });

  return { users };
}



export async function updateAvatarService(userId, avatarFile) {
  if (!avatarFile) {
    return { error: 'Please upload an image', status: 400 };
  }
  if (!avatarFile.mimetype.startsWith('image/')) {
    return { error: 'Please upload a valid image file', status: 400 };
  }

  let avatarPath;

  // Check if it's a Cloudinary URL (new structure)
  if (avatarFile.url) {
    avatarPath = avatarFile.url;
  } else if (avatarFile.path) {
    // Fallback to local file path (old structure)
    avatarPath = avatarFile.path.replace(/\\/g, '/'); // Normalize Windows path
  } else {
    return { error: 'Invalid file data', status: 400 };
  }

  const user = await userRepository.updateUserAvatar(userId, avatarPath);

  // Return the avatar path (could be Cloudinary URL or local path)
  return { avatar: avatarPath };
} 
