// NotificationService.js - Service for managing review notifications

class NotificationService {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    this.listeners = [];
  }

  // Add a listener for notification updates
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove a listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners of changes
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  // Create a new notification
  createNotification(type, data) {
    const notification = {
      id: Date.now().toString(),
      type, // 'new_review', 'review_reply', 'review_approved', 'review_flagged', 'booking_approved', 'booking_rejected', 'booking_pending'
      data,
      timestamp: new Date().toISOString(),
      read: false,
      priority: this.getPriority(type)
    };

    this.notifications.unshift(notification);
    this.saveToStorage();
    this.notifyListeners();
    
    // Show browser notification if permission granted
    this.showBrowserNotification(notification);
    
    return notification;
  }

  // Get priority level for notification type
  getPriority(type) {
    const priorities = {
      'new_review': 'medium',
      'review_reply': 'medium',
      'review_approved': 'low',
      'review_rejected': 'medium',
      'booking_approved': 'high',
      'booking_rejected': 'high',
      'booking_pending': 'medium'
    };
    return priorities[type] || 'low';
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = this.getNotificationTitle(notification.type);
      const body = this.getNotificationBody(notification);
      
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  // Get notification title based on type
  getNotificationTitle(type) {
    const titles = {
      'new_review': 'New Review Received',
      'review_reply': 'Review Reply',
      'review_approved': 'Review Approved',
      'review_rejected': 'Review Rejected',
      'booking_approved': 'Booking Approved',
      'booking_rejected': 'Booking Rejected',
      'booking_pending': 'New Booking Request'
    };
    return titles[type] || 'NestUp BD Notification';
  }

  // Get notification body text
  getNotificationBody(notification) {
    const { type, data } = notification;
    
    switch (type) {
      case 'new_review':
        return `${data.reviewerName} left a ${data.rating}-star review for ${data.propertyTitle}`;
      case 'review_reply':
        return `${data.hostName} replied to your review for ${data.propertyTitle}`;
      case 'review_approved':
        return `Your review for ${data.propertyTitle} has been approved`;
      case 'review_rejected':
        return `Your review for ${data.propertyTitle} was rejected: ${data.reason}`;
      case 'booking_approved':
        return `Your booking for ${data.propertyTitle} has been approved by the host`;
      case 'booking_rejected':
        return `Your booking for ${data.propertyTitle} was rejected: ${data.reason}`;
      case 'booking_pending':
        return `${data.guestName} has requested to book ${data.propertyTitle}`;
      default:
        return 'You have a new notification';
    }
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveToStorage();
    this.notifyListeners();
  }

  // Delete a notification
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  // Get all notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread notifications count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get notifications by type
  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  // Save notifications to localStorage
  saveToStorage() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  // Request browser notification permission
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Simulate receiving notifications (for demo purposes)
  simulateNotifications() {
    const sampleNotifications = [
      {
        type: 'new_review',
        data: {
          reviewerName: 'Ahmed Hassan',
          rating: 5,
          propertyTitle: 'Cozy Apartment in Dhanmondi',
          reviewId: 'review1'
        }
      },
      {
        type: 'review_reply',
        data: {
          hostName: 'Fatima Khan',
          propertyTitle: 'Modern Studio in Gulshan',
          replyText: 'Thank you for your feedback!'
        }
      },
      {
        type: 'review_approved',
        data: {
          propertyTitle: 'Family House in Uttara',
          reviewId: 'review2'
        }
      }
    ];

    sampleNotifications.forEach((notification, index) => {
      setTimeout(() => {
        this.createNotification(notification.type, notification.data);
      }, index * 2000);
    });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;