import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Service from '../models/Service.js';

const router = express.Router();

// GET all services (public)
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find().populate('user', 'name email');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST a service (protected)
router.post('/services', verifyToken, async (req, res) => {
  try {
    const newService = await Service.create({ ...req.body, user: req.user.id });
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post service' });
  }
});


export default router;