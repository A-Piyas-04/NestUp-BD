import mongoose from 'mongoose';

const nestReviewSchema = new mongoose.Schema({
  // Reference to the user who wrote the review (guest)
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to the service/nest being reviewed
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
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
  
  // Nest-specific review categories
  categories: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    location: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    amenities: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    }
  },
  
  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved' // Auto-approve since it's from verified bookings
  },
  
  // Helpful votes
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
  
  // Flags for inappropriate content
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
  
  // Edit tracking
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
    default: false
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
nestReviewSchema.index({ service: 1, createdAt: -1 });
nestReviewSchema.index({ reviewer: 1, createdAt: -1 });
nestReviewSchema.index({ booking: 1 });
nestReviewSchema.index({ rating: 1 });
nestReviewSchema.index({ status: 1 });

// Compound index for preventing duplicate reviews per booking
nestReviewSchema.index({ reviewer: 1, booking: 1 }, { unique: true });

// Virtual for calculating overall category rating
nestReviewSchema.virtual('categoryAverage').get(function() {
  const categories = this.categories;
  if (!categories) return null;
  
  const ratings = Object.values(categories).filter(rating => rating != null);
  if (ratings.length === 0) return null;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Pre-save middleware to validate booking completion
nestReviewSchema.pre('save', async function(next) {
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
      
      if (booking.status !== 'completed') {
        return next(new Error('Can only review completed bookings'));
      }
      
      // Ensure service matches the booking
      if (booking.service._id.toString() !== this.service.toString()) {
        return next(new Error('Service must match the booked service'));
      }
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post-save middleware to update service rating
nestReviewSchema.post('save', async function() {
  try {
    const Service = mongoose.model('Service');
    await Service.updateServiceRating(this.service);
  } catch (error) {
    console.error('Error updating service rating:', error);
  }
});

// Post-remove middleware to update service rating when review is deleted
nestReviewSchema.post('remove', async function() {
  try {
    const Service = mongoose.model('Service');
    await Service.updateServiceRating(this.service);
  } catch (error) {
    console.error('Error updating service rating after review deletion:', error);
  }
});

// Static method to get service reviews with pagination
nestReviewSchema.statics.getServiceReviewsWithPagination = function(serviceId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = 'approved',
    minRating,
    maxRating
  } = options;

  const query = { service: serviceId, status };
  
  if (minRating) query.rating = { ...query.rating, $gte: minRating };
  if (maxRating) query.rating = { ...query.rating, $lte: maxRating };

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  return this.find(query)
    .populate('reviewer', 'name avatar')
    .populate('booking', 'bookingId startDate endDate')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to get review statistics for a service
nestReviewSchema.statics.getReviewStats = function(serviceId) {
  return this.aggregate([
    { $match: { service: mongoose.Types.ObjectId(serviceId), status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: {
            $switch: {
              branches: [
                { case: { $eq: ['$rating', 1] }, then: '1' },
                { case: { $eq: ['$rating', 2] }, then: '2' },
                { case: { $eq: ['$rating', 3] }, then: '3' },
                { case: { $eq: ['$rating', 4] }, then: '4' },
                { case: { $eq: ['$rating', 5] }, then: '5' }
              ],
              default: 'other'
            }
          }
        },
        averageCategories: {
          $avg: {
            cleanliness: { $ifNull: ['$categories.cleanliness', 0] },
            location: { $ifNull: ['$categories.location', 0] },
            amenities: { $ifNull: ['$categories.amenities', 0] },
            value: { $ifNull: ['$categories.value', 0] },
            accuracy: { $ifNull: ['$categories.accuracy', 0] }
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
          $arrayToObject: {
            $map: {
              input: [1, 2, 3, 4, 5],
              as: 'rating',
              in: {
                k: { $toString: '$$rating' },
                v: {
                  $size: {
                    $filter: {
                      input: '$ratingDistribution',
                      cond: { $eq: ['$$this', { $toString: '$$rating' }] }
                    }
                  }
                }
              }
            }
          }
        },
        averageCategories: 1
      }
    }
  ]);
};

const NestReview = mongoose.model('NestReview', nestReviewSchema);

export default NestReview;