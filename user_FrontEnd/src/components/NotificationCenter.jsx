import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock notifications - replace with API call
  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        type: 'complaint_resolved',
        title: 'Complaint Resolved',
        message: 'Your complaint about Wi-Fi issues has been resolved.',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: 'high',
        actionUrl: '/complaints/123'
      },
      {
        id: '2',
        type: 'badge_earned',
        title: 'Badge Earned!',
        message: 'Congratulations! You earned the "Problem Solver" badge.',
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'medium',
        actionUrl: '/profile'
      },
      {
        id: '3',
        type: 'comment_replied',
        title: 'New Reply',
        message: 'Someone replied to your comment on the library noise complaint.',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        priority: 'low',
        actionUrl: '/complaints/456'
      },
      {
        id: '4',
        type: 'admin_message',
        title: 'Admin Message',
        message: 'Your complaint has been assigned to the IT department for review.',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        priority: 'medium',
        actionUrl: '/complaints/789'
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const getNotificationIcon = (type) => {
    const icons = {
      complaint_created: '📝',
      complaint_updated: '✏️',
      complaint_resolved: '✅',
      complaint_assigned: '👤',
      comment_added: '💬',
      comment_replied: '↩️',
      vote_received: '👍',
      badge_earned: '🏆',
      admin_message: '📢',
      system_alert: '⚠️'
    };
    return icons[type] || '📌';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-[#8ecdb7]',
      medium: 'text-[#019863]',
      high: 'text-[#fd7e14]',
      urgent: 'text-[#dc3545]'
    };
    return colors[priority] || 'text-[#8ecdb7]';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      {/* Notification Panel */}
      <div className="relative w-96 max-h-[600px] bg-[#10231c] border border-[#214a3c] rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#214a3c]">
          <h3 className="text-white font-bold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="bg-[#019863] text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
            <button
              onClick={markAllAsRead}
              className="text-[#8ecdb7] text-sm hover:text-white transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="text-[#8ecdb7] hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="text-[#8ecdb7]">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <div className="text-[#8ecdb7]">No notifications</div>
            </div>
          ) : (
            <div className="divide-y divide-[#214a3c]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-[#214a3c] transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-[#214a3c] bg-opacity-50' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-xl ${getPriorityColor(notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#019863] rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-[#8ecdb7] text-sm mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8ecdb7] text-xs">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-[#214a3c]">
            <Link
              to="/notifications"
              className="block text-center text-[#8ecdb7] text-sm hover:text-white transition-colors"
              onClick={onClose}
            >
              View all notifications
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter; 