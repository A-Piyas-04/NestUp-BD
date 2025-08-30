import mongoose from 'mongoose';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration script to move profile data from User collection to Profile collection
 * This script should be run once after deploying the new Profile model
 */
async function migrateProfiles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find all users that have profile data but no profile reference
    const usersWithEmbeddedProfiles = await User.find({
      $and: [
        { profile: { $exists: true } },
        { 'profile.phone': { $exists: true } } // Check if it's embedded profile data
      ]
    });
    
    console.log(`Found ${usersWithEmbeddedProfiles.length} users with embedded profile data`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const user of usersWithEmbeddedProfiles) {
      try {
        // Create new Profile document
        const profileData = {
          userId: user._id,
          profilePicture: user.profile.profilePicture || null,
          phone: user.profile.phone || '',
          nidNumber: user.profile.nidNumber || '',
          dateOfBirth: user.profile.dateOfBirth || null,
          gender: user.profile.gender || 'male',
          occupation: user.profile.occupation === 'student' ? null : user.profile.occupation, // Fix default student issue
          institution: user.profile.institution || '',
          department: user.profile.department || '',
          studentId: user.profile.studentId || '',
          address: {
            division: user.profile.address?.division || '',
            district: user.profile.address?.district || '',
            area: user.profile.address?.area || '',
            fullAddress: user.profile.address?.fullAddress || '',
            postalCode: user.profile.address?.postalCode || ''
          },
          emergencyContact: {
            name: user.profile.emergencyContact?.name || '',
            relation: user.profile.emergencyContact?.relation || '',
            phone: user.profile.emergencyContact?.phone || ''
          },
          preferences: {
            receiveNotifications: user.profile.preferences?.receiveNotifications ?? true,
            newsletterSubscription: user.profile.preferences?.newsletterSubscription ?? false,
            twoFactorAuth: user.profile.preferences?.twoFactorAuth ?? false,
            language: user.profile.preferences?.language || 'english'
          }
        };
        
        // Create the profile
        const newProfile = new Profile(profileData);
        await newProfile.save();
        
        // Update user to reference the new profile
        await User.findByIdAndUpdate(user._id, {
          profile: newProfile._id
        });
        
        migratedCount++;
        console.log(`Migrated profile for user: ${user.name} (${user.email})`);
        
      } catch (error) {
        errorCount++;
        console.error(`Error migrating profile for user ${user._id}:`, error.message);
      }
    }
    
    console.log(`\nMigration completed:`);
    console.log(`- Successfully migrated: ${migratedCount} profiles`);
    console.log(`- Errors encountered: ${errorCount}`);
    
    // Verify migration
    const profileCount = await Profile.countDocuments();
    const usersWithProfileRefs = await User.countDocuments({
      profile: { $type: 'objectId' }
    });
    
    console.log(`\nVerification:`);
    console.log(`- Total profiles in Profile collection: ${profileCount}`);
    console.log(`- Users with profile references: ${usersWithProfileRefs}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProfiles();
}

export default migrateProfiles;