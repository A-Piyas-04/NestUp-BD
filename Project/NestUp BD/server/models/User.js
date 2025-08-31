import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },


  // Profile Picture
  profilePicture: {
    type: String, // URL to profile picture
    trim: true
  },

  // Contact Information
  phone: {
    type: String,
    trim: true
  },
  nidNumber: {
    type: String,
    trim: true
  },

  // Personal Information
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  occupation: {
    type: String,
    enum: ['student', 'professional', 'business', 'government', 'other'],
    default: null
  },
  institution: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  studentId: {
    type: String,
    trim: true
  },

  // Address Information
  address: {
    division: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    area: {
      type: String,
      trim: true
    },
    fullAddress: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },

  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relation: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },

  // User Preferences
  preferences: {
    receiveNotifications: {
      type: Boolean,
      default: true
    },
    newsletterSubscription: {
      type: Boolean,
      default: false
    },
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      enum: ['english', 'bangla'],
      default: 'english'
    }
  },

  // Wishlist for saved properties
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  
  // Host rating information
  hostRating: {
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
    categories: {
      communication: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      responsiveness: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      helpfulness: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      reliability: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      professionalism: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      }
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to update host rating based on host reviews
userSchema.statics.updateHostRating = async function(hostId) {
  try {
    const HostReview = mongoose.model('HostReview');
    
    const stats = await HostReview.aggregate([
      { $match: { host: new mongoose.Types.ObjectId(hostId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          avgCommunication: { $avg: '$categories.communication' },
          avgResponsiveness: { $avg: '$categories.responsiveness' },
          avgHelpfulness: { $avg: '$categories.helpfulness' },
          avgReliability: { $avg: '$categories.reliability' },
          avgProfessionalism: { $avg: '$categories.professionalism' }
        }
      }
    ]);
    
    const hostRating = {
      average: stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0,
      count: stats.length > 0 ? stats[0].totalReviews : 0,
      categories: {
        communication: stats.length > 0 && stats[0].avgCommunication ? Math.round(stats[0].avgCommunication * 10) / 10 : 0,
        responsiveness: stats.length > 0 && stats[0].avgResponsiveness ? Math.round(stats[0].avgResponsiveness * 10) / 10 : 0,
        helpfulness: stats.length > 0 && stats[0].avgHelpfulness ? Math.round(stats[0].avgHelpfulness * 10) / 10 : 0,
        reliability: stats.length > 0 && stats[0].avgReliability ? Math.round(stats[0].avgReliability * 10) / 10 : 0,
        professionalism: stats.length > 0 && stats[0].avgProfessionalism ? Math.round(stats[0].avgProfessionalism * 10) / 10 : 0
      }
    };
    
    await this.findByIdAndUpdate(hostId, { hostRating }, { new: true });
    
  } catch (error) {
    console.error('Error updating host rating:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

export default User;