// Utility function to normalize avatar paths
export const normalizeAvatarPath = (avatarPath) => {
  if (!avatarPath) return null;
  return avatarPath.replace(/\\/g, '/');
};

// Utility function to get full avatar URL
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  const normalizedPath = normalizeAvatarPath(avatarPath);
  return `http://localhost:5000${normalizedPath}`;
};

// Utility function to normalize user object avatar
export const normalizeUserAvatar = (user) => {
  if (!user) return user;
  if (user.avatar) {
    user.avatar = normalizeAvatarPath(user.avatar);
  }
  return user;
};

// Utility function to normalize array of users
export const normalizeUsersAvatars = (users) => {
  if (!Array.isArray(users)) return users;
  return users.map(user => normalizeUserAvatar(user));
}; 