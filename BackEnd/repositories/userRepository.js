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

export async function findUserByIdWithBadges(id) {
  return User.findById(id).populate('badges', 'name icon color description');
}

export async function findUserByIdAndUpdate(id, update, options) {
  return User.findByIdAndUpdate(id, update, options);
}

export async function findUserByEmailExcludeId(email, excludeId) {
  return User.findOne({ email, _id: { $ne: excludeId } });
}

export async function findUserByIdWithPassword(id) {
  return User.findById(id).select('+password');
}

export async function findUserByResetToken(resetPasswordToken) {
  return User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
}

export async function updateUserById(id, update, options) {
  return User.findByIdAndUpdate(id, update, options);
}

export async function findUsers(filter, page = 1, limit = 10) {
  return User.find(filter)
    .select('-password')
    .populate('badges', 'name icon color description')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function countUsers(filter) {
  return User.countDocuments(filter);
}

export async function findUserProfileById(id) {
  return User.findById(id)
    .select('name avatar department year role reputation complaintsSubmitted complaintsResolved badges createdAt')
    .populate('badges', 'name icon color description rarity');
}

export async function updateUserAvatar(id, avatarPath) {
  return User.findByIdAndUpdate(id, { avatar: avatarPath }, { new: true }).select('-password');
}

export async function softDeleteUserById(id) {
  return User.findByIdAndUpdate(id, { isActive: false }, { new: true });
}

export async function aggregateUserStats() {
  return User.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        verified: { $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] } },
        students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
        faculty: { $sum: { $cond: [{ $eq: ['$role', 'faculty'] }, 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
      }
    }
  ]);
}

export async function aggregateDepartmentStats() {
  return User.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
}

export async function findTopUsers() {
  return User.find({ isActive: true })
    .select('name avatar department reputation complaintsSubmitted complaintsResolved')
    .sort({ reputation: -1 })
    .limit(10);
}

export async function searchUsersDB(filter, page = 1, limit = 10) {
  return User.find(filter)
    .select('name avatar department year role reputation')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function findUserBadgesById(id) {
  return User.findById(id).populate('badges', 'name icon color description rarity category');
} 

