import express from 'express';
import HostReview from '../models/HostReview.js';
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
    cb(null, 'uploads/host-reviews/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'host-review-' + uniqueSuffix + path.extname(file.originalname));
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

// @route   POST /api/host-reviews
// @desc    Create a new host review
// @access  Private
router.post('/', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const {
      hostId,
      bookingId,
      rating,
      comment,
      categories
    } = req.body;

    // Validate required fields
    if (!hostId || !bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Host ID, Booking ID, rating, and comment are required'
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

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Verify that the hostId matches the service owner
    if (booking.service.owner.toString() !== hostId) {
      return res.status(400).json({
        success: false,
        message: 'Host ID does not match the service owner'
      });
    }

    // Check if review already exists for this booking
    const existingReview = await HostReview.findOne({
      reviewer: req.user.id,
      booking: bookingId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this host for this booking'
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          url: `/uploads/host-reviews/${file.filename}`,
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

    // Create new host review
    const hostReview = new HostReview({
      reviewer: req.user.id,
      host: hostId,
      booking: bookingId,
      rating: parseInt(rating),
      comment: comment.trim(),
      images,
      categories: parsedCategories,
      isVerified: true // Since it's based on a completed booking
    });

    await hostReview.save();

    // Update booking to mark host review as submitted
    await Booking.findByIdAndUpdate(bookingId, {
      hostReviewSubmitted: true,
      hostReviewId: hostReview._id
    });

    // Populate user data for response
    await hostReview.populate('reviewer', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Host review created successfully',
      data: hostReview
    });

  } catch (error) {
    console.error('Error creating host review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating host review'
    });
  }
});

// @route   GET /api/host-reviews/host/:hostId
// @desc    Get reviews for a specific host
// @access  Public
router.get('/host/:hostId', async (req, res) => {
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

    const reviews = await HostReview.getReviewsWithPagination(hostId, options);
    const totalReviews = await HostReview.countDocuments({
      host: hostId,
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
    console.error('Error fetching host reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching host reviews'
    });
  }
});

// @route   GET /api/host-reviews/host/:hostId/stats
// @desc    Get review statistics for a host
// @access  Public
router.get('/host/:hostId/stats', async (req, res) => {
  try {
    const { hostId } = req.params;
    
    const stats = await HostReview.getReviewStats(hostId);
    
    res.json({
      success: true,
      data: stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        averageCategories: {
          communication: 0,
          responsiveness: 0,
          helpfulness: 0,
          reliability: 0,
          professionalism: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching host review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching host review statistics'
    });
  }
});

// @route   GET /api/host-reviews/user/:userId
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

    const reviews = await HostReview.find({ reviewer: userId })
      .populate('host', 'name avatar')
      .populate('booking', 'bookingId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await HostReview.countDocuments({ reviewer: userId });
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
    console.error('Error fetching user host reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user host reviews'
    });
  }
});

// @route   PUT /api/host-reviews/:reviewId
// @desc    Update a host review
// @access  Private
router.put('/:reviewId', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, categories } = req.body;

    const review = await HostReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Host review not found'
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
        url: `/uploads/host-reviews/${file.filename}`,
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
      message: 'Host review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Error updating host review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating host review'
    });
  }
});

// @route   DELETE /api/host-reviews/:reviewId
// @desc    Delete a host review
// @access  Private
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await HostReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Host review not found'
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

    res.json({
      success: true,
      message: 'Host review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting host review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting host review'
    });
  }
});

// @route   POST /api/host-reviews/:reviewId/reply
// @desc    Add host reply to a review
// @access  Private (only the reviewed host)
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

    const review = await HostReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Host review not found'
      });
    }

    // Check if user is the reviewed host
    if (review.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the reviewed host can reply to this review'
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

// @route   POST /api/host-reviews/:reviewId/helpful
// @desc    Mark host review as helpful
// @access  Private
router.post('/:reviewId/helpful', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await HostReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Host review not found'
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

// @route   POST /api/host-reviews/:reviewId/flag
// @desc    Flag a host review as inappropriate
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

    const review = await HostReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Host review not found'
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
      message: 'Host review flagged successfully'
    });

  } catch (error) {
    console.error('Error flagging host review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while flagging host review'
    });
  }
});

export default router;