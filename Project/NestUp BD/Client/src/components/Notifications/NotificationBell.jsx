import React, { useState, useEffect } from 'react';
import notificationService from './NotificationService';
import NotificationCenter from './NotificationCenter';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    // Load initial unread count
    setUnreadCount(notificationService.getUnreadCount());

    // Listen for notification updates
    const handleNotificationUpdate = (notifications) => {
      const newUnreadCount = notifications.filter(n => !n.read).length;
      
      // Check if there's a new notification (unread count increased)
      if (newUnreadCount > unreadCount) {
        setHasNewNotification(true);
        // Reset the animation after a short delay
        setTimeout(() => setHasNewNotification(false), 1000);
      }
      
      setUnreadCount(newUnreadCount);
    };

    notificationService.addListener(handleNotificationUpdate);

    // Request notification permission on component mount
    notificationService.requestPermission();

    return () => {
      notificationService.removeListener(handleNotificationUpdate);
    };
  }, [unreadCount]);

  const handleBellClick = () => {
    setIsNotificationCenterOpen(true);
  };

  const handleCloseNotificationCenter = () => {
    setIsNotificationCenterOpen(false);
  };

  return (
    <>
      <div className="notification-bell-container">
        <button
          className={`notification-bell ${hasNewNotification ? 'shake' : ''}`}
          onClick={handleBellClick}
          title="Notifications"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="bell-icon"
          >
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={handleCloseNotificationCenter}
      />
    </>
  );
};

export default NotificationBell;