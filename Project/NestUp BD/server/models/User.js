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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Profile Information
  profile: {
    phone: {
      type: String,
      trim: true
    },
    nidNumber: {
      type: String,
      trim: true
    },
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
      default: 'student'
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
    profilePicture: {
      type: String // URL to profile picture
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

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;