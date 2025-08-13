import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  studentId: {
    type: String,
    unique: false,
    sparse: true,
    trim: true
  },
  department: {
    type: String,
    enum: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Other'],
    default: 'Other'
  },
  year: {
    type: Number,
    min: 1,
    max: 5
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student',
    required: false
  },
  avatar: {
    type: String,
    default: ''
  },
  complaintsSubmitted: {
    type: Number,
    default: 0
  },
  complaintsResolved: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ department: 1 });

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    ENV_VARS.JWT_SECRET,
    { expiresIn: ENV_VARS.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full profile
userSchema.virtual('fullProfile').get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    studentId: this.studentId,
    department: this.department,
    year: this.year,
    role: this.role,
    avatar: this.avatar,

    complaintsSubmitted: this.complaintsSubmitted,
    complaintsResolved: this.complaintsResolved,

    createdAt: this.createdAt
  };
});

export default mongoose.model('User', userSchema);