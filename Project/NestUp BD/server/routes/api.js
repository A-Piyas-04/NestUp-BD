import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Protected route example
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Public route example
router.get('/public', (req, res) => {
  res.json({ message: 'This is a public route' });
});

export default router;