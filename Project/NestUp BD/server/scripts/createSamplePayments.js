import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from '../models/Payment.js';
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

const createSamplePayments = async () => {
  try {
    // Find the user (Piyas)
    const user = await User.findOne({ email: 'pias34@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Found user:', user.name, user.email);
    
    // Find or create a sample service
    let service = await Service.findOne({ owner: user._id });
    if (!service) {
      // Create a sample service if none exists
      service = new Service({
        title: 'Sample Cozy Apartment',
        description: 'A beautiful apartment for testing',
        owner: user._id,
        location: {
          district: 'Dhaka',
          area: 'Dhanmondi',
          address: '123 Test Street'
        },
        propertyType: 'apartment',
        price: 2500,
        capacity: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: {
          wifi: true,
          parking: true,
          kitchen: true,
          airConditioning: true
        },
        images: ['https://via.placeholder.com/400x300']
      });
      await service.save();
      console.log('Created sample service:', service.title);
    }
    
    // Create sample bookings and payments with past dates (for completed bookings)
    const now = new Date();
    const pastDate1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const pastDate2 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    const pastDate3 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    
    const sampleBookings = [
      {
        startDate: new Date(pastDate1.getTime() - 5 * 24 * 60 * 60 * 1000),
        endDate: pastDate1,
        totalAmount: 12500,
        status: 'approved',
        paymentStatus: 'paid'
      },
      {
        startDate: new Date(pastDate2.getTime() - 5 * 24 * 60 * 60 * 1000),
        endDate: pastDate2,
        totalAmount: 12500,
        status: 'approved',
        paymentStatus: 'paid'
      },
      {
        startDate: new Date(pastDate3.getTime() - 3 * 24 * 60 * 60 * 1000),
        endDate: pastDate3,
        totalAmount: 7500,
        status: 'approved',
        paymentStatus: 'paid'
      }
    ];
    
    // Create bookings directly in database to bypass validation
    const bookingsToInsert = sampleBookings.map((bookingData, i) => ({
      service: service._id,
      user: user._id,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      basePrice: service.price,
      totalAmount: bookingData.totalAmount,
      status: bookingData.status,
      paymentStatus: bookingData.paymentStatus,
      guestInfo: {
        numberOfGuests: 2,
        specialRequests: 'Sample booking for testing'
      },
      contactInfo: {
        phone: '+8801234567890',
        email: user.email
      },
      isApproved: true,
      approvedAt: bookingData.startDate,
      confirmedAt: bookingData.startDate,
      completedAt: bookingData.endDate,
      confirmationCode: Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: bookingData.startDate,
      updatedAt: bookingData.endDate
    }));
    
    const insertedBookings = await Booking.collection.insertMany(bookingsToInsert);
    console.log('Created sample bookings:', insertedBookings.insertedCount);
    
    // Get the inserted booking IDs
    const bookingIds = Object.values(insertedBookings.insertedIds);
    
    for (let i = 0; i < bookingIds.length; i++) {
      const bookingId = bookingIds[i];
      const bookingData = sampleBookings[i];
      
      // Create corresponding payment
      const payment = new Payment({
        booking: bookingId,
        user: user._id,
        amount: bookingData.totalAmount,
        amountBreakdown: {
          baseAmount: bookingData.totalAmount,
          serviceFee: 0,
          cleaningFee: 0,
          securityDeposit: 0,
          taxAmount: 0,
          discountAmount: 0
        },
        currency: 'BDT',
        paymentMethod: 'mobile_banking',
        paymentDetails: {
          mobile: {
            phoneNumber: '+8801234567890',
            transactionId: `TXN${Date.now()}${i}`,
            senderNumber: '+8801234567890'
          }
        },
        status: 'paid',
        termsAccepted: true,
        personalInfo: {
          firstName: user.name.split(' ')[0] || 'Piyas',
          lastName: user.name.split(' ')[1] || 'Ahmed',
          email: user.email,
          phone: '+8801234567890',
          address: {
            street: '123 Test Street',
            city: 'Dhaka',
            state: 'Dhaka',
            postalCode: '1000',
            country: 'Bangladesh'
          }
        },
        paidAt: bookingData.endDate
      });
      
      await payment.save();
      console.log(`Created sample payment ${i + 1}:`, payment._id);
      
      // Update booking with payment reference
      await Booking.collection.updateOne(
        { _id: bookingId },
        { $set: { payment: payment._id } }
      );
    }
    
    console.log('Sample payments created successfully!');
    
  } catch (error) {
    console.error('Error creating sample payments:', error);
  }
};

const main = async () => {
  await connectDB();
  await createSamplePayments();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

main();