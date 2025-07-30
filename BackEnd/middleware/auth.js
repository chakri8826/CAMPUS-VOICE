import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ENV_VARS } from '../config/envVars.js';

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      console.log('Invalid token in optional auth:', error.message);
    }
  }

  next();
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required to access this feature'
    });
  }
  next();
};

// Check if user can edit their own content
const canEditOwnContent = (modelName) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}.js`);
      const content = await Model.findById(req.params.id);

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Check if user is admin or the content owner
      if (req.user.role === 'admin' || content.submittedBy?.toString() === req.user._id.toString()) {
        req.content = content;
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to edit this content'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

// Rate limiting for authentication attempts
const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
};

export {
  protect,
  authorize,
  optionalAuth,
  requireVerification,
  canEditOwnContent,
  authRateLimit
}; 