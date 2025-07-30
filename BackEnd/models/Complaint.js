import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Infrastructure',
      'Academic',
      'Hostel',
      'Transportation',
      'Food',
      'Security',
      'Technology',
      'Sports',
      'Library',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected', 'closed'],
    default: 'pending'
  },
  location: {
    building: {
      type: String,
      trim: true
    },
    floor: {
      type: String,
      trim: true
    },
    room: {
      type: String,
      trim: true
    },
    area: {
      type: String,
      trim: true
    }
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['upvote', 'downvote']
    }
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  estimatedResolutionTime: {
    type: Date
  },
  actualResolutionTime: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution notes cannot be more than 1000 characters']
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot be more than 1000 characters']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ category: 1, subcategory: 1 });
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ 'location.building': 1, 'location.floor': 1 });
complaintSchema.index({ tags: 1 });

// Virtual for vote count
complaintSchema.virtual('voteCount').get(function() {
  return this.upvotes - this.downvotes;
});

// Virtual for comment count
complaintSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for time since submission
complaintSchema.virtual('timeSinceSubmission').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Update last activity when complaint is modified
complaintSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Method to increment views
complaintSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add vote
complaintSchema.methods.addVote = function(userId, voteType) {
  const existingVoteIndex = this.voters.findIndex(voter => 
    voter.user.toString() === userId.toString()
  );

  if (existingVoteIndex > -1) {
    // Remove existing vote
    const existingVote = this.voters[existingVoteIndex].vote;
    if (existingVote === 'upvote') this.upvotes -= 1;
    if (existingVote === 'downvote') this.downvotes -= 1;
    
    // Update or remove vote
    if (this.voters[existingVoteIndex].vote === voteType) {
      this.voters.splice(existingVoteIndex, 1);
    } else {
      this.voters[existingVoteIndex].vote = voteType;
      if (voteType === 'upvote') this.upvotes += 1;
      if (voteType === 'downvote') this.downvotes += 1;
    }
  } else {
    // Add new vote
    this.voters.push({ user: userId, vote: voteType });
    if (voteType === 'upvote') this.upvotes += 1;
    if (voteType === 'downvote') this.downvotes += 1;
  }

  return this.save();
};

// Static method to get complaints with filters
complaintSchema.statics.getFilteredComplaints = function(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find(filters)
    .populate('submittedBy', 'name avatar department')
    .populate('assignedTo', 'name avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint; 