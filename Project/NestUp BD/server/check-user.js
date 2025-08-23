import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nestupdb';

async function checkUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check if user exists
    const user = await User.findOne({ email: 'pias34@gmail.com' });
    
    if (user) {
      console.log('User found:', {
        name: user.name,
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        createdAt: user.createdAt
      });
      
      // Test password comparison
      const isPasswordValid = await user.comparePassword('piyash');
      console.log('Password comparison result:', isPasswordValid);
      
      // Also test with wrong password
      const isWrongPasswordValid = await user.comparePassword('wrongpassword');
      console.log('Wrong password comparison result:', isWrongPasswordValid);
    } else {
      console.log('User not found with email: pias34@gmail.com');
      
      // List all users
      const allUsers = await User.find({}, 'name email createdAt');
      console.log('All users in database:', allUsers);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUser();