import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import all models to ensure they're registered
import '../models/User.js';
import '../models/Service.js';
import '../models/Booking.js';
import '../models/Payment.js';
import '../models/HostReview.js';
import '../models/NestReview.js';

async function clearDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nestupdb');
    console.log('Connected to MongoDB');

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections`);

    // Clear each collection except users
    for (const collection of collections) {
      const collectionName = collection.name;
      
      // Skip the users collection
      if (collectionName === 'users') {
        console.log(`Skipping collection: ${collectionName} (preserving user data)`);
        continue;
      }
      
      console.log(`Clearing collection: ${collectionName}`);
      
      const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents from ${collectionName}`);
    }

    console.log('\n✅ All collections cleared successfully (except users)!');
    console.log('Database is now clean and ready for fresh data, with user accounts preserved.');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

// Run the cleanup
clearDatabase();