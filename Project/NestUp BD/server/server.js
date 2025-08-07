// server.js
// Main Express server setup for NestUp BD backend.

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

export const app = express();
const dbPORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend dev server
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

// Routes
app.use('/api/auth', authRoutes); // Auth endpoints
app.use('/api', apiRoutes); // Other API endpoints

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
  app.listen(dbPORT, () => {
    console.log(`Server running on port ${dbPORT}`);
  });
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});
