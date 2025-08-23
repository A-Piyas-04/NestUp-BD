import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Reference to the booking this payment is for (one-to-one relationship)
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required'],
    unique: true
  },
  
  // Reference to the user making the payment
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Payment Amount Details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  
  // Amount breakdown
  amountBreakdown: {
    baseAmount: {
      type: Number,
      required: true,
      min: [0, 'Base amount cannot be negative']
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: [0, 'Service fee cannot be negative']
    },
    cleaningFee: {
      type: Number,
      default: 0,
      min: [0, 'Cleaning fee cannot be negative']
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Security deposit cannot be negative']
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    }
  },
  
  // Currency
  currency: {
    type: String,
    default: 'BDT',
    enum: ['BDT', 'USD', 'EUR'],
    uppercase: true
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['bkash', 'nagad', 'rocket', 'mobile_banking', 'bank_transfer', 'credit_card', 'cash'],
    lowercase: true
  },
  
  // Payment Details (varies by method)
  paymentDetails: {
    // For mobile payments (bkash, nagad, rocket)
    mobile: {
      phoneNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            return !v || /^[+]?[0-9\s\-()]{10,15}$/.test(v);
          },
          message: 'Please enter a valid phone number'
        }
      },
      transactionId: {
        type: String,
        trim: true,
        uppercase: true
      },
      senderNumber: {
        type: String,
        trim: true
      }
    },
    
    // For bank transfers
    bank: {
      accountNumber: {
        type: String,
        trim: true
      },
      accountHolderName: {
        type: String,
        trim: true
      },
      bankName: {
        type: String,
        trim: true
      },
      routingNumber: {
        type: String,
        trim: true
      },
      swiftCode: {
        type: String,
        trim: true,
        uppercase: true
      }
    },
    
    // For card payments
    card: {
      last4Digits: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            return !v || /^\d{4}$/.test(v);
          },
          message: 'Last 4 digits must be exactly 4 numbers'
        }
      },
      cardType: {
        type: String,
        enum: ['visa', 'mastercard', 'amex', 'discover'],
        lowercase: true
      },
      expiryMonth: {
        type: Number,
        min: 1,
        max: 12
      },
      expiryYear: {
        type: Number,
        min: new Date().getFullYear()
      }
    }
  },
  
  // Payment Status - Consistent with Booking model
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'partial', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Personal Information for the booking
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^[+]?[0-9\s\-()]{10,15}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters']
      },
      city: {
        type: String,
        trim: true,
        maxlength: [50, 'City name cannot exceed 50 characters']
      },
      state: {
        type: String,
        trim: true,
        maxlength: [50, 'State name cannot exceed 50 characters']
      },
      zipCode: {
        type: String,
        trim: true,
        maxlength: [10, 'Zip code cannot exceed 10 characters']
      },
      country: {
        type: String,
        default: 'Bangladesh',
        trim: true,
        maxlength: [50, 'Country name cannot exceed 50 characters']
      }
    }
  },
  
  // Terms and Conditions
  termsAccepted: {
    type: Boolean,
    required: [true, 'Terms and conditions must be accepted'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'Terms and conditions must be accepted'
    }
  },
  
  // Payment Processing Timestamps
  processedAt: {
    type: Date
  },
  
  paidAt: {
    type: Date
  },
  
  failedAt: {
    type: Date
  },
  
  // Failure Information
  failureReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  },
  
  // Gateway Response (for external payment gateways)
  gatewayResponse: {
    transactionId: {
      type: String,
      trim: true
    },
    gatewayStatus: {
      type: String,
      trim: true
    },
    gatewayMessage: {
      type: String,
      trim: true
    },
    gatewayReference: {
      type: String,
      trim: true
    },
    rawResponse: mongoose.Schema.Types.Mixed
  },
  
  // Refund Information - Enhanced tracking
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    },
    refundType: {
      type: String,
      enum: ['full', 'partial'],
      default: 'full'
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Refund reason cannot exceed 500 characters']
    },
    requestedAt: {
      type: Date
    },
    processedAt: {
      type: Date
    },
    refundId: {
      type: String,
      trim: true
    },
    gatewayRefundId: {
      type: String,
      trim: true
    }
  },
  
  // Payment confirmation number
  confirmationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Notes for internal use
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ 'paymentDetails.mobile.transactionId': 1 }, { sparse: true });
// Note: booking and confirmationNumber indexes are automatically created by unique: true

// Virtual for payment description
paymentSchema.virtual('description').get(function() {
  return `Payment for booking ${this.booking}`;
});

// Virtual for full name
paymentSchema.virtual('personalInfo.fullName').get(function() {
  if (this.personalInfo && this.personalInfo.firstName && this.personalInfo.lastName) {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
  }
  return '';
});

// Virtual for formatted confirmation number
paymentSchema.virtual('formattedConfirmationNumber').get(function() {
  if (this.confirmationNumber) {
    return `PAY-${this.confirmationNumber}`;
  }
  return null;
});

// Virtual for net amount (after refunds)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - (this.refund.refundAmount || 0);
});

// Virtual for payment method display name
paymentSchema.virtual('paymentMethodDisplay').get(function() {
  const methodNames = {
    'bkash': 'bKash',
    'nagad': 'Nagad',
    'rocket': 'Rocket',
    'mobile_banking': 'Mobile Banking',
    'bank_transfer': 'Bank Transfer',
    'credit_card': 'Credit/Debit Card',
    'cash': 'Cash'
  };
  return methodNames[this.paymentMethod] || this.paymentMethod;
});

// Pre-save middleware to generate confirmation number
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.confirmationNumber) {
    this.confirmationNumber = Math.random().toString(36).substr(2, 12).toUpperCase();
  }
  next();
});

// Pre-save middleware to calculate total amount from breakdown
paymentSchema.pre('save', function(next) {
  if (this.isModified('amountBreakdown')) {
    const breakdown = this.amountBreakdown;
    this.amount = (breakdown.baseAmount || 0) +
                  (breakdown.serviceFee || 0) +
                  (breakdown.cleaningFee || 0) +
                  (breakdown.securityDeposit || 0) +
                  (breakdown.taxAmount || 0) -
                  (breakdown.discountAmount || 0);
  }
  next();
});

// Pre-save middleware to set status timestamps
paymentSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'processing':
        if (!this.processedAt) this.processedAt = now;
        break;
      case 'paid':
        if (!this.paidAt) this.paidAt = now;
        if (!this.processedAt) this.processedAt = now;
        break;
      case 'failed':
        if (!this.failedAt) this.failedAt = now;
        if (!this.processedAt) this.processedAt = now;
        break;
      case 'refunded':
        if (!this.refund.processedAt) this.refund.processedAt = now;
        break;
    }
  }
  
  next();
});

// Instance method to mark payment as completed/paid
paymentSchema.methods.markAsPaid = function() {
  this.status = 'paid';
  this.paidAt = new Date();
  if (!this.processedAt) this.processedAt = new Date();
  return this.save();
};

// Instance method to mark payment as failed
paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.failedAt = new Date();
  if (!this.processedAt) this.processedAt = new Date();
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(refundAmount, reason, refundType = 'full') {
  const amount = refundAmount || this.amount;
  
  this.refund = {
    isRefunded: true,
    refundAmount: amount,
    refundType: refundType,
    reason: reason,
    requestedAt: this.refund.requestedAt || new Date(),
    processedAt: new Date(),
    refundId: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  };
  
  // Update status based on refund amount
  if (amount >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partial';
  }
  
  return this.save();
};

// Instance method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function() {
  return this.status === 'paid' && !this.refund.isRefunded;
};

// Instance method to get payment summary
paymentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    amount: this.amount,
    netAmount: this.netAmount,
    status: this.status,
    paymentMethod: this.paymentMethodDisplay,
    confirmationNumber: this.formattedConfirmationNumber,
    paidAt: this.paidAt,
    isRefunded: this.refund.isRefunded
  };
};

// Static method to find payments by user
paymentSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ user: userId })
    .populate('booking', 'startDate endDate status confirmationCode')
    .sort({ createdAt: -1 });
    
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = function(userId) {
  const matchStage = userId ? { user: mongoose.Types.ObjectId(userId) } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalRefunded: { $sum: '$refund.refundAmount' }
      }
    },
    {
      $group: {
        _id: null,
        stats: {
          $push: {
            status: '$_id',
            count: '$count',
            totalAmount: '$totalAmount',
            totalRefunded: '$totalRefunded'
          }
        },
        totalPayments: { $sum: '$count' },
        totalRevenue: { $sum: '$totalAmount' },
        totalRefunds: { $sum: '$totalRefunded' }
      }
    }
  ]);
};

// Static method to find payments needing processing
paymentSchema.statics.findPendingPayments = function() {
  return this.find({ status: 'pending' })
    .populate('booking')
    .populate('user', 'name email')
    .sort({ createdAt: 1 });
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;