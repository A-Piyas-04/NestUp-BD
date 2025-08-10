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
  
  // Booking Period
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
  // Duration calculation
  duration: {
    days: {
      type: Number,
      required: true
    },
    months: {
      type: Number
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
  
  // Additional fees
  fees: {
    serviceFee: {
      type: Number,
      default: 0
    },
    cleaningFee: {
      type: Number,
      default: 0
    },
    securityDeposit: {
      type: Number,
      default: 0
    }
  },
  
  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  
  // Guest Information
  guestInfo: {
    numberOfGuests: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 guest is required']
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters']
    }
  },
  
  // Contact Information
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true
    }
  },
  
  // Booking Confirmation
  confirmationCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  confirmedAt: {
    type: Date
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
// Note: confirmationCode index is automatically created by unique: true

// Virtual for booking duration in days
bookingSchema.virtual('durationInDays').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Pre-save middleware to calculate duration and generate confirmation code
bookingSchema.pre('save', function(next) {
  // Calculate duration
  if (this.startDate && this.endDate) {
    const durationInDays = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    const durationInMonths = Math.max(1, Math.ceil(durationInDays / 30));
    
    this.duration = {
      days: durationInDays,
      months: durationInMonths
    };
  }
  
  // Generate confirmation code if booking is confirmed and doesn't have one
  if (this.status === 'confirmed' && !this.confirmationCode) {
    this.confirmationCode = 'NB' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    this.confirmedAt = new Date();
  }
  
  next();
});

// Method to confirm booking
bookingSchema.methods.confirm = function() {
  this.status = 'confirmed';
  this.paymentStatus = 'paid';
  this.confirmedAt = new Date();
  return this.save();
};

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(serviceId, startDate, endDate, excludeBookingId = null) {
  const query = {
    service: serviceId,
    status: { $in: ['confirmed', 'active'] },
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

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;