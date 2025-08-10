import express from 'express';
import { verifyToken, checkAuth } from '../middleware/auth.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

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
    
    // Get list of booked service IDs to exclude
    const bookedServices = await Booking.find({
      status: { $in: ['confirmed', 'active'] },
      paymentStatus: 'paid'
    }).distinct('service');
    
    if (bookedServices.length > 0) {
      filter._id = { $nin: bookedServices };
    }
    
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
router.post('/services', verifyToken, checkAuth, async (req, res) => {
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
      amenities: amenities || {
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
      photos: [], // Will be handled by file upload later
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
    const { serviceId, startDate, endDate, guestInfo, contactInfo } = req.body;
    
    // Validate required fields
    if (!serviceId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Service ID, start date, and end date are required' });
    }
    
    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if service is available for booking
    if (!service.availability.isAvailable) {
      return res.status(400).json({ message: 'This service is no longer available for booking' });
    }
    
    // Check if user has already booked this service
    const existingBooking = await Booking.findOne({
      service: serviceId,
      user: req.user._id,
      status: { $in: ['pending', 'confirmed', 'active'] }
    });
    
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this service' });
    }
    
    // Check if service is already booked by anyone
    const serviceBooked = await Booking.findOne({
      service: serviceId,
      status: { $in: ['confirmed', 'active'] },
      paymentStatus: 'paid'
    });
    
    if (serviceBooked) {
      return res.status(400).json({ message: 'This service has already been booked by another user' });
    }
    
    // Check availability for the specific dates
    const isAvailable = await Booking.checkAvailability(serviceId, new Date(startDate), new Date(endDate));
    if (!isAvailable) {
      return res.status(400).json({ message: 'Service is not available for the selected dates' });
    }
    
    // Calculate duration and total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const durationInMonths = Math.ceil(durationInDays / 30);
    
    const basePrice = service.price;
    const totalAmount = basePrice * durationInMonths;
    
    // Create booking
    const booking = new Booking({
      service: serviceId,
      user: req.user._id,
      startDate: start,
      endDate: end,
      duration: {
        days: durationInDays,
        months: durationInMonths
      },
      basePrice,
      totalAmount,
      guestInfo: guestInfo || { numberOfGuests: 1 },
      contactInfo: contactInfo || {
        phone: req.user.phone || '',
        email: req.user.email
      }
    });
    
    await booking.save();
    
    // Populate the booking with service and user details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title propertyType location price images')
      .populate('user', 'name email');
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Process payment (protected)
router.post('/payments', verifyToken, checkAuth, async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentDetails, personalInfo, termsAccepted } = req.body;
    
    // Validate required fields
    if (!bookingId || !paymentMethod || !personalInfo || !termsAccepted) {
      return res.status(400).json({ message: 'All payment fields are required and terms must be accepted' });
    }
    
    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('service');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }
    
    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this booking' });
    }
    
    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment record
    const payment = new Payment({
      booking: bookingId,
      user: req.user._id,
      service: booking.service._id,
      amount: booking.totalAmount,
      paymentMethod,
      paymentDetails: {
        ...paymentDetails,
        transactionId
      },
      personalInfo,
      termsAccepted,
      status: 'processing'
    });
    
    await payment.save();
    
    // Simulate payment processing (replace with real payment gateway integration)
    setTimeout(async () => {
      try {
        // Mark payment as completed
        payment.markAsCompleted(transactionId, { gateway: 'simulated', success: true });
        await payment.save();
        
        // Update booking payment status
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();
        
        // Mark service as booked (unavailable)
        const service = await Service.findById(booking.service._id);
        if (service) {
          service.availability.isAvailable = false;
          await service.save();
        }
        
        console.log(`Payment ${payment._id} completed successfully`);
        console.log(`Service ${booking.service._id} marked as booked`);
      } catch (error) {
        console.error('Payment processing error:', error);
        payment.markAsFailed('Processing failed', { error: error.message });
        await payment.save();
      }
    }, 2000); // 2 second delay to simulate processing
    
    res.status(201).json({
      message: 'Payment initiated successfully',
      payment: {
        _id: payment._id,
        transactionId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// Get user's bookings (protected)
router.get('/bookings', verifyToken, checkAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { user: req.user._id };
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(filter);
    
    // Fetch bookings with pagination
    const bookings = await Booking.find(filter)
      .populate('service', 'title propertyType location price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalBookings / limit);
    
    res.json({ 
       bookings,
       pagination: {
         current: parseInt(page),
         total: totalPages,
         count: bookings.length,
         totalBookings
       }
     });
   } catch (error) {
     console.error('Get bookings error:', error);
     res.status(500).json({ message: 'Failed to fetch bookings' });
   }
 });

// Get user's payments (protected)
router.get('/payments', verifyToken, checkAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { user: req.user._id };
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Get total count for pagination
    const totalPayments = await Payment.countDocuments(filter);
    
    // Fetch payments with pagination
    const payments = await Payment.find(filter)
      .populate('booking', 'startDate endDate confirmationCode')
      .populate('service', 'title propertyType location images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalPayments / limit);
    
    res.json({ 
       payments,
       pagination: {
         current: parseInt(page),
         total: totalPages,
         count: payments.length,
         totalPayments
       }
     });
   } catch (error) {
     console.error('Get payments error:', error);
     res.status(500).json({ message: 'Failed to fetch payments' });
   }
 });

export default router;