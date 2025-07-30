import {
  registerUserService,
  loginUserService,
  getMeService,
  updateDetailsService,
  updatePasswordService,
  forgotPasswordService,
  resetPasswordService,
  verifyAccountService
} from '../services/authService.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export async function register(req, res) {
  try {
    const { name, email, password, department, year, role: reqRole } = req.body;
    // Use provided role if present (admin registration), otherwise default to student
    const role = reqRole || 'student';
    const result = await registerUserService({ name, email, password, department, year, role });
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user.fullProfile,
        token: result.token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await loginUserService({ email, password });
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user.fullProfile,
        token: result.token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export async function getMe(req, res) {
  try {
    const user = await getMeService(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user: user.fullProfile,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export async function updateDetails(req, res) {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      department: req.body.department,
      year: req.body.year,
      avatar: req.body.avatar
    };
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);
    const result = await updateDetailsService(req.user.id, fieldsToUpdate);
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      data: { user: result.fullProfile }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await updatePasswordService(req.user.id, currentPassword, newPassword);
    if (result.error) {
      return res.status(401).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: { token: result.token }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export async function logout(req, res) {
  try {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      data: { resetToken: result.resetToken }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export async function resetPassword(req, res) {
  try {
    const { password } = req.body;
    const { resettoken } = req.params;
    const result = await resetPasswordService(resettoken, password);
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: { token: result.token }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// @desc    Verify account
// @route   POST /api/auth/verify
// @access  Private
export async function verifyAccount(req, res) {
  try {
    const user = await verifyAccountService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      data: { user: user.fullProfile }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
} 