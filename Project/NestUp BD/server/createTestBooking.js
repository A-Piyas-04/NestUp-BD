import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Service from './models/Service.js';
import Booking from './models/Booking.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nestupdb';

async function createTestBooking() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find a user and service to create a test booking
    const user = await User.findOne();
    const service = await Service.findOne();
    
    if (!user || !service) {
      console.log('Need at least one user and one service to create test booking');
      return;
    }
    
    console.log('Found user:', user.name, user._id);
    console.log('Found service:', service.title, service._id);
    
    // Create a test booking with isApproved: null (pending approval)
    const testBooking = new Booking({
      service: service._id,
      user: user._id,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      basePrice: service.price || 1000,
      totalAmount: (service.price || 1000) * 7, // 7 days
      status: 'pending', // Set to pending instead of active
      isApproved: null, // This is key - null means pending approval
      paymentStatus: 'pending',
      guestInfo: {
        numberOfGuests: 2,
        specialRequests: 'Test booking for approval functionality'
      },
      contactInfo: {
        phone: user.phone || '01700000000',
        email: user.email
      }
    });
    
    await testBooking.save();
    console.log('Test booking created successfully!');
    console.log('Booking ID:', testBooking._id);
    console.log('Status:', testBooking.status);
    console.log('IsApproved:', testBooking.isApproved);
    
  } catch (error) {
    console.error('Error creating test booking:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestBooking();