import express from 'express';
import { verifyToken, checkAuth } from '../middleware/auth.js';
import Service from '../models/Service.js';

const router = express.Router();

// Public route - no authentication required
router.get('/public', (req, res) => {
  res.json({ message: 'This is a public endpoint' });
});

// Protected route - authentication required
router.get('/protected', verifyToken, checkAuth, (req, res) => {
  res.json({ 
    message: 'This is a protected endpoint',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Get all services
router.get('/services', async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { availability: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get services with pagination
    const services = await Service.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Service.countDocuments(filter);
    
    res.json({
      services,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: services.length,
        totalServices: total
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// Get single service
router.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('reviews.user', 'name');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Failed to fetch service' });
  }
});

// Create new service (protected)
router.post('/services', verifyToken, checkAuth, async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      owner: req.user._id
    };
    
    const service = new Service(serviceData);
    await service.save();
    
    const populatedService = await Service.findById(service._id)
      .populate('owner', 'name email');
    
    res.status(201).json({
      message: 'Service created successfully',
      service: populatedService
    });
  } catch (error) {
    console.error('Create service error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Failed to create service' });
  }
});

// Update service (protected)
router.put('/services/:id', verifyToken, checkAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if user owns the service
    if (service.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }
    
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');
    
    res.json({
      message: 'Service updated successfully',
      service: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Failed to update service' });
  }
});

// Delete service (protected)
router.delete('/services/:id', verifyToken, checkAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if user owns the service
    if (service.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }
    
    await Service.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Failed to delete service' });
  }
});

export default router;