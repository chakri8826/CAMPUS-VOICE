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
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isOfficial: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
commentSchema.index({ complaint: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

// Method to edit comment
commentSchema.methods.editComment = function (newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// It finds all the comments for a complaint in comment model based on the complaint id
commentSchema.statics.getCommentsForComplaint = function (complaintId) {
  return this.find({
    complaint: complaintId
  })
    .populate('author', 'name avatar role department')
    .sort({ createdAt: -1 });
};

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;