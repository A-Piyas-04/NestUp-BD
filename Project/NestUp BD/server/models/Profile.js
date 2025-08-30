import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  // Reference to the user this profile belongs to (one-to-one relationship)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
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
    default: null // Changed from 'student' to null so user is not student by default
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

  // Timestamps
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
profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to create a default profile for a user
profileSchema.statics.createDefaultProfile = async function(userId) {
  try {
    const defaultProfile = new this({
      user: userId,
      preferences: {
        receiveNotifications: true,
        newsletterSubscription: false,
        twoFactorAuth: false,
        language: 'english'
      }
    });
    
    return await defaultProfile.save();
  } catch (error) {
    console.error('Error creating default profile:', error);
    throw error;
  }
};

// Instance method to get formatted occupation display
profileSchema.methods.getOccupationDisplay = function() {
  if (!this.occupation) {
    return 'Not specified';
  }
  
  if (this.occupation === 'student' && this.institution) {
    return `Student at ${this.institution}`;
  }
  
  return this.occupation.charAt(0).toUpperCase() + this.occupation.slice(1);
};

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;