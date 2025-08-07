// routes/auth.js
// Express routes for user authentication (register, login)

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Mock user data (temporary until database is added)
const users = [];

/**
 * @route POST /register
 * @desc Register a new user and return JWT token
 * @access Public
 */
// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const newUser = await User.create({ name, email, password });
    const token = jwt.sign({ id: newUser._id, name: newUser.name }, 'secret_key', { expiresIn: '1h' });

    res.status(201).json({ token, name: newUser.name });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, name: user.name }, 'secret_key', { expiresIn: '1h' });
    res.json({ token, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;