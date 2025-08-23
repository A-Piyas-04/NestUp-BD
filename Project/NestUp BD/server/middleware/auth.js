import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Function to get JWT_SECRET (lazy loading)
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

console.log('Auth middleware loaded. JWT_SECRET will be checked when needed.');

// Verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies first, then Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, getJWTSecret());
    
    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    return res.status(500).json({ message: 'Token verification failed.' });
  }
};

// Check if user is authenticated
export const checkAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  next();
};



// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    getJWTSecret(),
    { expiresIn: '7d' }
  );
};

export default {
  verifyToken,
  checkAuth,
  generateToken
};