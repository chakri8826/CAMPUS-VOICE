import {
  registerUserService,
  loginUserService,
  updateDetailsService,
  updatePasswordService,
} from '../services/authService.js';


// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export async function register(req, res) {
  try {
    const { name, email, department, password, role: reqRole } = req.body;
    const role = reqRole || 'student';

    const result = await registerUserService({ name, email, password, department, role });

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
    console.error('Registration error:', error);
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


// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export async function updateDetails(req, res) {
  try {
    const fieldsToUpdate = {
      email: req.body.email,
      department: req.body.department,
      avatar: req.body.avatar
    };
    
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);
    const result = await updateDetailsService(req.user.id, fieldsToUpdate);
    console.log("result is in updateDetails Controller", result);
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      data: { user: result.fullProfile }
    });
  } catch (error) {
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

