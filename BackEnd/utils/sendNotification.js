import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Send a single notification
 * @param {Object} notificationData - Notification data
 */
export const sendNotification = async (notificationData) => {
  try {
    const notification = await Notification.createNotification(notificationData);
    
    // TODO: Implement real-time notification (WebSocket, Push notifications, etc.)
    console.log(`Notification sent to user ${notificationData.recipient}: ${notificationData.title}`);
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send multiple notifications
 * @param {Array} notificationsArray - Array of notification data objects
 */
export const sendMultipleNotifications = async (notificationsArray) => {
  try {
    const notifications = await Notification.createMultipleNotifications(notificationsArray);
    
    console.log(`Sent ${notifications.length} notifications`);
    
    return notifications;
  } catch (error) {
    console.error('Error sending multiple notifications:', error);
    throw error;
  }
};

/**
 * Send notification to all users with specific role
 * @param {string} role - User role (student, faculty, admin)
 * @param {Object} notificationData - Notification data (without recipient)
 */
export const sendNotificationToRole = async (role, notificationData) => {
  try {
    const users = await User.find({ role, isActive: true }).select('_id');
    
    const notifications = users.map(user => ({
      ...notificationData,
      recipient: user._id
    }));
    
    return await sendMultipleNotifications(notifications);
  } catch (error) {
    console.error('Error sending notification to role:', error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 */
export const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.getUnreadCount(userId);
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
}; 