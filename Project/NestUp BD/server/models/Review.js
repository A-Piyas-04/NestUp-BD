import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // Reference to the user who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to the service being reviewed
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  
  // Reference to the booking (if review is for a completed booking)
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  // Rating from 1 to 5
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: function(v) {
        return Number.isInteger(v) || (v % 0.5 === 0); // Allow integers or half ratings
      },
      message: 'Rating must be a whole number or half number between 1 and 5'
    }
  },
  
  // Review comment/text
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'Review comment must be at least 10 characters long'],
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  
  // Review images (optional)
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String, // For Cloudinary or similar service
      required: false
    },
    caption: {
      type: String,
      maxlength: 200
    }
  }],
  
  // Review categories/aspects
  categories: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    location: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    amenities: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    }
  },
  
  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved' // Auto-approve for now, can be changed to 'pending' for moderation
  },
  
  // Host reply to the review
  hostReply: {
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Host reply cannot exceed 500 characters']
    },
    repliedAt: {
      type: Date
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Helpful votes from other users
  helpfulVotes: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Flag system for inappropriate reviews
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other'],
      required: true
    },
    description: {
      type: String,
      maxlength: 200
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editHistory: [{
    editedAt: {
      type: Date,
      default: Date.now
    },
    previousRating: Number,
    previousComment: String
  }],
  
  // Verification status
  isVerified: {
    type: Boolean,
    default: false // Can be set to true if user actually stayed at the property
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reviewSchema.index({ service: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });

// Compound index for preventing duplicate reviews per booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

// Virtual for calculating overall category rating
reviewSchema.virtual('categoryAverage').get(function() {
  const categories = this.categories;
  if (!categories) return null;
  
  const ratings = Object.values(categories).filter(rating => rating != null);
  if (ratings.length === 0) return null;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Pre-save middleware to validate booking completion
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Booking = mongoose.model('Booking');
      const booking = await Booking.findById(this.booking);
      
      if (!booking) {
        return next(new Error('Booking not found'));
      }
      
      if (booking.user.toString() !== this.user.toString()) {
        return next(new Error('User can only review their own bookings'));
      }
      
      if (booking.status !== 'completed') {
        return next(new Error('Can only review completed bookings'));
      }
      
      // Ensure service matches booking
      if (booking.service.toString() !== this.service.toString()) {
        return next(new Error('Service must match the booking service'));
      }
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post-save middleware to update service rating
reviewSchema.post('save', async function() {
  try {
    const Service = mongoose.model('Service');
    await Service.updateServiceRating(this.service);
  } catch (error) {
    console.error('Error updating service rating:', error);
  }
});

// Post-remove middleware to update service rating when review is deleted
reviewSchema.post('remove', async function() {
  try {
    const Service = mongoose.model('Service');
    await Service.updateServiceRating(this.service);
  } catch (error) {
    console.error('Error updating service rating after review deletion:', error);
  }
});

// Static method to get reviews with pagination
reviewSchema.statics.getReviewsWithPagination = function(serviceId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = 'approved',
    minRating = null,
    maxRating = null
  } = options;
  
  const query = { service: serviceId, status };
  
  if (minRating !== null) query.rating = { ...query.rating, $gte: minRating };
  if (maxRating !== null) query.rating = { ...query.rating, $lte: maxRating };
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  return this.find(query)
    .populate('user', 'name avatar')
    .populate('hostReply.repliedBy', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get review statistics
reviewSchema.statics.getReviewStats = function(serviceId) {
  return this.aggregate([
    { $match: { service: new mongoose.Types.ObjectId(serviceId), status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        averageCategories: {
          $avg: {
            cleanliness: '$categories.cleanliness',
            communication: '$categories.communication',
            location: '$categories.location',
            value: '$categories.value',
            amenities: '$categories.amenities'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: {
          1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } },
          2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } }
        },
        averageCategories: 1
      }
    }
  ]);
};

export default mongoose.model('Review', reviewSchema);