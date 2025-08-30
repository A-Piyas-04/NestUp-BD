import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nestupdb';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkBookingStatuses = async () => {
  try {
    // Find the user
    const user = await User.findOne({ email: 'pias34@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log('Found user:', user.name);

    // Find all bookings for this user
    const bookings = await Booking.find({ user: user._id })
      .populate('service', 'title')
      .sort({ createdAt: -1 });
    
    console.log('\nFound', bookings.length, 'bookings:');
    
    bookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking ID: ${booking._id}`);
      console.log(`   Service: ${booking.service.title}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Payment Status: ${booking.paymentStatus}`);
      console.log(`   Start Date: ${booking.startDate}`);
      console.log(`   End Date: ${booking.endDate}`);
      console.log(`   Created: ${booking.createdAt}`);
      console.log(`   Review Submitted: ${booking.nestReviewSubmitted || false}`);
      
      // Check if booking should be completed (end date has passed)
      const now = new Date();
      const isExpired = booking.endDate < now;
      console.log(`   Should be completed: ${isExpired}`);
    });

    // Find a booking that should be marked as completed
    const now = new Date();
    const expiredBooking = bookings.find(b => 
      b.status === 'approved' && 
      b.paymentStatus === 'paid' && 
      b.endDate < now
    );

    if (expiredBooking) {
      console.log('\n--- Marking expired booking as completed ---');
      console.log('Booking ID:', expiredBooking._id);
      
      // Update the booking status to completed
      await Booking.findByIdAndUpdate(expiredBooking._id, {
        status: 'completed',
        completedAt: new Date()
      });
      
      console.log('Booking marked as completed successfully!');
      
      // Verify the update
      const updatedBooking = await Booking.findById(expiredBooking._id);
      console.log('Updated status:', updatedBooking.status);
      console.log('Completed at:', updatedBooking.completedAt);
    } else {
      console.log('\nNo expired bookings found to mark as completed');
    }

  } catch (error) {
    console.error('Error checking booking statuses:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkBookingStatuses();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed');
};

main();