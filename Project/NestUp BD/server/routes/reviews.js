import express from 'express';
import Review from '../models/Review.js';
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
    cb(null, 'uploads/reviews/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
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

// @route   POST /api/reviews
// @desc    Create a new review
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
    const booking = await Booking.findById(bookingId);
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

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({
      user: req.user.id,
      booking: bookingId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          url: `/uploads/reviews/${file.filename}`,
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

    // Create new review
    const review = new Review({
      user: req.user.id,
      service: serviceId,
      booking: bookingId,
      rating: parseInt(rating),
      comment: comment.trim(),
      images,
      categories: parsedCategories,
      isVerified: true // Since it's based on a completed booking
    });

    await review.save();

    // Populate user data for response
    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating review'
    });
  }
});

// @route   GET /api/reviews/service/:serviceId
// @desc    Get reviews for a specific service
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

    const reviews = await Review.getReviewsWithPagination(serviceId, options);
    const totalReviews = await Review.countDocuments({
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
    console.error('Error fetching service reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// @route   GET /api/reviews/service/:serviceId/stats
// @desc    Get review statistics for a service
// @access  Public
router.get('/service/:serviceId/stats', async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const stats = await Review.getReviewStats(serviceId);
    
    res.json({
      success: true,
      data: stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        averageCategories: {
          cleanliness: 0,
          communication: 0,
          location: 0,
          value: 0,
          amenities: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review statistics'
    });
  }
});

// @route   GET /api/reviews/user/:userId
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

    const reviews = await Review.find({ user: userId })
      .populate('service', 'title thumbnail location')
      .populate('booking', 'bookingId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ user: userId });
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
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews'
    });
  }
});

// @route   PUT /api/reviews/:reviewId
// @desc    Update a review
// @access  Private
router.put('/:reviewId', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, categories } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
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
        url: `/uploads/reviews/${file.filename}`,
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

    await review.populate('user', 'name avatar');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating review'
    });
  }
});

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.remove();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
});

// @route   POST /api/reviews/:reviewId/reply
// @desc    Add host reply to a review
// @access  Private (only service owner)
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

    const review = await Review.findById(reviewId).populate('service');
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the service owner
    if (review.service.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the service owner can reply to reviews'
      });
    }

    review.hostReply = {
      comment: comment.trim(),
      repliedAt: new Date(),
      repliedBy: req.user.id
    };

    await review.save();
    await review.populate('hostReply.repliedBy', 'name');

    res.json({
      success: true,
      message: 'Reply added successfully',
      data: review.hostReply
    });

  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding reply'
    });
  }
});

// @route   POST /api/reviews/:reviewId/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:reviewId/helpful', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulVotes.users.includes(userId);
    
    if (alreadyMarked) {
      // Remove helpful vote
      review.helpfulVotes.users = review.helpfulVotes.users.filter(
        id => id.toString() !== userId
      );
      review.helpfulVotes.count = Math.max(0, review.helpfulVotes.count - 1);
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

// @route   POST /api/reviews/:reviewId/flag
// @desc    Flag a review as inappropriate
// @access  Private
router.post('/:reviewId/flag', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Flag reason is required'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already flagged this review
    const alreadyFlagged = review.flags.some(
      flag => flag.user.toString() === userId
    );

    if (alreadyFlagged) {
      return res.status(400).json({
        success: false,
        message: 'You have already flagged this review'
      });
    }

    review.flags.push({
      user: userId,
      reason,
      description: description || '',
      flaggedAt: new Date()
    });

    // Auto-flag review if it gets multiple flags
    if (review.flags.length >= 3 && review.status !== 'flagged') {
      review.status = 'flagged';
    }

    await review.save();

    res.json({
      success: true,
      message: 'Review flagged successfully'
    });

  } catch (error) {
    console.error('Error flagging review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while flagging review'
    });
  }
});

export default router;