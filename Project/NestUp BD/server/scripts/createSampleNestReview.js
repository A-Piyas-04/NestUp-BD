import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NestReview from '../models/NestReview.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createSampleNestReview = async () => {
  try {
    // Find the user (Piyas)
    const user = await User.findOne({ email: 'pias34@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Found user:', user.name, user.email);
    
    // Find a completed booking for this user
    const booking = await Booking.findOne({ 
      user: user._id, 
      status: 'approved',
      nestReviewSubmitted: { $ne: true }
    }).populate('service');
    
    if (!booking) {
      console.log('No eligible booking found for review');
      return;
    }
    
    console.log('Found booking:', booking._id, 'for service:', booking.service.title);
    
    // Check if review already exists
    const existingReview = await NestReview.findOne({
      reviewer: user._id,
      booking: booking._id
    });
    
    if (existingReview) {
      console.log('Review already exists for this booking');
      return;
    }
    
    // Create a sample nest review
    const nestReview = new NestReview({
      reviewer: user._id,
      service: booking.service._id,
      booking: booking._id,
      rating: 5,
      comment: 'Amazing place! The host was very welcoming and the apartment was exactly as described. Clean, comfortable, and in a great location. Would definitely stay here again!',
      categories: {
        cleanliness: 5,
        location: 5,
        amenities: 4,
        value: 5,
        accuracy: 5
      },
      status: 'approved'
    });
    
    await nestReview.save();
    console.log('Created nest review:', nestReview._id);
    
    // Update booking to mark nest review as submitted
    await Booking.findByIdAndUpdate(booking._id, {
      nestReviewSubmitted: true,
      nestReviewId: nestReview._id
    });
    
    console.log('Updated booking with review reference');
    
    // Verify the review was created and can be fetched
    const hostReviews = await NestReview.find({
      service: { $in: await Service.find({ owner: booking.service.owner }).distinct('_id') }
    }).populate('reviewer', 'name avatar').populate('service', 'title');
    
    console.log('Host now has', hostReviews.length, 'reviews');
    hostReviews.forEach(review => {
      console.log('- Review by', review.reviewer.name, 'for', review.service.title, 'Rating:', review.rating);
    });
    
    console.log('Sample nest review created successfully!');
    
  } catch (error) {
    console.error('Error creating sample nest review:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  createSampleNestReview();
});