import express from 'express';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find profile by user ID
    let profile = await Profile.findOne({ user: userId });
    
    // If no profile exists, create a default one
    if (!profile) {
      profile = await Profile.createDefaultProfile(userId);
      
      // Update user document to reference the new profile
      await User.findByIdAndUpdate(userId, { profile: profile._id });
    }
    
    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update user's profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    // Remove any fields that shouldn't be updated directly
    delete updateData.user;
    delete updateData._id;
    delete updateData.createdAt;
    
    // Find existing profile or create new one
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      // Create new profile with the update data
      profile = new Profile({
        user: userId,
        ...updateData
      });
      
      await profile.save();
      
      // Update user document to reference the new profile
      await User.findByIdAndUpdate(userId, { profile: profile._id });
    } else {
      // Update existing profile
      Object.keys(updateData).forEach(key => {
        if (key === 'address' || key === 'emergencyContact' || key === 'preferences') {
          // For nested objects, merge with existing data
          profile[key] = { ...profile[key], ...updateData[key] };
        } else {
          profile[key] = updateData[key];
        }
      });
      
      await profile.save();
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get profile with user data (for display purposes)
router.get('/complete', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with populated profile
    const user = await User.findById(userId)
      .populate('profile')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If no profile exists, create a default one
    if (!user.profile) {
      const profile = await Profile.createDefaultProfile(userId);
      user.profile = profile;
      await User.findByIdAndUpdate(userId, { profile: profile._id });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching complete profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complete profile',
      error: error.message
    });
  }
});

// Delete profile (soft delete - just clear data but keep reference)
router.delete('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    // Reset profile to default values instead of deleting
    const defaultProfile = {
      profilePicture: null,
      phone: null,
      nidNumber: null,
      dateOfBirth: null,
      gender: null,
      occupation: null,
      institution: null,
      department: null,
      studentId: null,
      address: {},
      emergencyContact: {},
      preferences: {
        receiveNotifications: true,
        newsletterSubscription: false,
        twoFactorAuth: false,
        language: 'english'
      }
    };
    
    Object.keys(defaultProfile).forEach(key => {
      profile[key] = defaultProfile[key];
    });
    
    await profile.save();
    
    res.json({
      success: true,
      message: 'Profile reset successfully',
      profile
    });
  } catch (error) {
    console.error('Error resetting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset profile',
      error: error.message
    });
  }
});

export default router;