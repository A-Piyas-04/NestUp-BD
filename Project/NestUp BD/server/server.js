// server.js
// Main Express server setup for NestUp BD backend.

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';

export const app = express();

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