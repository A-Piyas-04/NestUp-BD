# NestUp BD Database Models Analysis

## Overview
This document provides a comprehensive analysis of the NestUp BD database structure, including all collections, their attributes, relationships, and how they interact with each other through updates and operations.

## Database Collections

The NestUp BD application uses **5 main collections** in MongoDB:

1. **User** - User accounts and profiles
2. **Service** - Property listings and services
3. **Booking** - Booking requests and reservations
4. **Payment** - Payment processing and transactions
5. **Review** - User reviews and ratings

---

## 1. User Collection

### Structure
```javascript
{
  _id: ObjectId,
  name: String (required, min: 2 chars),
  email: String (required, unique, validated),
  password: String (required, hashed, min: 6 chars),
  isVerified: Boolean (default: true),
  
  profile: {
    phone: String,
    nidNumber: String,
    dateOfBirth: Date,
    gender: Enum ['male', 'female', 'other'],
    occupation: Enum ['student', 'professional', 'business', 'government', 'other'],
    institution: String,
    department: String,
    studentId: String,
    
    address: {
      division: String,
      district: String,
      area: String,
      fullAddress: String,
      postalCode: String
    },
    
    emergencyContact: {
      name: String,
      relation: String,
      phone: String
    },
    
    preferences: {
      receiveNotifications: Boolean (default: true),
      newsletterSubscription: Boolean (default: false),
      twoFactorAuth: Boolean (default: false),
      language: Enum ['english', 'bangla'] (default: 'english')
    },
    
    profilePicture: String (URL)
  },
  
  wishlist: [ObjectId] (references Service),
  createdAt: Date,
  updatedAt: Date
}
```

### Key Features
- **Password Hashing**: Automatic bcrypt hashing with salt rounds (12)
- **Email Validation**: Regex validation for email format
- **Wishlist System**: Array of Service ObjectIds for saved properties
- **Notification Preferences**: Controls notification delivery
- **Auto-timestamps**: Automatic createdAt and updatedAt management

### Methods
- `comparePassword(candidatePassword)`: Compare plain text with hashed password
- Pre-save middleware for password hashing and timestamp updates

---

## 2. Service Collection

### Structure
```javascript
{
  _id: ObjectId,
  title: String (required, max: 200 chars),
  propertyType: Enum ['apartment', 'house', 'room', 'hostel', 'dormitory', 'sublet'],
  description: String (required, max: 2000 chars),
  
  location: {
    district: String (required),
    area: String (required),
    address: String (required),
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  price: Number (required, min: 0),
  thumbnail: String (URL validation),
  
  availability: {
    from: Date (required),
    to: Date (required),
    isAvailable: Boolean (default: true)
  },
  
  isBooked: Boolean (default: false),
  currentBooking: ObjectId (references Booking),
  
  propertyDetails: {
    bedrooms: String (required),
    bathrooms: String (required),
    squareFeet: Number (min: 0),
    furnishing: Enum ['unfurnished', 'semi-furnished', 'fully-furnished']
  },
  
  amenities: {
    wifi: Boolean,
    ac: Boolean,
    parking: Boolean,
    kitchen: Boolean,
    laundry: Boolean,
    studyArea: Boolean,
    securityGuard: Boolean,
    cctv: Boolean
  },
  
  photos: [String] (URL validation),
  
  contact: {
    name: String (required),
    phone: String (required),
    email: String (required),
    whatsapp: String
  },
  
  owner: ObjectId (references User, required),
  
  rating: {
    average: Number (0-5, default: 0),
    count: Number (default: 0),
    categories: {
      cleanliness: Number (0-5),
      communication: Number (0-5),
      location: Number (0-5),
      value: Number (0-5),
      amenities: Number (0-5)
    }
  },
  
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Key Features
- **Booking Status Management**: `isBooked` and `currentBooking` fields
- **Rating System**: Comprehensive rating with categories
- **Photo Management**: Array of image URLs with validation
- **Location Coordinates**: Support for GPS coordinates
- **Amenities Tracking**: Boolean flags for various amenities

### Methods
- `updateServiceRating(serviceId)`: Static method to recalculate ratings from reviews
- Virtual `reviewsData`: Populates approved reviews
- Pre-save middleware for timestamp updates

---

## 3. Booking Collection

### Structure
```javascript
{
  _id: ObjectId,
  service: ObjectId (references Service, required),
  user: ObjectId (references User, required),
  payment: ObjectId (references Payment),
  
  startDate: Date (required, future validation),
  endDate: Date (required, after startDate),
  
  basePrice: Number (required, min: 0),
  totalAmount: Number (required, min: 0),
  
  fees: {
    serviceFee: Number (default: 0),
    cleaningFee: Number (default: 0),
    securityDeposit: Number (default: 0),
    taxAmount: Number (default: 0)
  },
  
  status: Enum ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
  
  isApproved: Boolean (null = pending, true = approved, false = rejected),
  approvedAt: Date,
  rejectedAt: Date,
  approvalReason: String (max: 500 chars),
  
  paymentStatus: Enum ['pending', 'processing', 'paid', 'partial', 'failed', 'refunded'],
  
  guestInfo: {
    numberOfGuests: Number (1-20, default: 1),
    specialRequests: String (max: 1000 chars)
  },
  
  contactInfo: {
    phone: String (required, validated),
    email: String (required, validated)
  },
  
  confirmationCode: String (unique, auto-generated),
  
  confirmedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String (max: 500 chars),
  
  reviewSubmitted: Boolean (default: false),
  reviewId: ObjectId (references Review),
  
  createdAt: Date,
  updatedAt: Date
}
```

### Key Features
- **Dual Status System**: `status` for booking state, `isApproved` for host approval
- **Automatic Confirmation Code**: Generated on creation
- **Fee Breakdown**: Detailed cost structure
- **Date Validation**: Ensures logical date relationships
- **Review Integration**: Links to submitted reviews

### Virtual Properties
- `durationDays`: Calculated booking duration in days
- `durationMonths`: Calculated booking duration in months
- `formattedConfirmationCode`: Formatted as "NB-{code}"
- `currentStatus`: Dynamic status based on dates

### Methods
- `isActive()`: Check if booking is currently active
- `isCompleted()`: Check if booking is completed
- `canBeCancelled()`: Check if booking can be cancelled (24h rule)
- `markAsCompleted()`: Mark booking as completed
- `cancel(reason)`: Cancel booking with reason
- `confirm()`: Confirm booking and set payment as paid
- `approve(reason)`: Approve booking
- `reject(reason)`: Reject booking

### Static Methods
- `findByStatus(status)`: Find bookings by status
- `findActive()`: Find currently active bookings
- `checkAvailability()`: Check service availability for dates
- `findPendingApproval()`: Find bookings awaiting approval
- `getBookingStats()`: Get booking statistics

---

## 4. Payment Collection

### Structure
```javascript
{
  _id: ObjectId,
  booking: ObjectId (references Booking, required, unique),
  user: ObjectId (references User, required),
  
  amount: Number (required, min: 0),
  
  amountBreakdown: {
    baseAmount: Number (required),
    serviceFee: Number (default: 0),
    cleaningFee: Number (default: 0),
    securityDeposit: Number (default: 0),
    taxAmount: Number (default: 0),
    discountAmount: Number (default: 0)
  },
  
  currency: Enum ['BDT', 'USD', 'EUR'] (default: 'BDT'),
  
  paymentMethod: Enum ['bkash', 'nagad', 'rocket', 'mobile_banking', 'bank_transfer', 'credit_card', 'cash'],
  
  paymentDetails: {
    mobile: {
      phoneNumber: String (validated),
      transactionId: String,
      senderNumber: String
    },
    bank: {
      accountNumber: String,
      accountHolderName: String,
      bankName: String,
      routingNumber: String,
      swiftCode: String
    },
    card: {
      last4Digits: String (4 digits),
      cardType: Enum ['visa', 'mastercard', 'amex', 'discover'],
      expiryMonth: Number (1-12),
      expiryYear: Number
    }
  },
  
  status: Enum ['pending', 'processing', 'paid', 'partial', 'failed', 'cancelled', 'refunded'],
  
  personalInfo: {
    firstName: String (required, max: 50),
    lastName: String (required, max: 50),
    email: String (required, validated),
    phone: String (required, validated),
    address: {
      street: String (max: 200),
      city: String (max: 50),
      state: String (max: 50),
      zipCode: String (max: 10),
      country: String (default: 'Bangladesh')
    }
  },
  
  termsAccepted: Boolean (required: true),
  
  processedAt: Date,
  paidAt: Date,
  failedAt: Date,
  failureReason: String (max: 500),
  
  gatewayResponse: {
    transactionId: String,
    gatewayStatus: String,
    gatewayMessage: String,
    gatewayReference: String,
    rawResponse: Mixed
  },
  
  refund: {
    isRefunded: Boolean (default: false),
    refundAmount: Number (default: 0),
    refundType: Enum ['full', 'partial'],
    reason: String (max: 500),
    requestedAt: Date,
    processedAt: Date,
    refundId: String,
    gatewayRefundId: String
  },
  
  confirmationNumber: String (unique, auto-generated),
  internalNotes: String (max: 1000),
  
  createdAt: Date,
  updatedAt: Date
}
```

### Key Features
- **One-to-One with Booking**: Each payment belongs to exactly one booking
- **Multiple Payment Methods**: Support for various local and international methods
- **Automatic Amount Calculation**: Total calculated from breakdown
- **Refund Management**: Complete refund tracking system
- **Gateway Integration**: Support for external payment gateways

### Virtual Properties
- `description`: Payment description
- `personalInfo.fullName`: Combined first and last name
- `formattedConfirmationNumber`: Formatted as "PAY-{number}"
- `netAmount`: Amount after refunds
- `paymentMethodDisplay`: Human-readable payment method name

### Methods
- `markAsPaid()`: Mark payment as completed
- `markAsFailed(reason)`: Mark payment as failed
- `processRefund()`: Process refund with amount and reason
- `canBeRefunded()`: Check if payment can be refunded
- `getSummary()`: Get payment summary object

---

## 5. Review Collection

### Structure
```javascript
{
  _id: ObjectId,
  user: ObjectId (references User, required),
  service: ObjectId (references Service, required),
  booking: ObjectId (references Booking, required),
  
  rating: Number (1-5, required, allows half ratings),
  comment: String (required, 10-1000 chars),
  
  images: [{
    url: String (required),
    publicId: String,
    caption: String (max: 200)
  }],
  
  categories: {
    cleanliness: Number (1-5),
    communication: Number (1-5),
    location: Number (1-5),
    value: Number (1-5),
    amenities: Number (1-5)
  },
  
  status: Enum ['pending', 'approved', 'rejected', 'flagged'] (default: 'approved'),
  
  hostReply: {
    comment: String (max: 500),
    repliedAt: Date,
    repliedBy: ObjectId (references User)
  },
  
  helpfulVotes: {
    count: Number (default: 0),
    users: [ObjectId] (references User)
  },
  
  flags: [{
    user: ObjectId (references User, required),
    reason: Enum ['inappropriate', 'spam', 'fake', 'offensive', 'other'],
    description: String (max: 200),
    flaggedAt: Date
  }],
  
  isEdited: Boolean (default: false),
  editHistory: [{
    editedAt: Date,
    previousRating: Number,
    previousComment: String
  }],
  
  isVerified: Boolean (default: false),
  
  createdAt: Date,
  updatedAt: Date
}
```

### Key Features
- **Unique Constraint**: One review per user per booking
- **Category Ratings**: Detailed rating breakdown
- **Host Reply System**: Hosts can respond to reviews
- **Flagging System**: Community moderation
- **Edit History**: Track review modifications
- **Image Support**: Multiple images with captions

### Virtual Properties
- `categoryAverage`: Average of all category ratings

### Validation
- Pre-save validation ensures only completed bookings can be reviewed
- User can only review their own bookings
- Service must match booking service

### Static Methods
- `getReviewsWithPagination()`: Paginated review retrieval
- `getReviewStats()`: Comprehensive review statistics

---

## Relationships and Dependencies

### 1. User → Service (One-to-Many)
- **Relationship**: `Service.owner` → `User._id`
- **Effect**: When user is deleted, their services should be handled (cascade or transfer)
- **Wishlist**: `User.wishlist` contains array of `Service._id`

### 2. User → Booking (One-to-Many)
- **Relationship**: `Booking.user` → `User._id`
- **Effect**: User deletion affects all their bookings
- **Cascade**: Bookings should be cancelled or transferred

### 3. Service → Booking (One-to-Many)
- **Relationship**: `Booking.service` → `Service._id`
- **Effect**: Service deletion affects active bookings
- **Booking Status**: `Service.isBooked` and `Service.currentBooking` updated when booking confirmed

### 4. Booking → Payment (One-to-One)
- **Relationship**: `Payment.booking` → `Booking._id` (unique)
- **Bidirectional**: `Booking.payment` → `Payment._id`
- **Effect**: Payment status changes affect booking status

### 5. Booking → Review (One-to-One)
- **Relationship**: `Review.booking` → `Booking._id` (unique per user)
- **Bidirectional**: `Booking.reviewId` → `Review._id`
- **Effect**: Review creation marks `Booking.reviewSubmitted = true`

### 6. Service → Review (One-to-Many)
- **Relationship**: `Review.service` → `Service._id`
- **Effect**: Reviews automatically update `Service.rating` via post-save middleware

---

## Update Cascades and Effects

### When a User is Updated/Deleted:
1. **Services**: Owner information may need updates
2. **Bookings**: Contact information may need updates
3. **Payments**: Personal information may need updates
4. **Reviews**: User information in populated queries affected
5. **Wishlist**: Other users' wishlists may contain deleted user's services

### When a Service is Updated/Deleted:
1. **Bookings**: Active bookings need handling (cancellation/completion)
2. **Reviews**: Reviews become orphaned (soft delete recommended)
3. **Payments**: Related payments need status updates
4. **User Wishlists**: Service removed from all user wishlists
5. **Current Booking**: `Service.currentBooking` needs clearing

### When a Booking is Updated:
1. **Service Availability**: 
   - Confirmed booking: `Service.isBooked = true`, `Service.currentBooking = booking._id`
   - Cancelled/Completed booking: `Service.isBooked = false`, `Service.currentBooking = null`
2. **Payment Status**: Booking status changes may trigger payment updates
3. **Review Eligibility**: Only completed bookings can be reviewed

### When a Payment is Updated:
1. **Booking Status**: 
   - Payment successful: Booking can move to 'confirmed' (after host approval)
   - Payment failed: Booking remains 'pending' or moves to 'cancelled'
2. **Service Booking**: Payment completion doesn't immediately book service (awaits approval)

### When a Review is Created/Updated/Deleted:
1. **Service Rating**: Automatic recalculation via `Service.updateServiceRating()`
2. **Booking**: `reviewSubmitted = true` and `reviewId` set
3. **Rating Categories**: All category averages recalculated
4. **Review Count**: `Service.rating.count` updated

---

## Database Indexes

### User Collection
- `email`: Unique index for authentication
- `createdAt`: For sorting and pagination

### Service Collection
- `owner`: For finding user's services
- `location.district, location.area`: For location-based searches
- `propertyType`: For filtering by property type
- `price`: For price range queries
- `isBooked`: For availability filtering
- `rating.average`: For sorting by rating

### Booking Collection
- `user, createdAt`: Compound index for user's booking history
- `service, startDate`: For service availability checks
- `status`: For status-based queries
- `paymentStatus`: For payment tracking
- `isApproved`: For approval workflow
- `confirmationCode`: Unique index for booking lookup

### Payment Collection
- `user, status`: For user's payment history
- `booking`: Unique index (one-to-one relationship)
- `paymentDetails.mobile.transactionId`: For transaction lookup
- `confirmationNumber`: Unique index for payment lookup

### Review Collection
- `service, createdAt`: For service reviews with sorting
- `user, createdAt`: For user's review history
- `booking`: For booking-review relationship
- `rating`: For rating-based filtering
- `status`: For approved/pending reviews
- `user, booking`: Unique compound index (one review per booking per user)

---

## Data Consistency and Integrity

### Referential Integrity
- All ObjectId references use proper validation
- Cascade deletes handled through application logic
- Orphaned records prevented through pre-save validation

### Business Logic Constraints
- Users can only review completed bookings
- Services can only have one active booking
- Payments are one-to-one with bookings
- Reviews automatically update service ratings
- Booking dates must be logical (end > start, start >= now)

### Automatic Updates
- Service ratings recalculated on review changes
- Booking status timestamps set automatically
- Payment amounts calculated from breakdown
- Confirmation codes generated automatically

---

## Performance Considerations

### Query Optimization
- Strategic indexing for common query patterns
- Pagination support for large datasets
- Aggregation pipelines for statistics
- Virtual population for related data

### Data Volume Management
- Soft deletes for important records
- Archive old completed bookings
- Compress large text fields
- Optimize image storage (external CDN)

### Caching Strategies
- Cache frequently accessed service data
- Cache user profile information
- Cache aggregated statistics
- Cache search results

This comprehensive database structure supports the full NestUp BD application workflow from user registration through service listing, booking, payment, and review processes.