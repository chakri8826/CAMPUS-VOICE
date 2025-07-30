import * as userRepository from '../repositories/userRepository.js';
import { sendNotification } from '../utils/sendNotification.js';
import crypto from 'crypto';

export async function registerUserService({ name, email, password, studentId, department, year, role }) {
  try {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      return { error: 'User with this email already exists' };
    }
    if (studentId) {
      const existingStudentId = await userRepository.findUserByStudentId(studentId);
      if (existingStudentId) {
        return { error: 'Student ID already registered' };
      }
    }
    const user = await userRepository.createUser({
      name,
      email,
      password,
      studentId,
      department,
      year,
      ...(role && { role })
    });
    const token = user.getSignedJwtToken();
    await sendNotification({
      recipient: user._id,
      type: 'system_alert',
      title: 'Welcome to Campus Voice!',
      message: 'Thank you for joining our community. Start by submitting your first complaint.',
      targetType: 'user',
      targetId: user._id,
      priority: 'low'
    });
    return { user, token };
  } catch (error) {
    return { error: error.message };
  }
}

export async function loginUserService({ email, password }) {
  try {
    if (!email || !password) {
      return { error: 'Please provide email and password' };
    }
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    if (!user.isActive) {
      return { error: 'Account is deactivated. Please contact administrator.' };
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return { error: 'Invalid credentials' };
    }
    await user.updateLastLogin();
    const token = user.getSignedJwtToken();
    return { user, token };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getMeService(userId) {
  try {
    const user = await userRepository.findUserByIdWithBadges(userId);
    return user;
  } catch (error) {
    return { error: error.message };
  }
}

export async function updateDetailsService(userId, fieldsToUpdate) {
  try {
    if (fieldsToUpdate.email) {
      const existingUser = await userRepository.findUserByEmail(fieldsToUpdate.email);
      if (existingUser && existingUser._id.toString() !== userId) {
        return { error: 'Email is already taken by another user' };
      }
    }
    const user = await userRepository.updateUserById(userId, fieldsToUpdate, { new: true, runValidators: true });
    return user;
  } catch (error) {
    return { error: error.message };
  }
}

export async function updatePasswordService(userId, currentPassword, newPassword) {
  try {
    const user = await userRepository.findUserByIdWithPassword(userId);
    if (!(await user.matchPassword(currentPassword))) {
      return { error: 'Current password is incorrect' };
    }
    user.password = newPassword;
    await user.save();
    const token = user.getSignedJwtToken();
    return { token };
  } catch (error) {
    return { error: error.message };
  }
}

export async function forgotPasswordService(email) {
  try {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      return { error: 'User not found' };
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // TODO: Send email with reset token
    return { resetToken };
  } catch (error) {
    return { error: error.message };
  }
}

export async function resetPasswordService(resettoken, newPassword) {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(resettoken).digest('hex');
    const user = await userRepository.findUserByResetToken(resetPasswordToken);
    if (!user) {
      return { error: 'Invalid token' };
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = user.getSignedJwtToken();
    return { token };
  } catch (error) {
    return { error: error.message };
  }
}

export async function verifyAccountService(userId) {
  try {
    const user = await userRepository.updateUserById(userId, { isVerified: true }, { new: true });
    return user;
  } catch (error) {
    return { error: error.message };
  }
} 