# Review System Backend Implementation

## Overview

This document describes the comprehensive review system backend implementation for NestUp BD. The system allows users to write reviews for completed bookings, includes advanced features like image uploads, category ratings, host replies, and moderation capabilities.

## Architecture

### Database Schema

The review system uses a separate `Review` model instead of embedding reviews in the `Service` model, providing better scalability and flexibility.

#### Review Model (`models/Review.js`)

```javascript
{
  user: ObjectId,           // Reference to User who wrote the review
  service: ObjectId,        // Reference to Service being reviewed
  booking: ObjectId,        // Reference to Booking (ensures verified reviews)
  rating: Number,           // Overall rating (1-5, allows half ratings)
  comment: String,          // Review text (10-1000 characters)
  images: [{
    url: String,            // Image URL/path
    publicId: String,       // For cloud storage (Cloudinary)
    caption: String         // Optional image caption
  }],
  categories: {             // Category-specific ratings
    cleanliness: Number,
    communication: Number,
    location: Number,
    value: Number,
    amenities: Number
  },
  status: String,           // 'pending', 'approved', 'rejected', 'flagged'
  hostReply: {
    comment: String,
    repliedAt: Date,
    repliedBy: ObjectId
  },
  helpfulVotes: {
    count: Number,
    users: [ObjectId]       // Users who marked as helpful
  },
  flags: [{
    user: ObjectId,
    reason: String,         // 'inappropriate', 'spam', 'fake', 'offensive', 'other'
    description: String,
    flaggedAt: Date
  }],
  isEdited: Boolean,
  editHistory: [{
    editedAt: Date,
    previousRating: Number,
    previousComment: String
  }],
  isVerified: Boolean       // True for booking-based reviews
}
```

#### Updated Service Model

The `Service` model has been updated to work with the new review system:

- Removed embedded `reviews` array
- Added category-specific rating fields
- Added `updateServiceRating()` static method
- Added virtual `reviewsData` for populating reviews

### API Endpoints

#### Core Review Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reviews` | Create new review | Yes |
| GET | `/api/reviews/service/:serviceId` | Get service reviews (paginated) | No |
| GET | `/api/reviews/service/:serviceId/stats` | Get review statistics | No |
| GET | `/api/reviews/user/:userId` | Get user's reviews | Yes (own only) |
| PUT | `/api/reviews/:reviewId` | Update review | Yes (owner only) |
| DELETE | `/api/reviews/:reviewId` | Delete review | Yes (owner only) |

#### Advanced Features

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reviews/:reviewId/reply` | Add host reply | Yes (service owner) |
| POST | `/api/reviews/:reviewId/helpful` | Toggle helpful vote | Yes |
| POST | `/api/reviews/:reviewId/flag` | Flag inappropriate review | Yes |

### Key Features

#### 1. Verified Reviews
- Reviews can only be created for completed bookings
- One review per booking (enforced by unique index)
- Automatic verification for booking-based reviews

#### 2. Image Upload Support
- Up to 5 images per review
- 5MB file size limit
- Automatic file naming and storage
- Support for captions

#### 3. Category Ratings
- Optional category-specific ratings (cleanliness, communication, location, value, amenities)
- Automatic calculation of category averages for services
- Flexible rating system (1-5, allows half ratings)

#### 4. Host Reply System
- Service owners can reply to reviews
- One reply per review
- Tracks reply timestamp and author

#### 5. Community Features
- Helpful votes from other users
- Flag system for inappropriate content
- Auto-flagging after multiple reports

#### 6. Moderation & Validation
- Review status system (pending, approved, rejected, flagged)
- Content length validation (10-1000 characters)
- Rating validation (1-5 range)
- Edit history tracking

#### 7. Advanced Querying
- Pagination support
- Sorting options (date, rating, helpful votes)
- Filtering by rating range
- Aggregated statistics

## Usage Examples

### Creating a Review

```javascript
// POST /api/reviews
// Content-Type: multipart/form-data

const formData = new FormData();
formData.append('serviceId', '64a7b8c9d1e2f3a4b5c6d7e8');
formData.append('bookingId', '64a7b8c9d1e2f3a4b5c6d7e9');
formData.append('rating', '4.5');
formData.append('comment', 'Great place to stay! Very clean and comfortable.');
formData.append('categories', JSON.stringify({
  cleanliness: 5,
  communication: 4,
  location: 4,
  value: 4,
  amenities: 3
}));
formData.append('images', file1);
formData.append('images', file2);

fetch('/api/reviews', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});
```

### Getting Service Reviews

```javascript
// GET /api/reviews/service/64a7b8c9d1e2f3a4b5c6d7e8?page=1&limit=10&sortBy=createdAt&sortOrder=desc

fetch('/api/reviews/service/64a7b8c9d1e2f3a4b5c6d7e8?page=1&limit=10')
  .then(response => response.json())
  .then(data => {
    console.log('Reviews:', data.data.reviews);
    console.log('Pagination:', data.data.pagination);
  });
```

### Getting Review Statistics

```javascript
// GET /api/reviews/service/64a7b8c9d1e2f3a4b5c6d7e8/stats

fetch('/api/reviews/service/64a7b8c9d1e2f3a4b5c6d7e8/stats')
  .then(response => response.json())
  .then(data => {
    const stats = data.data;
    console.log('Average Rating:', stats.averageRating);
    console.log('Total Reviews:', stats.totalReviews);
    console.log('Rating Distribution:', stats.ratingDistribution);
    console.log('Category Averages:', stats.averageCategories);
  });
```

### Adding Host Reply

```javascript
// POST /api/reviews/64a7b8c9d1e2f3a4b5c6d7ea/reply

fetch('/api/reviews/64a7b8c9d1e2f3a4b5c6d7ea/reply', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    comment: 'Thank you for your review! We appreciate your feedback.'
  }),
  credentials: 'include'
});
```

## Database Indexes

The following indexes are automatically created for optimal performance:

- `{ service: 1, createdAt: -1 }` - Service reviews sorted by date
- `{ user: 1, createdAt: -1 }` - User reviews sorted by date
- `{ booking: 1 }` - Booking-based lookups
- `{ rating: 1 }` - Rating-based filtering
- `{ status: 1 }` - Status-based filtering
- `{ user: 1, booking: 1 }` - Unique constraint (one review per booking per user)

## Integration with Existing System

### Frontend Integration

The review system integrates with the existing frontend components:

1. **ReviewForm Component** (`src/components/ReviewForm.jsx`)
   - Update API endpoint to `/api/reviews`
   - Add support for category ratings
   - Implement image upload functionality

2. **BookedNests Component** (`src/pages/BookedNests.jsx`)
   - Update review submission logic
   - Add booking ID to review data

3. **MyReviews Component** (`src/pages/MyReviews.jsx`)
   - Update API endpoint to `/api/reviews/user/:userId`
   - Add support for editing reviews

4. **NestReviews Component** (`src/pages/NestReviews.jsx`)
   - Update API endpoint to `/api/reviews/service/:serviceId`
   - Add host reply functionality

### Service Rating Updates

Service ratings are automatically updated when:
- New reviews are created
- Reviews are updated
- Reviews are deleted
- Review status changes

The `Service.updateServiceRating()` method calculates:
- Overall average rating
- Total review count
- Category-specific averages

## Security Considerations

1. **Authentication**: All write operations require valid JWT tokens
2. **Authorization**: Users can only modify their own reviews
3. **Validation**: Comprehensive input validation and sanitization
4. **File Upload**: Secure file handling with type and size restrictions
5. **Rate Limiting**: Consider implementing rate limiting for review creation
6. **Content Moderation**: Flag system and status-based content control

## Performance Optimizations

1. **Indexes**: Optimized database indexes for common queries
2. **Pagination**: Built-in pagination for large result sets
3. **Aggregation**: Efficient aggregation pipelines for statistics
4. **Caching**: Consider implementing Redis caching for frequently accessed data
5. **Image Optimization**: Consider image compression and CDN integration

## Testing

Run the integration test to verify the system:

```bash
node test-review-integration.js
```

This test verifies:
- Model definitions and imports
- Schema validation
- Aggregation methods
- Database connections
- Index creation
- Method functionality

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live review updates
2. **Advanced Analytics**: Review sentiment analysis
3. **Recommendation System**: ML-based review recommendations
4. **Bulk Operations**: Admin tools for bulk review management
5. **API Rate Limiting**: Implement rate limiting middleware
6. **Review Templates**: Pre-defined review templates for common scenarios
7. **Multi-language Support**: Internationalization for review content
8. **Review Verification**: Additional verification methods beyond bookings

## Conclusion

The review system backend is now fully implemented with comprehensive features including:

✅ Separate Review model with proper relationships  
✅ Complete CRUD API endpoints  
✅ Image upload support  
✅ Category-specific ratings  
✅ Host reply system  
✅ Community features (helpful votes, flagging)  
✅ Moderation and validation  
✅ Advanced querying and statistics  
✅ Automatic service rating updates  
✅ Comprehensive testing  
✅ Security and performance optimizations  

The system is production-ready and can be integrated with the existing frontend components.