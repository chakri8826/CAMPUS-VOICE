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
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,        // Keep for backward compatibility
    url: String,         // Cloudinary secure URL
    mimetype: String,
    size: Number,
    cloudinaryId: String // Cloudinary public ID for future operations
  }],
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
}, {
  timestamps: true
});

// Indexes for better query performance
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ createdAt: -1 });


// Virtual for vote count
complaintSchema.virtual('voteCount').get(function () {
  return this.likes - this.dislikes;
});

// Virtual for comment count
complaintSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// Virtual for time since submission
complaintSchema.virtual('timeSinceSubmission').get(function () {
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

// Static method to get complaints with filters
complaintSchema.statics.getFilteredComplaints = function (filters = {}) {
  return this.find(filters)
    .populate('submittedBy', 'name avatar department')
    .sort({ createdAt: -1 });
};

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;