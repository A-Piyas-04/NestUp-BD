import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Reference to booking
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  
  // Reference to user making payment
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Reference to service being paid for
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required']
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  
  currency: {
    type: String,
    default: 'BDT',
    enum: ['BDT', 'USD']
  },
  
  // Payment Method Information
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['mobile_banking', 'bank_transfer', 'credit_card', 'cash']
  },
  
  // Payment Method Specific Details
  paymentDetails: {
    // For mobile banking (bKash, Nagad, etc.)
    mobileNumber: {
      type: String,
      trim: true
    },
    
    // For bank transfer
    bankName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    
    // For credit/debit card
    cardNumber: {
      type: String,
      trim: true
    },
    cardHolderName: {
      type: String,
      trim: true
    },
    
    // Transaction reference
    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // Allows multiple null values
    }
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Personal Information (from payment form)
  personalInfo: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    nidNumber: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    }
  },
  
  // Terms and Conditions
  termsAccepted: {
    type: Boolean,
    required: [true, 'Terms must be accepted'],
    default: false
  },
  
  // Payment Processing Information
  processedAt: {
    type: Date
  },
  
  failureReason: {
    type: String,
    trim: true
  },
  
  // Gateway Response (for payment gateway integration)
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Refund Information
  refund: {
    amount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    reason: {
      type: String,
      trim: true
    },
    processedAt: {
      type: Date
    },
    refundTransactionId: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ service: 1 });
paymentSchema.index({ status: 1 });
// Note: transactionId index is automatically created by unique: true

// Virtual for payment description
paymentSchema.virtual('description').get(function() {
  return `Payment for ${this.service?.title || 'property booking'}`;
});

// Method to mark payment as completed
paymentSchema.methods.markAsCompleted = function(transactionId, gatewayResponse = null) {
  this.status = 'completed';
  this.processedAt = new Date();
  if (transactionId) {
    this.paymentDetails.transactionId = transactionId;
  }
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function(reason, gatewayResponse = null) {
  this.status = 'failed';
  this.failureReason = reason;
  this.processedAt = new Date();
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function(refundAmount, reason, refundTransactionId = null) {
  this.status = 'refunded';
  this.refund = {
    amount: refundAmount,
    reason: reason,
    processedAt: new Date(),
    refundTransactionId: refundTransactionId
  };
  return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount
    };
    return acc;
  }, {});
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;