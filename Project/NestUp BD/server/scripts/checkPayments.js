import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from '../models/Payment.js';

// Load environment variables
dotenv.config();

const checkPayments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const userId = '68ae1806c4024255291c1dd4';
    const payments = await Payment.find({ user: userId });
    
    console.log(`Found ${payments.length} payments for user ${userId}`);
    
    payments.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`);
      console.log(`  ID: ${payment._id}`);
      console.log(`  Amount: ${payment.amount}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Created: ${payment.createdAt}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

checkPayments();