import {
  getUsersService,
  getUserService,
  getUserProfileService,
  updateUserService,
  deleteUserService,
  getUserActivityService,
  searchUsersService,
  getUserBadgesService,
  updateAvatarService
} from '../services/userService.js';

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const role = req.query.role;
    const department = req.query.department;
    const isActive = req.query.isActive;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const result = await getUsersService({ filter, page, limit });
    res.status(200).json({
      success: true,
      count: result.users.length,
      pagination: {
        current: page,
        pages: Math.ceil(result.total / limit),
        total: result.total
      },
      data: result.users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export async function getUser(req, res) {
  try {
    const result = await getUserService(req.params.id);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, data: result.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Public
export async function getUserProfile(req, res) {
  try {
    const result = await getUserProfileService(req.params.id);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        recentComplaints: result.recentComplaints
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export async function updateUser(req, res) {
  try {
    const result = await updateUserService(req.params.id, req.body);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, message: 'User updated successfully', data: result.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export async function deleteUser(req, res) {
  try {
    const result = await deleteUserService(req.params.id);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
 

// @desc    Get user's activity
// @route   GET /api/users/:id/activity
// @access  Private
export async function getUserActivity(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await getUserActivityService(req.params.id, page, limit);
    res.status(200).json({
      success: true,
      count: result.complaints.length,
      pagination: {
        current: page,
        pages: Math.ceil(result.total / limit),
        total: result.total
      },
      data: result.complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
export async function searchUsers(req, res) {
  try {
    const { q, role, department } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = { isActive: true };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { studentId: { $regex: q, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (department) filter.department = department;
    const result = await searchUsersService({ filter, page, limit });
    res.status(200).json({
      success: true,
      count: result.users.length,
      pagination: {
        current: page,
        pages: Math.ceil(result.total / limit),
        total: result.total
      },
      data: result.users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Get user badges
// @route   GET /api/users/:id/badges
// @access  Public
export async function getUserBadges(req, res) {
  try {
    const result = await getUserBadgesService(req.params.id);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, data: result.badges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
export async function updateAvatar(req, res) {
  try {
    const avatarFile = req.uploadedFiles && req.uploadedFiles[0];
    const result = await updateAvatarService(req.user.id, avatarFile);
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }
    res.status(200).json({ success: true, message: 'Avatar updated successfully', data: { avatar: result.avatar } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
 