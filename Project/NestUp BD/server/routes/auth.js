import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock user data (temporary until database is added)
const users = [];

// Register endpoint
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  
  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Create new user
  const newUser = { email, password, name };
  users.push(newUser);
  
  // Generate JWT token
  const token = jwt.sign({ email, name }, 'secret_key', { expiresIn: '1h' });
  
  res.status(201).json({ token, name });
});

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(user => user.email === email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = jwt.sign({ email, name: user.name }, 'secret_key', { expiresIn: '1h' });
  
  res.json({ token, name: user.name });
});

export default router;