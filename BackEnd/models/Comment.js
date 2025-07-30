import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide comment content'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
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
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  isAdminReply: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
commentSchema.index({ complaint: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ isOfficial: 1 });

// Virtual for vote count
commentSchema.virtual('voteCount').get(function() {
  return this.upvotes - this.downvotes;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for time since creation
commentSchema.virtual('timeSinceCreation').get(function() {
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

// Method to add vote
commentSchema.methods.addVote = function(userId, voteType) {
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

// Method to soft delete comment
commentSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = '[This comment has been deleted]';
  return this.save();
};

// Method to edit comment
commentSchema.methods.editComment = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Static method to get comments for a complaint
commentSchema.statics.getCommentsForComplaint = function(complaintId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ 
    complaint: complaintId, 
    parentComment: null,
    isDeleted: false 
  })
    .populate('author', 'name avatar role department')
    .populate({
      path: 'replies',
      match: { isDeleted: false },
      populate: {
        path: 'author',
        select: 'name avatar role department'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Comment = mongoose.model('Comment', commentSchema);
export default Comment; 