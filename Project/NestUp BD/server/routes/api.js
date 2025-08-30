import express from 'express';
import mongoose from 'mongoose';
import { verifyToken, checkAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { sendBookingApprovalNotification, sendBookingRejectionNotification, sendNewBookingNotification } from '../utils/notificationUtils.js';

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
    const filter = { 
      'availability.isAvailable': true,
      isBooked: false // Exclude booked services from search results
    };
    
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
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid service ID format' });
    }
    
    const service = await Service.findById(req.params.id)
      .populate('owner', 'name email');
    
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
    console.log('=== Service Creation Request ===');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('User:', req.user ? req.user._id : 'No user');
    
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
    
    console.log('Extracted fields:', {
      title, propertyType, description, district, area, address,
      price, availableFrom, availableTo, bedrooms, bathrooms,
      squareFeet, furnishing, amenities, contactName, contactPhone,
      contactEmail, contactWhatsapp
    });
    
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
      amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || {
        wifi: false,
        ac: false,
        parking: false,
        kitchen: false,
        laundry: false,
        studyArea: false,
        securityGuard: false,
        cctv: false
      }),
      contact: {
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
        whatsapp: contactWhatsapp || ''
      },
      thumbnail: req.file ? `/uploads/${req.file.filename}` : null,
      photos: [], // Additional photos can be added later
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
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Failed to create service', error: error.message });
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

// Toggle service active status (protected)
router.patch('/services/:id/toggle-active', verifyToken, checkAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if user owns the service
    if (service.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this service' });
    }
    
    // Toggle the isAvailable status
    service.availability.isAvailable = !service.availability.isAvailable;
    await service.save();
    
    const updatedService = await Service.findById(req.params.id)
      .populate('owner', 'name email');
    
    res.json({
      message: `Service ${service.availability.isAvailable ? 'activated' : 'deactivated'} successfully`,
      service: {
        _id: updatedService._id,
        isActive: updatedService.availability.isAvailable
      }
    });
  } catch (error) {
    console.error('Toggle service status error:', error);
    res.status(500).json({ message: 'Failed to toggle service status' });
  }
});

// Get user's wishlist (protected)
router.get('/wishlist', verifyToken, checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      wishlist: user.wishlist || []
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

// Check if service is in wishlist (protected)
router.get('/wishlist/check/:serviceId', verifyToken, checkAuth, async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if user has this service in wishlist
    const user = await User.findById(req.user._id);
    const isInWishlist = user.wishlist.includes(serviceId);
    
    res.json({ isInWishlist });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Failed to check wishlist status' });
  }
});

// Add service to wishlist (protected) - with serviceId in URL
router.post('/wishlist/add/:serviceId', verifyToken, checkAuth, async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    
    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if user already has this service in wishlist
    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(serviceId)) {
      return res.status(400).json({ message: 'Service already in wishlist' });
    }
    
    // Add to wishlist
    user.wishlist.push(serviceId);
    await user.save();
    
    res.json({ message: 'Service added to wishlist successfully' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
});

// Add service to wishlist (protected) - with serviceId in body
router.post('/wishlist/add', verifyToken, checkAuth, async (req, res) => {
  try {
    const { serviceId } = req.body;
    
    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }
    
    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if user already has this service in wishlist
    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(serviceId)) {
      return res.status(400).json({ message: 'Service already in wishlist' });
    }
    
    // Add to wishlist
    user.wishlist.push(serviceId);
    await user.save();
    
    res.json({ message: 'Service added to wishlist successfully' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
});

// Remove service from wishlist (protected)
router.delete('/wishlist/remove/:serviceId', verifyToken, checkAuth, async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    // Remove from wishlist
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== serviceId);
    await user.save();
    
    res.json({ message: 'Service removed from wishlist successfully' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
});

// ==================== BOOKING ROUTES ====================

// Get user's bookings (protected)
router.get('/bookings', verifyToken, checkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get user's bookings with pagination and enhanced population
    const bookings = await Booking.find(filter)
      .populate('service', 'title location price propertyType images availability')
      .populate('user', 'name email')
      .populate('payment', 'amount status paymentMethod confirmationNumber paidAt')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Booking.countDocuments(filter);
    
    // Enhance bookings with calculated fields
    const enhancedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Add calculated status based on dates
      bookingObj.calculatedStatus = booking.currentStatus;
      
      // Add duration information
      bookingObj.duration = {
        days: booking.durationDays,
        months: booking.durationMonths
      };
      
      // Add booking summary
      bookingObj.summary = {
        canBeCancelled: booking.canBeCancelled(),
        isActive: booking.isActive(),
        isCompleted: booking.isCompleted(),
        canReview: booking.isCompleted() && !booking.hostReviewSubmitted
      };
      
      // Add formatted confirmation code
      bookingObj.formattedConfirmationCode = booking.formattedConfirmationCode;
      
      return bookingObj;
    });

    res.json({
      bookings: enhancedBookings,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: bookings.length,
        totalBookings: total
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get pending approval bookings (protected) - MUST be before /:id route
router.get('/bookings/pending-approval', verifyToken, checkAuth, async (req, res) => {
  try {
    const bookings = await Booking.findPendingApproval(req.user._id);
    
    res.json({
      message: 'Pending approval bookings retrieved successfully',
      bookings: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get pending approval bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch pending approval bookings' });
  }
});

// Get single booking (protected)
router.get('/bookings/:id', verifyToken, checkAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'title location price propertyType contact images availability owner')
      .populate('user', 'name email')
      .populate('payment', 'amount status paymentMethod confirmationNumber paidAt amountBreakdown')
      .populate({
        path: 'service',
        populate: {
          path: 'owner',
          select: 'name email phone'
        }
      });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns the booking or is the service owner
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isServiceOwner = booking.service.owner._id.toString() === req.user._id.toString();
    
    if (!isOwner && !isServiceOwner) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    // Enhance booking with calculated fields
    const bookingObj = booking.toObject();
    
    // Add calculated status and duration
    bookingObj.calculatedStatus = booking.currentStatus;
    bookingObj.duration = {
      days: booking.durationDays,
      months: booking.durationMonths
    };
    
    // Add booking capabilities
    bookingObj.capabilities = {
      canBeCancelled: booking.canBeCancelled(),
      isActive: booking.isActive(),
      isCompleted: booking.isCompleted(),
      canReview: booking.isCompleted() && !booking.hostReviewSubmitted
    };
    
    // Add formatted confirmation code
    bookingObj.formattedConfirmationCode = booking.formattedConfirmationCode;
    
    res.json({
      message: 'Booking retrieved successfully',
      booking: bookingObj
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
});

// Create new booking (protected)
router.post('/bookings', verifyToken, checkAuth, async (req, res) => {
  try {
    const {
      serviceId,
      startDate,
      endDate,
      guests,
      personalInfo,
      specialRequests,
      fees = {}
    } = req.body;
    
    // Validate required fields
    if (!serviceId || !startDate || !endDate || !personalInfo) {
      return res.status(400).json({ message: 'Missing required booking information' });
    }
    
    // Validate personal info structure
    if (!personalInfo.phone || !personalInfo.email) {
      return res.status(400).json({ message: 'Phone and email are required in personal info' });
    }
    
    // Check if service exists and is available
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    if (!service.availability.isAvailable) {
      return res.status(400).json({ message: 'Service is not available for booking' });
    }
    
    if (service.isBooked) {
      return res.status(400).json({ message: 'Service is already booked and not available' });
    }
    
    // Check if user is trying to book their own service
    if (service.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own service' });
    }
    
    // Validate dates
    const bookingStartDate = new Date(startDate);
    const bookingEndDate = new Date(endDate);
    const now = new Date();
    
    // Check if start date is in the past
    if (bookingStartDate < now) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }
    
    if (bookingStartDate >= bookingEndDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    // Check service availability period if defined
    if (service.availability.from && service.availability.to) {
      const serviceStartDate = new Date(service.availability.from);
      const serviceEndDate = new Date(service.availability.to);
      
      if (bookingStartDate < serviceStartDate || bookingEndDate > serviceEndDate) {
        return res.status(400).json({ message: 'Booking dates are outside service availability period' });
      }
    }
    
    // Check for conflicting bookings
    const isAvailable = await Booking.checkAvailability(serviceId, bookingStartDate, bookingEndDate);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Service is not available for the selected dates' });
    }
    
    // Calculate pricing
    const days = Math.ceil((bookingEndDate - bookingStartDate) / (1000 * 60 * 60 * 24));
    const basePrice = service.price;
    const totalAmount = basePrice;
    
    // Create booking with updated schema (no fees)
    const bookingData = {
      service: serviceId,
      user: req.user._id,
      startDate: bookingStartDate,
      endDate: bookingEndDate,
      basePrice: basePrice,
      totalAmount: totalAmount,
      guestInfo: {
        numberOfGuests: guests || 1,
        specialRequests: specialRequests || ''
      },
      contactInfo: {
        phone: personalInfo.phone,
        email: personalInfo.email
      },
      status: 'pending',
      paymentStatus: 'pending'
    };
    
    const booking = new Booking(bookingData);
    await booking.save();
    
    // Populate the booking before returning
    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title location price propertyType images owner')
      .populate('user', 'name email')
      .populate('payment')
      .populate({
        path: 'service',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      });
    
    // Send new booking notification to host
    await sendNewBookingNotification(populatedBooking);
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking,
      pricing: {
        basePrice: basePrice,
        days: days,
        totalAmount: totalAmount
      }
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

// Update booking status (protected)
router.patch('/bookings/:id/status', verifyToken, checkAuth, async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!status || !['active', 'pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Allowed: active, pending, approved, rejected' });
    }
    
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('payment');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check authorization - only service owner or booking user can update status
    const service = await Service.findById(booking.service._id);
    if (booking.user.toString() !== req.user._id.toString() && 
        service.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Validate status transitions
    const validTransitions = {
      'pending': ['approved', 'rejected'],
      'approved': ['active'],
      'active': [],
      'rejected': []
    };
    
    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${booking.status} to ${status}` 
      });
    }
    
    // Handle status-specific logic
    if (status === 'approved') {
      booking.status = 'approved';
      booking.isApproved = true;
      booking.approvedAt = new Date();
      if (reason) booking.approvalReason = reason;
      
      // Mark service as booked when approved
      await Service.findByIdAndUpdate(booking.service._id, {
        isBooked: true,
        currentBooking: booking._id
      });
      
    } else if (status === 'rejected') {
      booking.status = 'rejected';
      booking.isApproved = false;
      booking.rejectedAt = new Date();
      if (reason) booking.approvalReason = reason;
      
    } else if (status === 'active') {
      booking.status = 'active';
    }
    
    await booking.save();
    
    const updatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title location price propertyType images')
      .populate('user', 'name email')
      .populate('payment');
    
    res.json({
      message: `Booking ${status} successfully`,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
});

// Cancel booking (protected)
router.delete('/bookings/:id', verifyToken, checkAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('payment');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // Check if booking can be cancelled using the model method
    if (!booking.canBeCancelled()) {
      return res.status(400).json({ 
        message: 'Cannot cancel this booking. Bookings can only be cancelled 24 hours before start date.' 
      });
    }
    
    // Use the model method to cancel booking
    await booking.cancel(reason || 'Cancelled by user');
    
    // Unmark service as booked
    await Service.findByIdAndUpdate(booking.service, {
      isBooked: false,
      currentBooking: null
    });
    
    // Handle payment refund if applicable
    if (booking.payment && booking.payment.status === 'paid') {
      // Update payment status to indicate refund needed
      booking.paymentStatus = 'refunded';
      await booking.save();
      
      // Note: Actual refund processing should be handled separately
      // This just marks the payment as needing refund
    }
    
    const cancelledBooking = await Booking.findById(booking._id)
      .populate('service', 'title location price')
      .populate('user', 'name email')
      .populate('payment');
    
    res.json({ 
      message: 'Booking cancelled successfully',
      booking: cancelledBooking,
      refundStatus: booking.payment ? 'Refund will be processed within 3-5 business days' : null
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

// ==================== BOOKING APPROVAL ROUTES ====================

// Approve booking (protected - host only)
router.put('/bookings/:id/approve', verifyToken, checkAuth, async (req, res) => {
  try {
    const { approvalReason } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'owner title location')
      .populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the service owner (host)
    if (booking.service.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the service owner can approve bookings' });
    }
    
    // Check if booking is already approved/rejected
    if (booking.isApproved !== null) {
      return res.status(400).json({ 
        message: `Booking has already been ${booking.isApproved ? 'approved' : 'rejected'}` 
      });
    }
    
    // Approve the booking
    await booking.approve(approvalReason);
    
    // Set booking status to approved upon approval
    booking.status = 'approved';
    await booking.save();
    
    // Mark service as booked upon approval
    await Service.findByIdAndUpdate(booking.service._id, {
      isBooked: true,
      currentBooking: booking._id
    });
    
    // Send approval notification to guest
    await sendBookingApprovalNotification(booking, approvalReason);
    
    // Populate the updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title location price propertyType images owner')
      .populate('user', 'name email')
      .populate('payment');
    
    res.json({
      message: 'Booking approved successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ message: 'Failed to approve booking' });
  }
});

// Reject booking (protected - host only)
router.put('/bookings/:id/reject', verifyToken, checkAuth, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'owner title location')
      .populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the service owner (host)
    if (booking.service.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the service owner can reject bookings' });
    }
    
    // Check if booking is already approved/rejected
    if (booking.isApproved !== null) {
      return res.status(400).json({ 
        message: `Booking has already been ${booking.isApproved ? 'approved' : 'rejected'}` 
      });
    }
    
    // Reject the booking
    await booking.reject(rejectionReason);
    
    // Send rejection notification to guest
    await sendBookingRejectionNotification(booking, rejectionReason);
    
    // Populate the updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title location price propertyType images owner')
      .populate('user', 'name email')
      .populate('payment');
    
    res.json({
      message: 'Booking rejected successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ message: 'Failed to reject booking' });
  }
});

// Get host's bookings by approval status (protected)
router.get('/bookings/host/:status', verifyToken, checkAuth, async (req, res) => {
  try {
    const { status } = req.params;
    let bookings;
    
    switch (status) {
      case 'pending':
        bookings = await Booking.findPendingApproval(req.user._id);
        break;
      case 'approved':
        bookings = await Booking.findApproved(req.user._id);
        break;
      case 'rejected':
        bookings = await Booking.findRejected(req.user._id);
        break;
      default:
        return res.status(400).json({ message: 'Invalid status. Use: pending, approved, or rejected' });
    }
    
    res.json({
      message: `${status.charAt(0).toUpperCase() + status.slice(1)} bookings retrieved successfully`,
      bookings: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error(`Get ${status} bookings error:`, error);
    res.status(500).json({ message: `Failed to fetch ${status} bookings` });
  }
});

// ==================== PAYMENT ROUTES ====================

// Get user's payments (protected)
router.get('/payments', verifyToken, checkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get user's payments with pagination using the new findByUser method
    const payments = await Payment.findByUser(req.user._id, { 
      status: status !== 'all' ? status : undefined,
      limit: Number(limit)
    })
      .populate('service', 'title location price images')
      .populate('booking', 'startDate endDate status confirmationCode')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Payment.countDocuments(filter);
    
    // Enhance payments with calculated fields
    const enhancedPayments = payments.map(payment => ({
      ...payment.toObject(),
      fullName: payment.fullName,
      formattedConfirmationNumber: payment.formattedConfirmationNumber,
      netAmount: payment.netAmount,
      paymentMethodDisplay: payment.paymentMethodDisplay,
      summary: payment.getSummary()
    }));
    
    res.json({
      payments: enhancedPayments,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: payments.length,
        totalPayments: total
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// Get single payment (protected)
router.get('/payments/:id', verifyToken, checkAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('service', 'title location price propertyType images')
      .populate('booking', 'startDate endDate status guests confirmationCode')
      .populate('user', 'name email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user owns the payment
    if (payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }
    
    // Enhance payment with calculated fields
    const enhancedPayment = {
      ...payment.toObject(),
      fullName: payment.fullName,
      formattedConfirmationNumber: payment.formattedConfirmationNumber,
      netAmount: payment.netAmount,
      paymentMethodDisplay: payment.paymentMethodDisplay,
      canBeRefunded: payment.canBeRefunded(),
      summary: payment.getSummary()
    };
    
    res.json(enhancedPayment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
});

// Create payment for booking (protected)
router.post('/payments', verifyToken, checkAuth, async (req, res) => {
  try {
    const {
      bookingId,
      paymentMethod,
      paymentDetails,
      personalInfo,
      currency = 'BDT'
    } = req.body;
    
    // Validate required fields
    if (!bookingId || !paymentMethod || !personalInfo) {
      return res.status(400).json({ message: 'Missing required payment information' });
    }
    
    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId)
      .populate('service');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }
    
    // Check if booking is in valid state for payment
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not in a valid state for payment' });
    }
    
    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment && (existingPayment.status === 'paid' || existingPayment.status === 'completed')) {
      return res.status(400).json({ message: 'Payment already completed for this booking' });
    }
    
    // Create amount breakdown with only base amount
    const amountBreakdown = {
      baseAmount: booking.totalAmount || 0,
      discountAmount: 0
    };
    
    // Create payment
    const paymentData = {
      user: req.user._id,
      booking: bookingId,
      amount: booking.totalAmount,
      amountBreakdown,
      paymentMethod,
      currency,
      paymentDetails: {
        // Structure paymentDetails based on payment method
        ...(paymentMethod === 'mobile_banking' && {
          mobile: {
            phoneNumber: paymentDetails.mobileNumber,
            transactionId: paymentDetails.transactionId,
            senderNumber: paymentDetails.mobileNumber
          }
        }),
        ...(paymentMethod === 'bank_transfer' && {
          bank: {
            accountNumber: paymentDetails.accountNumber,
            accountHolderName: paymentDetails.accountHolderName || personalInfo.fullName,
            bankName: paymentDetails.bankName,
            routingNumber: paymentDetails.routingNumber,
            swiftCode: paymentDetails.swiftCode
          }
        }),
        ...(paymentMethod === 'credit_card' && {
          card: {
            last4Digits: paymentDetails.cardNumber ? paymentDetails.cardNumber.replace(/\s/g, '').slice(-4) : '',
            cardType: 'visa', // Default, could be detected from card number
            expiryMonth: paymentDetails.cardExpiry ? parseInt(paymentDetails.cardExpiry.split('/')[0]) : null,
            expiryYear: paymentDetails.cardExpiry ? parseInt('20' + paymentDetails.cardExpiry.split('/')[1]) : null
          }
        }),
        phone: personalInfo.phone,
        email: personalInfo.email
      },
      personalInfo: {
        firstName: personalInfo.firstName || personalInfo.fullName?.split(' ')[0] || '',
        lastName: personalInfo.lastName || personalInfo.fullName?.split(' ').slice(1).join(' ') || 'N/A',
        email: personalInfo.email,
        phone: personalInfo.phone,
        nidNumber: personalInfo.nidNumber,
        address: {
          street: typeof personalInfo.address === 'string' ? personalInfo.address : personalInfo.address?.street || '',
          city: typeof personalInfo.address === 'string' ? '' : personalInfo.address?.city || '',
          state: typeof personalInfo.address === 'string' ? '' : personalInfo.address?.state || '',
          zipCode: typeof personalInfo.address === 'string' ? '' : personalInfo.address?.zipCode || '',
          country: typeof personalInfo.address === 'string' ? 'Bangladesh' : personalInfo.address?.country || 'Bangladesh'
        }
      },
      termsAccepted: true,
      status: 'pending'
    };
    
    const payment = new Payment(paymentData);
    await payment.save();
    
    // Update booking with payment reference
    booking.payment = payment._id;
    await booking.save();
    
    // Populate the payment before returning
    const populatedPayment = await Payment.findById(payment._id)
      .populate('booking', 'startDate endDate status confirmationCode')
      .populate('user', 'name email');
    
    // Enhance payment with calculated fields
    const enhancedPayment = {
      ...populatedPayment.toObject(),
      fullName: populatedPayment.fullName,
      formattedConfirmationNumber: populatedPayment.formattedConfirmationNumber,
      netAmount: populatedPayment.netAmount,
      paymentMethodDisplay: populatedPayment.paymentMethodDisplay
    };
    
    res.status(201).json({
      message: 'Payment initiated successfully',
      payment: enhancedPayment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Failed to create payment' });
  }
});

// Update payment status (protected - typically called by payment gateway webhook)
router.patch('/payments/:id/status', verifyToken, checkAuth, async (req, res) => {
  try {
    const { status, transactionId, gatewayResponse, failureReason } = req.body;
    
    if (!status || !['processing', 'paid', 'completed', 'failed', 'refunded', 'partial'].includes(status)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    
    const payment = await Payment.findById(req.params.id)
      .populate('booking');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user owns the payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this payment' });
    }
    
    // Update payment status using model methods
    if (status === 'paid' || status === 'completed') {
      await payment.markAsPaid();
      
      // Update gateway response if provided
      if (gatewayResponse) {
        payment.gatewayResponse = {
          ...payment.gatewayResponse,
          ...gatewayResponse,
          transactionId: transactionId || gatewayResponse.transactionId
        };
        await payment.save();
      }
      
      // Update booking payment status but keep booking status as 'pending' until host approval
      if (payment.booking) {
        const booking = await Booking.findById(payment.booking._id);
        if (booking && booking.status === 'pending') {
          // Only update payment status, keep booking status as 'pending'
          booking.paymentStatus = 'paid';
          await booking.save();
          
          // Don't mark service as booked yet - wait for host approval
          // Service will be marked as booked only after host approval
        }
      }
    } else if (status === 'failed') {
      await payment.markAsFailed(failureReason);
    } else {
      payment.status = status;
      if (transactionId) {
        payment.paymentDetails.transactionId = transactionId;
      }
      if (gatewayResponse) {
        payment.gatewayResponse = {
          ...payment.gatewayResponse,
          ...gatewayResponse
        };
      }
      await payment.save();
    }
    
    const updatedPayment = await Payment.findById(payment._id)
      .populate('service', 'title location price images')
      .populate('booking', 'startDate endDate status confirmationCode')
      .populate('user', 'name email');
    
    // Enhance payment with calculated fields
    const enhancedPayment = {
      ...updatedPayment.toObject(),
      fullName: updatedPayment.fullName,
      formattedConfirmationNumber: updatedPayment.formattedConfirmationNumber,
      netAmount: updatedPayment.netAmount,
      paymentMethodDisplay: updatedPayment.paymentMethodDisplay,
      canBeRefunded: updatedPayment.canBeRefunded()
    };
    
    res.json({
      message: `Payment ${status} successfully`,
      payment: enhancedPayment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});

// Process refund (protected)
router.post('/payments/:id/refund', verifyToken, checkAuth, async (req, res) => {
  try {
    const { refundAmount, reason, refundType = 'full' } = req.body;
    
    const payment = await Payment.findById(req.params.id)
      .populate('booking');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user owns the payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to refund this payment' });
    }
    
    // Check if payment can be refunded using model method
    if (!payment.canBeRefunded()) {
      return res.status(400).json({ 
        message: 'Payment cannot be refunded. Only paid payments that have not been refunded can be refunded.' 
      });
    }
    
    // Validate refund amount
    const maxRefundAmount = payment.netAmount || payment.amount;
    const requestedAmount = refundAmount || maxRefundAmount;
    
    if (requestedAmount <= 0 || requestedAmount > maxRefundAmount) {
      return res.status(400).json({ 
        message: `Invalid refund amount. Maximum refundable amount is ${maxRefundAmount}` 
      });
    }
    
    // Determine refund type
    const actualRefundType = requestedAmount >= maxRefundAmount ? 'full' : 'partial';
    
    // Process refund using model method
    await payment.processRefund(requestedAmount, reason, actualRefundType);
    
    // Update booking status if full refund
    if (actualRefundType === 'full' && payment.booking) {
      const booking = await Booking.findById(payment.booking._id);
      if (booking && booking.canBeCancelled()) {
        await booking.cancel(reason || 'Full refund processed');
        
        // Unmark service as booked
        await Service.findByIdAndUpdate(booking.service, {
          isBooked: false,
          currentBooking: null
        });
      }
    }
    
    const updatedPayment = await Payment.findById(payment._id)
      .populate('service', 'title location price images')
      .populate('booking', 'startDate endDate status confirmationCode')
      .populate('user', 'name email');
    
    // Enhance payment with calculated fields
    const enhancedPayment = {
      ...updatedPayment.toObject(),
      fullName: updatedPayment.fullName,
      formattedConfirmationNumber: updatedPayment.formattedConfirmationNumber,
      netAmount: updatedPayment.netAmount,
      paymentMethodDisplay: updatedPayment.paymentMethodDisplay,
      canBeRefunded: updatedPayment.canBeRefunded()
    };
    
    res.json({
      message: `${actualRefundType === 'full' ? 'Full' : 'Partial'} refund processed successfully`,
      payment: enhancedPayment,
      refundDetails: {
        refundAmount: requestedAmount,
        refundType: actualRefundType,
        refundId: updatedPayment.refund.refundId,
        estimatedProcessingTime: '3-5 business days'
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

// Get payment statistics (protected)
router.get('/payments/stats/summary', verifyToken, checkAuth, async (req, res) => {
  try {
    const stats = await Payment.getPaymentStats(req.user._id);
    
    // Get additional payment metrics
    const totalPayments = await Payment.countDocuments({ user: req.user._id });
    const pendingPayments = await Payment.countDocuments({ user: req.user._id, status: 'pending' });
    const completedPayments = await Payment.countDocuments({ user: req.user._id, status: 'paid' });
    const refundedPayments = await Payment.countDocuments({ user: req.user._id, status: 'refunded' });
    
    // Calculate average payment amount
    const avgPaymentResult = await Payment.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: null, avgAmount: { $avg: '$amount' } } }
    ]);
    
    const enhancedStats = {
      ...stats[0] || {},
      summary: {
        totalPayments,
        pendingPayments,
        completedPayments,
        refundedPayments,
        averagePaymentAmount: avgPaymentResult[0]?.avgAmount || 0
      }
    };
    
    res.json({
      message: 'Payment statistics retrieved successfully',
      stats: enhancedStats
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Failed to fetch payment statistics' });
  }
});

// Get booking statistics (protected)
router.get('/bookings/stats/summary', verifyToken, checkAuth, async (req, res) => {
  try {
    const stats = await Booking.getBookingStats(req.user._id);
    
    // Get additional metrics
    const now = new Date();
    const upcomingBookings = await Booking.countDocuments({
      user: req.user._id,
      status: 'confirmed',
      startDate: { $gt: now }
    });
    
    const activeBookings = await Booking.countDocuments({
      user: req.user._id,
      status: 'confirmed',
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    const completedBookings = await Booking.countDocuments({
      user: req.user._id,
      $or: [
        { status: 'completed' },
        { status: 'confirmed', endDate: { $lt: now } }
      ]
    });
    
    // Calculate total spent from payments using Payment.getPaymentStats
    const paymentStatsResult = await Payment.getPaymentStats(req.user._id);
    const paymentStats = paymentStatsResult[0] || { totalRevenue: 0, totalRefunds: 0 };
    
    const additionalPaymentStats = await Payment.aggregate([
      { 
        $lookup: {
          from: 'bookings',
          localField: 'booking',
          foreignField: '_id',
          as: 'bookingInfo'
        }
      },
      { $unwind: '$bookingInfo' },
      { $match: { 'bookingInfo.user': new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalRefunded: { $sum: '$refund.refundAmount' }
        }
      }
    ]);
    
    const summary = {
      bookings: {
        total: 0,
        upcoming: upcomingBookings,
        active: activeBookings,
        completed: completedBookings,
        byStatus: {}
      },
      payments: {
        totalSpent: 0,
        totalRefunded: 0,
        netSpent: 0,
        byStatus: {}
      }
    };
    
    // Process booking stats
    if (stats && stats.length > 0) {
      stats[0].stats.forEach(stat => {
        summary.bookings.total += stat.count;
        summary.bookings.byStatus[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount
        };
      });
    }
    
    // Process payment stats
    paymentStats.forEach(stat => {
      summary.payments.totalSpent += stat.totalAmount;
      summary.payments.totalRefunded += stat.totalRefunded || 0;
      summary.payments.byStatus[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount,
        totalRefunded: stat.totalRefunded || 0
      };
    });
    
    summary.payments.netSpent = summary.payments.totalSpent - summary.payments.totalRefunded;
    
    res.json({
      message: 'Booking statistics retrieved successfully',
      stats: summary
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Failed to fetch booking statistics' });
  }
});

// ==================== USER PROFILE ROUTES ====================

// Get user profile by ID (public route for viewing host profiles)
router.get('/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Find user and exclude sensitive information
    const user = await User.findById(userId).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user profile data (excluding sensitive fields like password)
    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      profile: {
        phone: user.profile?.phone,
        gender: user.profile?.gender,
        occupation: user.profile?.occupation,
        institution: user.profile?.institution,
        department: user.profile?.department,
        studentId: user.profile?.studentId,
        dateOfBirth: user.profile?.dateOfBirth,
        address: {
          division: user.profile?.address?.division,
          district: user.profile?.address?.district,
          area: user.profile?.address?.area,
          postalCode: user.profile?.address?.postalCode
          // Exclude fullAddress for privacy
        },
        profilePicture: user.profile?.profilePicture
        // Exclude emergencyContact and preferences for privacy
      }
    };
    
    res.json(userProfile);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

export default router;