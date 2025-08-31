import mongoose from 'mongoose';

const hostReviewSchema = new mongoose.Schema({
  // Reference to the user who wrote the review (guest)
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to the host user being reviewed
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to the completed booking
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  // Overall rating from 1 to 5
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
  
  // Host-specific review categories
  categories: {
    communication: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    responsiveness: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    professionalism: {
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
    default: 'approved' // Auto-approve for now
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
  

  
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
hostReviewSchema.index({ host: 1, createdAt: -1 });
hostReviewSchema.index({ reviewer: 1, createdAt: -1 });
hostReviewSchema.index({ booking: 1 });
hostReviewSchema.index({ rating: 1 });
hostReviewSchema.index({ status: 1 });

// Compound index for preventing duplicate reviews per booking
hostReviewSchema.index({ reviewer: 1, booking: 1 }, { unique: true });

// Virtual for calculating overall category rating
hostReviewSchema.virtual('categoryAverage').get(function() {
  const categories = this.categories;
  if (!categories) return null;
  
  const ratings = Object.values(categories).filter(rating => rating != null);
  if (ratings.length === 0) return null;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Pre-save middleware to validate booking completion
hostReviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Booking = mongoose.model('Booking');
      const booking = await Booking.findById(this.booking).populate('service');
      
      if (!booking) {
        return next(new Error('Booking not found'));
      }
      
      if (booking.user.toString() !== this.reviewer.toString()) {
        return next(new Error('User can only review their own bookings'));
      }
      
      if (booking.status !== 'approved') {
        return next(new Error('Can only review approved bookings'));
      }
      
      // Ensure host matches the service owner
      if (booking.service.owner.toString() !== this.host.toString()) {
        return next(new Error('Host must be the owner of the booked service'));
      }
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post-save middleware to update host rating in User model
hostReviewSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    await User.updateHostRating(this.host);
  } catch (error) {
    console.error('Error updating host rating:', error);
  }
});

// Post-remove middleware to update host rating when review is deleted
hostReviewSchema.post('remove', async function() {
  try {
    const User = mongoose.model('User');
    await User.updateHostRating(this.host);
  } catch (error) {
    console.error('Error updating host rating after review deletion:', error);
  }
});

// Static method to get host reviews with pagination
hostReviewSchema.statics.getHostReviewsWithPagination = function(hostId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = 'approved',
    minRating = null,
    maxRating = null
  } = options;
  
  const query = { host: hostId, status };
  
  if (minRating !== null) query.rating = { ...query.rating, $gte: minRating };
  if (maxRating !== null) query.rating = { ...query.rating, $lte: maxRating };
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  return this.find(query)
    .populate('reviewer', 'name profilePicture')
    .populate('booking', 'service startDate endDate')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get host review statistics
hostReviewSchema.statics.getHostReviewStats = function(hostId) {
  return this.aggregate([
    { $match: { host: new mongoose.Types.ObjectId(hostId), status: 'approved' } },
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
            communication: '$categories.communication',
            responsiveness: '$categories.responsiveness',
            helpfulness: '$categories.helpfulness',
            reliability: '$categories.reliability',
            professionalism: '$categories.professionalism'
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

export default mongoose.model('HostReview', hostReviewSchema);