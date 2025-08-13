import * as userRepository from '../repositories/userRepository.js';

export async function registerUserService({ name, email, password, department, role }) {
  try {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      return { error: 'User with this email already exists' };
    }
    const user = await userRepository.createUser({
      name,
      email,
      password,
      department,
      ...(role && { role })
    });
    const token = user.getSignedJwtToken();
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
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return { error: 'Password is incorrect' };
    }
    const token = user.getSignedJwtToken();
    return { user, token };
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
    console.log("user is in updateDetailsService", user);
    return user;
  } catch (error) {
    console.log("error is in updateDetailsService", error);
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
