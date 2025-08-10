import express from 'express';
import { verifyToken, checkAuth } from '../middleware/auth.js';
import Service from '../models/Service.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import upload from '../middleware/upload.js';

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
    const { propertyType, district, area, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { 'availability.isAvailable': true };
    
    if (propertyType) {
      filter.propertyType = propertyType;
    }
    
    if (district) {
      filter['location.district'] = new RegExp(district, 'i');
    }
    
    if (area) {
      filter['location.area'] = new RegExp(area, 'i');
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

// Get user's own services (protected)
router.get('/my-services', verifyToken, checkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get user's services with pagination
    const services = await Service.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Service.countDocuments({ owner: req.user._id });
    
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
    console.error('Get user services error:', error);
    res.status(500).json({ message: 'Failed to fetch your services' });
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
router.post('/services', verifyToken, checkAuth, upload.single('thumbnail'), async (req, res) => {
  try {
    const {
      title,
      propertyType,
      description,
      district,
      area,
      address,
      price,
      availableFrom,
      availableTo,
      bedrooms,
      bathrooms,
      squareFeet,
      furnishing,
      amenities,
      contactName,
      contactPhone,
      contactEmail,
      contactWhatsapp
    } = req.body;
    
    // Structure the data according to the new schema
    const serviceData = {
      title,
      propertyType,
      description,
      location: {
        district,
        area,
        address
      },
      price: Number(price),
      availability: {
        from: new Date(availableFrom),
        to: new Date(availableTo),
        isAvailable: true
      },
      propertyDetails: {
        bedrooms,
        bathrooms,
        squareFeet: squareFeet ? Number(squareFeet) : undefined,
        furnishing: furnishing || 'unfurnished'
      },
      amenities: amenities ? JSON.parse(amenities) : {
        wifi: false,
        ac: false,
        parking: false,
        kitchen: false,
        laundry: false,
        studyArea: false,
        securityGuard: false,
        cctv: false
      },
      contact: {
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
        whatsapp: contactWhatsapp || ''
      },
      thumbnail: req.file ? `/uploads/${req.file.filename}` : null,
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

// Create booking (protected)
router.post('/bookings', verifyToken, checkAuth, async (req, res) => {
  try {
    const {
      serviceId,
      startDate,
      endDate,
      guestInfo,
      contactInfo
    } = req.body;

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user is trying to book their own service
    if (service.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own listing' });
    }

    // Check availability
    const isAvailable = await Booking.checkAvailability(serviceId, new Date(startDate), new Date(endDate));
    if (!isAvailable) {
      return res.status(400).json({ message: 'Service is not available for the selected dates' });
    }

    // Calculate duration and total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = service.price * durationInDays;

    // Create booking
    const booking = new Booking({
      service: serviceId,
      user: req.user._id,
      startDate: start,
      endDate: end,
      basePrice: service.price,
      totalAmount,
      guestInfo,
      contactInfo,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title location price')
      .populate('user', 'name email');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Get user's bookings (protected)
router.get('/my-bookings', verifyToken, checkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const bookings = await Booking.find(filter)
      .populate('service', 'title location price thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Booking.countDocuments(filter);
    
    res.json({
      bookings,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: bookings.length,
        totalBookings: total
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get host's bookings (protected)
router.get('/host-bookings', verifyToken, checkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const skip = (page - 1) * limit;
    
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      { $match: { 'service.owner': req.user._id } },
      ...(status ? [{ $match: { status } }] : []),
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          'user.password': 0,
          'user.refreshToken': 0
        }
      }
    ]);
    
    res.json({ bookings });
  } catch (error) {
    console.error('Get host bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch host bookings' });
  }
});

// Process payment (protected)
router.post('/payments', verifyToken, checkAuth, async (req, res) => {
  try {
    const {
      bookingId,
      paymentMethod,
      paymentDetails,
      personalInfo,
      termsAccepted
    } = req.body;

    // Check if booking exists
    const booking = await Booking.findById(bookingId)
      .populate('service', 'title price owner')
      .populate('user', 'name email');
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }

    // Create payment record
    const payment = new Payment({
      booking: bookingId,
      user: req.user._id,
      service: booking.service._id,
      amount: booking.totalAmount,
      currency: 'BDT',
      paymentMethod,
      paymentDetails,
      personalInfo,
      termsAccepted,
      status: 'processing'
    });

    await payment.save();

    // Simulate payment processing (in real implementation, integrate with payment gateway)
    setTimeout(async () => {
      try {
        // Mark payment as completed
        await payment.markAsCompleted('TXN' + Date.now());
        
        // Update booking status
        await booking.confirm();
        
        console.log(`Payment ${payment._id} completed successfully`);
      } catch (error) {
        console.error('Payment processing error:', error);
        await payment.markAsFailed('Payment processing failed');
      }
    }, 2000);

    res.status(201).json({
      message: 'Payment initiated successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

// Get payment status (protected)
router.get('/payments/:paymentId', verifyToken, checkAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('booking', 'startDate endDate status')
      .populate('service', 'title location')
      .populate('user', 'name email');
      
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns the payment
    if (payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
});

// Get user's payment history (protected)
router.get('/my-payments', verifyToken, checkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const payments = await Payment.find(filter)
      .populate('booking', 'startDate endDate duration')
      .populate('service', 'title location thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Payment.countDocuments(filter);
    
    res.json({
      payments,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: payments.length,
        totalPayments: total
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
});

// Wishlist endpoints

// Add to wishlist
router.post('/wishlist/add', verifyToken, checkAuth, async (req, res) => {
  try {
    const { serviceId } = req.body;
    const userId = req.user._id;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Add to user's wishlist if not already present
    const user = await User.findById(userId);
    if (!user.wishlist.includes(serviceId)) {
      user.wishlist.push(serviceId);
      await user.save();
    }

    res.json({ message: 'Added to wishlist successfully' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/wishlist/remove/:serviceId', verifyToken, checkAuth, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user._id;

    // Remove from user's wishlist
    await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: serviceId } },
      { new: true }
    );

    res.json({ message: 'Removed from wishlist successfully' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
});

// Get user's wishlist
router.get('/wishlist', verifyToken, checkAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      populate: {
        path: 'owner',
        select: 'name email profile.phone'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

// Check if service is in wishlist
router.get('/wishlist/check/:serviceId', verifyToken, checkAuth, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isInWishlist = user.wishlist.includes(serviceId);

    res.json({ isInWishlist });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Failed to check wishlist status' });
  }
});

export default router;