import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['apartment', 'house', 'room', 'hostel', 'dormitory', 'sublet']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Location Details
  location: {
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Pricing & Availability
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // Thumbnail image (main display image)
  thumbnail: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(https?:\/\/|\/)/.test(v);
      },
      message: 'Please provide a valid thumbnail URL or path'
    }
  },
  availability: {
    from: {
      type: Date,
      required: [true, 'Available from date is required']
    },
    to: {
      type: Date,
      required: [true, 'Available to date is required']
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },

  // Booking Status
  isBooked: {
    type: Boolean,
    default: false
  },

  // Reference to the confirmed booking (if any)
  currentBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  
  // Property Details
  propertyDetails: {
    bedrooms: {
      type: String,
      required: [true, 'Number of bedrooms is required']
    },
    bathrooms: {
      type: String,
      required: [true, 'Number of bathrooms is required']
    },
    squareFeet: {
      type: Number,
      min: [0, 'Square feet cannot be negative']
    },
    furnishing: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
      default: 'unfurnished'
    }
  },
  
  // Amenities & Features
  amenities: {
    wifi: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    studyArea: { type: Boolean, default: false },
    securityGuard: { type: Boolean, default: false },
    cctv: { type: Boolean, default: false }
  },
  
  // Photos & Media
  photos: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v) || v.startsWith('/uploads/');
      },
      message: 'Please provide a valid image URL or path'
    }
  }],
  
  // Contact Information
  contact: {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true
    },
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
    },
    whatsapp: {
      type: String,
      trim: true
    }
  },
  
  // Owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Service owner is required']
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    // Category-specific ratings
    categories: {
      cleanliness: { type: Number, default: 0, min: 0, max: 5 },
      communication: { type: Number, default: 0, min: 0, max: 5 },
      location: { type: Number, default: 0, min: 0, max: 5 },
      value: { type: Number, default: 0, min: 0, max: 5 },
      amenities: { type: Number, default: 0, min: 0, max: 5 }
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to update service rating based on reviews from Review model
serviceSchema.statics.updateServiceRating = async function(serviceId) {
  try {
    const Review = mongoose.model('Review');
    
    // Get all approved reviews for this service
    const reviews = await Review.find({ 
      service: serviceId, 
      status: 'approved' 
    });
    
    if (reviews.length === 0) {
      // No reviews, reset ratings
      await this.findByIdAndUpdate(serviceId, {
        'rating.average': 0,
        'rating.count': 0,
        'rating.categories.cleanliness': 0,
        'rating.categories.communication': 0,
        'rating.categories.location': 0,
        'rating.categories.value': 0,
        'rating.categories.amenities': 0
      });
      return;
    }
    
    // Calculate overall average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
    
    // Calculate category averages
    const categoryTotals = {
      cleanliness: { sum: 0, count: 0 },
      communication: { sum: 0, count: 0 },
      location: { sum: 0, count: 0 },
      value: { sum: 0, count: 0 },
      amenities: { sum: 0, count: 0 }
    };
    
    reviews.forEach(review => {
      if (review.categories) {
        Object.keys(categoryTotals).forEach(category => {
          if (review.categories[category] != null) {
            categoryTotals[category].sum += review.categories[category];
            categoryTotals[category].count += 1;
          }
        });
      }
    });
    
    const categoryAverages = {};
    Object.keys(categoryTotals).forEach(category => {
      const { sum, count } = categoryTotals[category];
      categoryAverages[`rating.categories.${category}`] = count > 0 
        ? Math.round((sum / count) * 10) / 10 
        : 0;
    });
    
    // Update service with new ratings
    await this.findByIdAndUpdate(serviceId, {
      'rating.average': averageRating,
      'rating.count': reviews.length,
      ...categoryAverages
    });
    
  } catch (error) {
    console.error('Error updating service rating:', error);
    throw error;
  }
};

// Virtual to get reviews from Review model
serviceSchema.virtual('reviewsData', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service',
  match: { status: 'approved' },
  options: { sort: { createdAt: -1 } }
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;