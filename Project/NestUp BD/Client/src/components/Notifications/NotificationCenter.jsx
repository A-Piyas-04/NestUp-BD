import React, { useState, useEffect } from 'react';
import notificationService from './NotificationService';
import './NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'reviews'

  useEffect(() => {
    // Load initial notifications
    setNotifications(notificationService.getNotifications());

    // Listen for notification updates
    const handleNotificationUpdate = (updatedNotifications) => {
      setNotifications(updatedNotifications);
    };

    notificationService.addListener(handleNotificationUpdate);

    return () => {
      notificationService.removeListener(handleNotificationUpdate);
    };
  }, []);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'reviews':
        return notification.type.includes('review');
      default:
        return true;
    }
  });

  const handleMarkAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleDeleteNotification = (notificationId) => {
    notificationService.deleteNotification(notificationId);
  };

  const handleClearAll = () => {
    notificationService.clearAll();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'new_review': '⭐',
      'review_reply': '💬',
      'review_approved': '✅',
      'review_rejected': '❌',
      'review_flagged': '🚩',
      'booking_approved': '✅',
      'booking_rejected': '❌',
      'booking_pending': '🏠'
    };
    return icons[type] || '📢';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationMessage = (notification) => {
    const { type, data } = notification;
    
    switch (type) {
      case 'new_review':
        return (
          <div>
            <strong>{data.reviewerName}</strong> left a {data.rating}-star review for{' '}
            <strong>{data.propertyTitle}</strong>
          </div>
        );
      case 'review_reply':
        return (
          <div>
            <strong>{data.hostName}</strong> replied to your review for{' '}
            <strong>{data.propertyTitle}</strong>
          </div>
        );
      case 'review_approved':
        return (
          <div>
            Your review for <strong>{data.propertyTitle}</strong> has been approved
          </div>
        );
      case 'review_rejected':
        return (
          <div>
            Your review for <strong>{data.propertyTitle}</strong> was rejected
            {data.reason && <div className="rejection-reason">Reason: {data.reason}</div>}
          </div>
        );
      case 'review_flagged':
        return (
          <div>
            A review for <strong>{data.propertyTitle}</strong> has been flagged for moderation
          </div>
        );
      case 'booking_approved':
        return (
          <div>
            Your booking for <strong>{data.propertyTitle}</strong> has been approved by the host
            {data.approvalReason && <div className="approval-reason">Message: {data.approvalReason}</div>}
          </div>
        );
      case 'booking_rejected':
        return (
          <div>
            Your booking for <strong>{data.propertyTitle}</strong> was rejected by the host
            {data.reason && <div className="rejection-reason">Reason: {data.reason}</div>}
          </div>
        );
      case 'booking_pending':
        return (
          <div>
            <strong>{data.guestName}</strong> has requested to book <strong>{data.propertyTitle}</strong>
            <div className="booking-details">
              {data.startDate && data.endDate && (
                <small>Dates: {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}</small>
              )}
            </div>
          </div>
        );
      default:
        return <div>You have a new notification</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="notification-controls">
          <div className="notification-filters">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={filter === 'unread' ? 'active' : ''}
              onClick={() => setFilter('unread')}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
            <button
              className={filter === 'reviews' ? 'active' : ''}
              onClick={() => setFilter('reviews')}
            >
              Reviews ({notifications.filter(n => n.type.includes('review')).length})
            </button>
          </div>

          <div className="notification-actions">
            <button onClick={handleMarkAllAsRead} className="mark-all-read">
              Mark All Read
            </button>
            <button onClick={handleClearAll} className="clear-all">
              Clear All
            </button>
          </div>
        </div>

        <div className="notification-list">
          {filteredNotifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">🔔</div>
              <p>No notifications to show</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''} priority-${notification.priority}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-message">
                    {getNotificationMessage(notification)}
                  </div>
                  <div className="notification-timestamp">
                    {formatTimestamp(notification.timestamp)}
                  </div>
                </div>

                <div className="notification-actions-item">
                  {!notification.read && (
                    <button
                      className="mark-read-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="notification-footer">
          <button
            className="simulate-btn"
            onClick={() => notificationService.simulateNotifications()}
          >
            Simulate Notifications (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;