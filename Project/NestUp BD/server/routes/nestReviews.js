import express from 'express';
import NestReview from '../models/NestReview.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/nest-reviews/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'nest-review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 images per review
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/nest-reviews
// @desc    Create a new nest review
// @access  Private
router.post('/', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const {
      serviceId,
      bookingId,
      rating,
      comment,
      categories
    } = req.body;

    // Validate required fields
    if (!serviceId || !bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Service ID, Booking ID, rating, and comment are required'
      });
    }

    // Check if booking exists and belongs to the user
    const booking = await Booking.findById(bookingId).populate('service');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'You can only review approved bookings'
      });
    }

    // Verify that the serviceId matches the booking service
    if (booking.service._id.toString() !== serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID does not match the booked service'
      });
    }

    // Check if review already exists for this booking
    const existingReview = await NestReview.findOne({
      reviewer: req.user.id,
      booking: bookingId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this nest for this booking'
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          url: `/uploads/nest-reviews/${file.filename}`,
          caption: '' // Can be added later if needed
        });
      });
    }

    // Parse categories if provided
    let parsedCategories = {};
    if (categories) {
      try {
        parsedCategories = typeof categories === 'string' 
          ? JSON.parse(categories) 
          : categories;
      } catch (error) {
        console.error('Error parsing categories:', error);
      }
    }

    // Create new nest review
    const nestReview = new NestReview({
      reviewer: req.user.id,
      service: serviceId,
      booking: bookingId,
      rating: parseInt(rating),
      comment: comment.trim(),
      images,
      categories: parsedCategories,

    });

    await nestReview.save();

    // Update booking to mark nest review as submitted
    await Booking.findByIdAndUpdate(bookingId, {
      nestReviewSubmitted: true,
      nestReviewId: nestReview._id
    });

    // Populate user data for response
    await nestReview.populate('reviewer', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Nest review created successfully',
      data: nestReview
    });

  } catch (error) {
    console.error('Error creating nest review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating nest review'
    });
  }
});

// @route   GET /api/nest-reviews/service/:serviceId
// @desc    Get reviews for a specific service/nest
// @access  Public
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minRating,
      maxRating
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      status: 'approved'
    };

    if (minRating) options.minRating = parseInt(minRating);
    if (maxRating) options.maxRating = parseInt(maxRating);

    const reviews = await NestReview.getServiceReviewsWithPagination(serviceId, options);
    const totalReviews = await NestReview.countDocuments({
      service: serviceId,
      status: 'approved'
    });

    const totalPages = Math.ceil(totalReviews / options.limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: options.page,
          totalPages,
          totalReviews,
          hasNextPage: options.page < totalPages,
          hasPrevPage: options.page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching nest reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nest reviews'
    });
  }
});

// @route   GET /api/nest-reviews/service/:serviceId/stats
// @desc    Get review statistics for a service
// @access  Public
router.get('/service/:serviceId/stats', async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const stats = await NestReview.getReviewStats(serviceId);
    
    res.json({
      success: true,
      data: stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        averageCategories: {
          cleanliness: 0,
          location: 0,
          amenities: 0,
          value: 0,
          accuracy: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching nest review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nest review statistics'
    });
  }
});

// @route   GET /api/nest-reviews/user/:userId
// @desc    Get reviews written by a specific user
// @access  Private (user can only see their own reviews)
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only access their own reviews
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await NestReview.find({ reviewer: userId })
      .populate('service', 'title location images')
      .populate('booking', 'bookingId startDate endDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await NestReview.countDocuments({ reviewer: userId });
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user nest reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user nest reviews'
    });
  }
});

// @route   GET /api/nest-reviews/host/:hostId/public
// @desc    Get reviews for services owned by a specific host (public access)
// @access  Public
router.get('/host/:hostId/public', async (req, res) => {
  try {
    const { hostId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minRating,
      maxRating
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      status: 'approved'
    };

    if (minRating) options.minRating = parseInt(minRating);
    if (maxRating) options.maxRating = parseInt(maxRating);

    const skip = (options.page - 1) * options.limit;

    // First get all services owned by the host
    const hostServices = await Service.find({ owner: hostId }).select('_id');
    const serviceIds = hostServices.map(service => service._id);

    // Build query
    const query = { service: { $in: serviceIds }, status: options.status };
    if (options.minRating) query.rating = { ...query.rating, $gte: options.minRating };
    if (options.maxRating) query.rating = { ...query.rating, $lte: options.maxRating };

    const sort = { [options.sortBy]: options.sortOrder === 'desc' ? -1 : 1 };

    const reviews = await NestReview.find(query)
      .populate('reviewer', 'name avatar')
      .populate('service', 'title location images')
      .populate('booking', 'bookingId startDate endDate')
      .sort(sort)
      .skip(skip)
      .limit(options.limit);

    const totalReviews = await NestReview.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / options.limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: options.page,
          totalPages,
          totalReviews,
          hasNextPage: options.page < totalPages,
          hasPrevPage: options.page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching host nest reviews (public):', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching host nest reviews'
    });
  }
});

// @route   GET /api/nest-reviews/host/:hostId
// @desc    Get reviews for services owned by a specific host
// @access  Private (host can only see their own service reviews)
router.get('/host/:hostId', verifyToken, async (req, res) => {
  try {
    const { hostId } = req.params;
    
    // Users can only access reviews for their own services
    if (hostId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // First get all services owned by the host
    const hostServices = await Service.find({ owner: hostId }).select('_id');
    const serviceIds = hostServices.map(service => service._id);

    const reviews = await NestReview.find({ service: { $in: serviceIds } })
      .populate('reviewer', 'name avatar')
      .populate('service', 'title location images')
      .populate('booking', 'bookingId startDate endDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await NestReview.countDocuments({ service: { $in: serviceIds } });
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching host nest reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching host nest reviews'
    });
  }
});

// @route   PUT /api/nest-reviews/:reviewId
// @desc    Update a nest review
// @access  Private
router.put('/:reviewId', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, categories } = req.body;

    const review = await NestReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Nest review not found'
      });
    }

    // Check if user owns the review
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    // Store previous values for edit history
    const previousRating = review.rating;
    const previousComment = review.comment;

    // Update fields
    if (rating) review.rating = parseInt(rating);
    if (comment) review.comment = comment.trim();
    
    if (categories) {
      try {
        review.categories = typeof categories === 'string' 
          ? JSON.parse(categories) 
          : categories;
      } catch (error) {
        console.error('Error parsing categories:', error);
      }
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/nest-reviews/${file.filename}`,
        caption: ''
      }));
      review.images = [...review.images, ...newImages];
    }

    // Add to edit history
    review.editHistory.push({
      editedAt: new Date(),
      previousRating,
      previousComment
    });
    
    review.isEdited = true;
    await review.save();

    await review.populate('reviewer', 'name avatar');

    res.json({
      success: true,
      message: 'Nest review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Error updating nest review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating nest review'
    });
  }
});

// @route   DELETE /api/nest-reviews/:reviewId
// @desc    Delete a nest review
// @access  Private
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await NestReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Nest review not found'
      });
    }

    // Check if user owns the review
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.remove();

    // Update booking to remove review reference
    await Booking.findByIdAndUpdate(review.booking, {
      $unset: { nestReviewSubmitted: 1, nestReviewId: 1 }
    });

    res.json({
      success: true,
      message: 'Nest review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting nest review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting nest review'
    });
  }
});

// @route   POST /api/nest-reviews/:reviewId/reply
// @desc    Add host reply to a nest review
// @access  Private
router.post('/:reviewId/reply', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply comment is required'
      });
    }

    const review = await NestReview.findById(reviewId).populate('service');
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Nest review not found'
      });
    }

    // Check if user is the owner of the service being reviewed
    if (review.service.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only reply to reviews of your own services'
      });
    }

    review.hostReply = {
      comment: comment.trim(),
      repliedAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      message: 'Reply added successfully',
      data: review.hostReply
    });

  } catch (error) {
    console.error('Error adding reply to nest review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding reply'
    });
  }
});

// @route   POST /api/nest-reviews/:reviewId/helpful
// @desc    Mark a nest review as helpful
// @access  Private
router.post('/:reviewId/helpful', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await NestReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Nest review not found'
      });
    }

    const alreadyMarked = review.helpfulVotes.users.includes(userId);

    if (alreadyMarked) {
      // Remove helpful vote
      review.helpfulVotes.users = review.helpfulVotes.users.filter(
        user => user.toString() !== userId
      );
      review.helpfulVotes.count -= 1;
    } else {
      // Add helpful vote
      review.helpfulVotes.users.push(userId);
      review.helpfulVotes.count += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyMarked ? 'Helpful vote removed' : 'Marked as helpful',
      data: {
        helpfulCount: review.helpfulVotes.count,
        isHelpful: !alreadyMarked
      }
    });

  } catch (error) {
    console.error('Error toggling helpful vote:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing helpful vote'
    });
  }
});

export default router;