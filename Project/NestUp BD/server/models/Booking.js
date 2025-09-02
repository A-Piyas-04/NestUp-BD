import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Reference to the service being booked
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required']
  },
  
  // Reference to the user making the booking
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Reference to payment (one-to-one relationship)
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  
  // Booking Period
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Start date cannot be in the past'
    }
  },
  
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  
  // Pricing Information
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  
  // Booking Status - Updated enum for new flow
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  
  // Approval Status - For host approval workflow
  isApproved: {
    type: Boolean,
    default: null // null = pending approval, true = approved, false = rejected
  },
  
  // Approval Information
  approvedAt: {
    type: Date
  },
  
  rejectedAt: {
    type: Date
  },
  
  approvalReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Approval reason cannot exceed 500 characters']
  },
  
  // Payment Status - Consistent with Payment model
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'partial', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Guest Information
  guestInfo: {
    numberOfGuests: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 guest is required'],
      max: [20, 'Maximum 20 guests allowed']
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [1000, 'Special requests cannot exceed 1000 characters']
    }
  },
  
  // Contact Information
  contactInfo: {
    phone: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function(v) {
          // Only validate if phone number is provided
          return !v || /^[+]?[0-9\s\-()]{10,15}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    }
  },
  
  // Booking Confirmation
  confirmationCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Status Timestamps
  confirmedAt: {
    type: Date
  },
  
  completedAt: {
    type: Date
  },
  
  cancelledAt: {
    type: Date
  },
  
  // Cancellation Information
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  
  // Review Information
  reviewSubmitted: {
    type: Boolean,
    default: false
  },
  
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: null
  },
  
  // Nest Review Information
  nestReviewSubmitted: {
    type: Boolean,
    default: false
  },
  
  nestReviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NestReview',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ service: 1, startDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ isApproved: 1 });
// Note: confirmationCode index is automatically created by unique: true

// Virtual for calculating duration in days
bookingSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  return 0;
});

// Virtual for calculating duration in months (approximate)
bookingSchema.virtual('durationMonths').get(function() {
  if (this.startDate && this.endDate) {
    const months = (this.endDate.getFullYear() - this.startDate.getFullYear()) * 12 + 
                   (this.endDate.getMonth() - this.startDate.getMonth());
    return Math.max(0, months);
  }
  return 0;
});

// Virtual for formatted confirmation code
bookingSchema.virtual('formattedConfirmationCode').get(function() {
  if (this.confirmationCode) {
    return `NB-${this.confirmationCode}`;
  }
  return null;
});

// Virtual for current booking status based on dates
bookingSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  
  if (this.status === 'cancelled' || this.status === 'rejected') {
    return this.status;
  }
  
  if (this.status === 'pending') {
    return 'pending';
  }
  
  if (this.status === 'approved') {
    return 'approved';
  }
  
  if (this.status === 'paid') {
    // For paid bookings, check dates to determine if active, upcoming, or completed
    if (this.endDate < now) {
      return 'completed';
    }
    if (this.startDate <= now && this.endDate >= now) {
      return 'active';
    }
    if (this.startDate > now) {
      return 'upcoming';
    }
    return 'paid';
  }
  
  if (this.endDate < now) {
    return 'completed';
  }
  
  if (this.startDate <= now && this.endDate >= now) {
    return 'active';
  }
  
  if (this.startDate > now) {
    return 'upcoming';
  }
  
  return this.status;
});

// Pre-save middleware to generate confirmation code
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.confirmationCode) {
    // Generate a unique confirmation code
    this.confirmationCode = Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Pre-save middleware to set total amount equal to base price
bookingSchema.pre('save', function(next) {
  if (this.isModified('basePrice')) {
    this.totalAmount = this.basePrice;
  }
  next();
});

// Pre-save middleware to set status timestamps
bookingSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'confirmed':
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  
  // Handle approval status changes
  if (this.isModified('isApproved')) {
    if (this.isApproved === true && !this.approvedAt) {
      this.approvedAt = now;
      this.rejectedAt = undefined;
    } else if (this.isApproved === false && !this.rejectedAt) {
      this.rejectedAt = now;
      this.approvedAt = undefined;
    }
  }
  
  next();
});

// Instance method to check if booking is active
bookingSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'confirmed' && 
         this.startDate <= now && 
         this.endDate >= now;
};

// Instance method to check if booking is completed
bookingSchema.methods.isCompleted = function() {
  const now = new Date();
  return this.status === 'completed' || 
         (this.status === 'confirmed' && this.endDate < now);
};

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const hoursUntilStart = (this.startDate.getTime() - now.getTime()) / (1000 * 3600);
  return ['pending', 'confirmed'].includes(this.status) && hoursUntilStart > 24;
};

// Instance method to mark booking as completed
bookingSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Instance method to cancel booking
bookingSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  if (reason) this.cancellationReason = reason;
  return this.save();
};

// Method to confirm booking
bookingSchema.methods.confirm = function() {
  this.status = 'confirmed';
  this.paymentStatus = 'paid';
  this.confirmedAt = new Date();
  return this.save();
};

// Method to approve booking
bookingSchema.methods.approve = function(reason) {
  this.isApproved = true;
  this.status = 'approved';
  this.approvedAt = new Date();
  if (reason) this.approvalReason = reason;
  return this.save();
};

// Method to mark booking as paid
bookingSchema.methods.markAsPaid = function() {
  this.status = 'paid';
  this.paymentStatus = 'paid';
  this.confirmedAt = new Date();
  return this.save();
};

// Method to reject booking
bookingSchema.methods.reject = function(reason) {
  this.isApproved = false;
  this.rejectedAt = new Date();
  if (reason) this.approvalReason = reason;
  return this.save();
};

// Instance method to check if booking needs approval
bookingSchema.methods.needsApproval = function() {
  return this.isApproved === null;
};

// Instance method to check if booking is approved
bookingSchema.methods.isBookingApproved = function() {
  return this.isApproved === true;
};

// Instance method to check if booking is rejected
bookingSchema.methods.isBookingRejected = function() {
  return this.isApproved === false;
};

// Static method to find bookings by status
bookingSchema.statics.findByStatus = function(status) {
  return this.find({ status: status })
    .populate('service', 'title location price images')
    .populate('user', 'name email')
    .populate('payment')
    .sort({ createdAt: -1 });
};

// Static method to find active bookings
bookingSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'approved',
    startDate: { $lte: now },
    endDate: { $gte: now }
  })
  .populate('service', 'title location price images')
  .populate('user', 'name email')
  .populate('payment');
};

// Static method to find bookings that should be marked as completed
bookingSchema.statics.findToComplete = function() {
  const now = new Date();
  return this.find({
    status: 'approved',
    endDate: { $lt: now }
  });
};

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(serviceId, startDate, endDate, excludeBookingId = null) {
  const query = {
    service: serviceId,
    status: { $in: ['approved', 'active'] },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflictingBookings = await this.find(query);
  return conflictingBookings.length === 0;
};

// Alias method for API compatibility
bookingSchema.statics.isServiceAvailable = async function(serviceId, startDate, endDate, excludeBookingId = null) {
  return this.checkAvailability(serviceId, startDate, endDate, excludeBookingId);
};

// Static method to get booking statistics
bookingSchema.statics.getBookingStats = function(userId) {
  return this.aggregate([
    { $match: userId ? { user: new mongoose.Types.ObjectId(userId) } : {} },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// Static method to find bookings pending approval
bookingSchema.statics.findPendingApproval = function(hostId) {
  const query = { isApproved: null };
  if (hostId) {
    // Convert hostId to ObjectId if it's a string
    const ownerObjectId = mongoose.Types.ObjectId.isValid(hostId) ? new mongoose.Types.ObjectId(hostId) : hostId;
    // Need to populate service to filter by host
    return this.find(query)
      .populate({
        path: 'service',
        match: { owner: ownerObjectId },
        select: 'title location owner'
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .then(bookings => bookings.filter(booking => booking.service)); // Filter out null services
  }
  return this.find(query)
    .populate('service', 'title location owner')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find approved bookings
bookingSchema.statics.findApproved = function(hostId) {
  const query = { isApproved: true };
  if (hostId) {
    // Convert hostId to ObjectId if it's a string
    const ownerObjectId = mongoose.Types.ObjectId.isValid(hostId) ? new mongoose.Types.ObjectId(hostId) : hostId;
    return this.find(query)
      .populate({
        path: 'service',
        match: { owner: ownerObjectId },
        select: 'title location owner'
      })
      .populate('user', 'name email')
      .sort({ approvedAt: -1 })
      .then(bookings => bookings.filter(booking => booking.service));
  }
  return this.find(query)
    .populate('service', 'title location owner')
    .populate('user', 'name email')
    .sort({ approvedAt: -1 });
};

// Static method to find rejected bookings
bookingSchema.statics.findRejected = function(hostId) {
  const query = { isApproved: false };
  if (hostId) {
    // Convert hostId to ObjectId if it's a string
    const ownerObjectId = mongoose.Types.ObjectId.isValid(hostId) ? new mongoose.Types.ObjectId(hostId) : hostId;
    return this.find(query)
      .populate({
        path: 'service',
        match: { owner: ownerObjectId },
        select: 'title location owner'
      })
      .populate('user', 'name email')
      .sort({ rejectedAt: -1 })
      .then(bookings => bookings.filter(booking => booking.service));
  }
  return this.find(query)
    .populate('service', 'title location owner')
    .populate('user', 'name email')
    .sort({ rejectedAt: -1 });
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;