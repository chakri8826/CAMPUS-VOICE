import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'complaint_created',
      'complaint_updated',
      'complaint_resolved',
      'complaint_assigned',
      'comment_added',
      'comment_replied',
      'vote_received',
      'badge_earned',
      'admin_message',
      'system_alert'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  targetType: {
    type: String,
    enum: ['complaint', 'comment', 'user', 'system'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for time since creation
notificationSchema.virtual('timeSinceCreation').get(function() {
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

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = undefined;
  return this.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, page = 1, limit = 20, unreadOnly = false) {
  const skip = (page - 1) * limit;
  const filter = { recipient: userId };
  
  if (unreadOnly) {
    filter.isRead = false;
  }
  
  return this.find(filter)
    .populate('sender', 'name avatar role')
    .populate('targetId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to mark all notifications as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  const notification = new this(data);
  return notification.save();
};

// Static method to create multiple notifications
notificationSchema.statics.createMultipleNotifications = function(notifications) {
  return this.insertMany(notifications);
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 