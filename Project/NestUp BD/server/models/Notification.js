import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient of the notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  
  // Sender of the notification (optional for system notifications)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Type of notification
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: ['booking_request', 'new_review', 'booking_approved']
  },
  
  // Notification title
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  // Notification message
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  // Related data for context
  relatedData: {
    // Reference to booking for booking_request and booking_approved
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    // Reference to service for all notification types
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    // Reference to review for new_review notifications
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NestReview',
      default: null
    }
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  
  // When the notification was read
  readAt: {
    type: Date,
    default: null
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Action URL for navigation
  actionUrl: {
    type: String,
    trim: true,
    default: null
  },
  
  // Optional expiration date
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for formatted creation date
notificationSchema.virtual('formattedDate').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create booking request notification
notificationSchema.statics.createBookingRequestNotification = async function(booking) {
  try {
    // Populate booking with service and user details
    await booking.populate(['service', 'user']);
    
    const notification = new this({
      recipient: booking.service.owner,
      sender: booking.user._id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${booking.user.name} has requested to book your property "${booking.service.title}"`,
      relatedData: {
        booking: booking._id,
        service: booking.service._id
      },
      priority: 'high',
      actionUrl: `/dashboard/booking-approvals`
    });
    
    return await notification.save();
  } catch (error) {
    console.error('Error creating booking request notification:', error);
    throw error;
  }
};

// Static method to create new review notification
notificationSchema.statics.createNewReviewNotification = async function(review) {
  try {
    // Populate review with service and reviewer details
    await review.populate(['service', 'reviewer']);
    
    const notification = new this({
      recipient: review.service.owner,
      sender: review.reviewer._id,
      type: 'new_review',
      title: 'New Review Received',
      message: `${review.reviewer.name} left a review for your property "${review.service.title}"`,
      relatedData: {
        service: review.service._id,
        review: review._id
      },
      priority: 'medium',
      actionUrl: `/dashboard/nest-reviews`
    });
    
    return await notification.save();
  } catch (error) {
    console.error('Error creating new review notification:', error);
    throw error;
  }
};

// Static method to create booking approved notification
notificationSchema.statics.createBookingApprovedNotification = async function(booking) {
  try {
    // Populate booking with service details
    await booking.populate('service');
    
    const notification = new this({
      recipient: booking.user,
      sender: booking.service.owner,
      type: 'booking_approved',
      title: 'Booking Approved!',
      message: `Your booking request for "${booking.service.title}" has been approved`,
      relatedData: {
        booking: booking._id,
        service: booking.service._id
      },
      priority: 'high',
      actionUrl: `/dashboard/booked-nests`
    });
    
    return await notification.save();
  } catch (error) {
    console.error('Error creating booking approved notification:', error);
    throw error;
  }
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  try {
    return await this.countDocuments({
      recipient: userId,
      isRead: false
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Static method to get notifications for a user
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false
    } = options;
    
    const query = { recipient: userId };
    if (unreadOnly) {
      query.isRead = false;
    }
    
    const skip = (page - 1) * limit;
    
    return await this.find(query)
      .populate('sender', 'name email')
      .populate('relatedData.service', 'title thumbnail')
      .populate('relatedData.booking', 'startDate endDate confirmationCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  try {
    return await this.updateMany(
      { recipient: userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;