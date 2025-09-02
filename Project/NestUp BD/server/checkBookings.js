import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Service from './models/Service.js';
import Booking from './models/Booking.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nestupdb';

async function checkBookings() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const bookings = await Booking.find({})
      .populate('service', 'title owner')
      .populate('user', 'name email');
    
    console.log('Total bookings:', bookings.length);
    
    bookings.forEach(booking => {
      console.log('\n--- Booking Details ---');
      console.log('ID:', booking._id);
      console.log('Status:', booking.status);
      console.log('IsApproved:', booking.isApproved);
      console.log('Payment Status:', booking.paymentStatus);
      console.log('Service:', booking.service?.title || 'No service');
      console.log('Service Owner:', booking.service?.owner || 'No owner');
      console.log('User:', booking.user?.name || 'No user');
      console.log('Created:', booking.createdAt);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkBookings();