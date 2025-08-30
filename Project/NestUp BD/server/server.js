// server.js
import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import uploadRoutes from './routes/upload.js';
import nestReviewRoutes from './routes/nestReviews.js';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nestupdb';

// Middleware
app.use(cors({
  origin: 'http://localhost:5174', // Frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/nest-reviews', nestReviewRoutes);

app.use('/api', apiRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'NestUp BD Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

export default app;