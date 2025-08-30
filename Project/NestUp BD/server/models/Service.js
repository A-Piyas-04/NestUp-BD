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


  
  // Rating System
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
    breakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
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

// Static method to update service rating based on reviews
serviceSchema.statics.updateServiceRating = async function(serviceId) {
  try {
    const NestReview = mongoose.model('NestReview');
    
    // Get all approved reviews for this service
    const reviews = await NestReview.find({ 
      service: serviceId, 
      status: 'approved' 
    });
    
    if (reviews.length === 0) {
      // No reviews, reset rating
      await this.findByIdAndUpdate(serviceId, {
        'rating.average': 0,
        'rating.count': 0,
        'rating.breakdown.5': 0,
        'rating.breakdown.4': 0,
        'rating.breakdown.3': 0,
        'rating.breakdown.2': 0,
        'rating.breakdown.1': 0
      });
      return;
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.floor(review.rating); // Round down to nearest integer
      if (breakdown[rating] !== undefined) {
        breakdown[rating]++;
      }
    });
    
    // Update service with new rating data
    await this.findByIdAndUpdate(serviceId, {
      'rating.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      'rating.count': reviews.length,
      'rating.breakdown.5': breakdown[5],
      'rating.breakdown.4': breakdown[4],
      'rating.breakdown.3': breakdown[3],
      'rating.breakdown.2': breakdown[2],
      'rating.breakdown.1': breakdown[1]
    });
    
    console.log(`Updated rating for service ${serviceId}: ${averageRating.toFixed(1)} (${reviews.length} reviews)`);
    
  } catch (error) {
    console.error('Error updating service rating:', error);
    throw error;
  }
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;