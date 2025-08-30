import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import NestReviewForm from '../../../../components/NestReviewForm/NestReviewForm';

const BookedNests = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [bookedNests, setBookedNests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportBooking, setSupportBooking] = useState(null);

  // Check for payment success state
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setShowSuccessMessage(true);
      setPaymentDetails({
        transactionId: location.state.transactionId,
        amount: location.state.amount
      });
      
      // Auto-hide success message after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Fetch bookings from backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Please login to view your bookings');
        }
        
        const response = await fetch('/api/bookings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookedNests(data.bookings || []);
        // Store stats separately if available
        if (data.stats) {
          setBookedNests(prev => ({ ...prev, stats: data.stats }));
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
        setBookedNests([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return '৳0';
    return `৳${amount.toLocaleString()}`;
  };

  // Use calculated fields from API response instead of client-side calculation
  const getBookingStatus = (booking) => {
    // Use calculatedStatus from API if available, fallback to status
    return booking.calculatedStatus || booking.status || 'unknown';
  };

  const getDuration = (booking) => {
    // Use durationDays from API if available
    if (booking.durationDays && typeof booking.durationDays === 'number') {
      return `${booking.durationDays} day${booking.durationDays !== 1 ? 's' : ''}`;
    }
    
    // Use duration from API if available and it's a number
    if (booking.duration && typeof booking.duration === 'number') {
      return `${booking.duration} day${booking.duration !== 1 ? 's' : ''}`;
    }
    
    // Fallback calculation
    if (!booking.startDate || !booking.endDate) return 'N/A';
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'Active', class: 'status-active' },
      pending: { text: 'Pending Approval', class: 'status-pending' },
      approved: { text: 'Approved', class: 'status-approved' },
      rejected: { text: 'Rejected', class: 'status-rejected' },
      completed: { text: 'Completed', class: 'status-completed' },
      upcoming: { text: 'Upcoming', class: 'status-upcoming' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/nest-reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: reviewData // FormData from NestReviewForm
      });

      if (response.ok) {
        const result = await response.json();
        alert('Nest review submitted successfully!');
        setShowReviewForm(false);
        setReviewingBooking(null);
        // Update the booking to mark as reviewed
        setBookedNests(prev => prev.map(booking => 
          booking._id === reviewingBooking._id 
            ? { 
                ...booking, 
                nestReviewSubmitted: true,
                nestReviewId: result.data._id,
                summary: {
                  ...booking.summary,
                  canReview: false
                }
              }
            : booking
        ));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit nest review');
      }
    } catch (error) {
      console.error('Error submitting nest review:', error);
      alert('Failed to submit nest review. Please try again.');
    }
  };

  const openReviewForm = (booking) => {
    setReviewingBooking(booking);
    setShowReviewForm(true);
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setReviewingBooking(null);
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const openSupportModal = (booking) => {
    setSupportBooking(booking);
    setShowSupportModal(true);
  };

  const closeSupportModal = () => {
    setShowSupportModal(false);
    setSupportBooking(null);
  };

  // Use API stats if available, fallback to client calculation
  const bookingsArray = Array.isArray(bookedNests) ? bookedNests : [];
  const totalBookings = bookedNests.stats?.total || bookingsArray.length;
  const activeBookings = bookedNests.stats?.active || bookingsArray.filter(booking => {
    const status = getBookingStatus(booking);
    return status === 'active' || status === 'upcoming';
  }).length;
  const approvedBookings = bookedNests.stats?.approved || bookingsArray.filter(b => getBookingStatus(b) === 'approved').length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Booked Nests</h1>
          <p>Loading your bookings...</p>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Booked Nests</h1>
          <p>Error loading bookings</p>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Booked Nests</h1>
        <p>Your accommodation bookings and history</p>
      </div>
      
      {/* Payment Success Message */}
      {showSuccessMessage && paymentDetails && (
        <div className="success-message-container">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <div className="success-content">
              <h3>Payment Successful!</h3>
              <p>Your booking has been confirmed successfully.</p>
              <div className="payment-details">
                <p><strong>Transaction ID:</strong> {paymentDetails.transactionId}</p>
                <p><strong>Amount Paid:</strong> ৳{paymentDetails.amount}</p>
              </div>
              <p className="success-note">You will receive a confirmation email shortly.</p>
            </div>
            <button 
              className="close-success" 
              onClick={() => setShowSuccessMessage(false)}
              aria-label="Close success message"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="bookings-summary">
        <div className="summary-card">
          <h3>Active Bookings</h3>
          <div className="booking-count">{activeBookings}</div>
          <p>Currently staying</p>
        </div>
        
        <div className="summary-card">
          <h3>Total Bookings</h3>
          <div className="booking-count">{totalBookings}</div>
          <p>All time</p>
        </div>
        
        <div className="summary-card">
          <h3>Approved Bookings</h3>
          <div className="avg-rating">{approvedBookings}</div>
          <p>Host approved</p>
        </div>
      </div>
      
      <div className="bookings-section">
        <h2>Your Bookings</h2>
        
        <div className="bookings-list">
          {bookingsArray.length === 0 ? (
            <div className="empty-state">
              <p>No bookings found.</p>
              <p>Start exploring properties to make your first booking!</p>
            </div>
          ) : (
            bookingsArray.map((booking) => {
              const status = getBookingStatus(booking);
              return (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-info">
                    <h3>{booking.service?.title || 'Property Booking'}</h3>
                    <p className="host-name">Booking ID: {booking.formattedConfirmationCode || booking.confirmationCode || booking._id.slice(-8)}</p>
                    <p className="location">📍 {booking.service?.location?.area}, {booking.service?.location?.district}</p>
                  </div>
                    <div className="booking-status">
                      {getStatusBadge(status)}
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{getDuration(booking)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Total Amount:</span>
                      <span className="detail-value">{formatAmount(booking.totalAmount)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Period:</span>
                      <span className="detail-value">{formatDate(booking.startDate)} to {formatDate(booking.endDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Approval Status:</span>
                      <span className="detail-value">{getBookingStatus(booking)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Booked On:</span>
                      <span className="detail-value">{formatDate(booking.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="booking-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => openDetailsModal(booking)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => openSupportModal(booking)}
                    >
                      Contact Support
                    </button>
                    {(booking.summary?.canReview || (booking.status === 'approved' && !booking.nestReviewSubmitted)) && (
                      <button 
                        className="btn-review"
                        onClick={() => openReviewForm(booking)}
                      >
                        Review Nest
                      </button>
                    )}
                    {booking.nestReviewSubmitted && (
                      <span className="review-status">✓ Nest Reviewed</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeDetailsModal()}>
          <div className="details-modal">
            <div className="details-modal-header">
              <h3>Booking Details</h3>
              <button className="close-btn" onClick={closeDetailsModal}>×</button>
            </div>
            <div className="details-modal-content">
              <div className="property-details">
                <h4>{selectedBooking.service?.title}</h4>
                <p className="property-location">📍 {selectedBooking.service?.location?.area}, {selectedBooking.service?.location?.district}</p>
                <p className="property-type">{selectedBooking.service?.propertyType}</p>
              </div>
              
              <div className="booking-info">
                <div className="info-section">
                  <h5>Booking Information</h5>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Booking ID:</span>
                      <span className="info-value">{selectedBooking.formattedConfirmationCode || selectedBooking.confirmationCode || selectedBooking._id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Check-in:</span>
                      <span className="info-value">{formatDate(selectedBooking.startDate)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Check-out:</span>
                      <span className="info-value">{formatDate(selectedBooking.endDate)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Duration:</span>
                      <span className="info-value">{getDuration(selectedBooking)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Guests:</span>
                      <span className="info-value">{selectedBooking.guestCount || selectedBooking.guestInfo?.numberOfGuests || 1}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span className="info-value">{getStatusBadge(getBookingStatus(selectedBooking))}</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-section">
                  <h5>Payment Information</h5>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Total Amount:</span>
                      <span className="info-value">{formatAmount(selectedBooking.totalAmount)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Approval Status:</span>
                      <span className="info-value">{selectedBooking.payment?.status || selectedBooking.paymentStatus || 'Paid'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Booked On:</span>
                      <span className="info-value">{formatDate(selectedBooking.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-section">
                  <h5>Contact Information</h5>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedBooking.personalInfo?.email || selectedBooking.contactInfo?.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{selectedBooking.personalInfo?.phone || selectedBooking.contactInfo?.phone}</span>
                    </div>
                  </div>
                </div>
                
                {selectedBooking.specialRequests && (
                  <div className="info-section">
                    <h5>Special Requests</h5>
                    <p className="special-requests">{selectedBooking.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {showSupportModal && supportBooking && (
        <div className="modal-overlay" onClick={closeSupportModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact Support</h3>
              <button className="close-btn" onClick={closeSupportModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="property-info">
                <h4>{supportBooking.service?.title}</h4>
                <p>📍 {supportBooking.service?.location?.area}, {supportBooking.service?.location?.district}</p>
                <p>Booking ID: {supportBooking._id}</p>
                <p>Status: {getBookingStatus(supportBooking)}</p>
              </div>
              <form className="support-form">
                <div className="form-group">
                  <label>Issue Category</label>
                  <select className="form-control">
                    <option value="">Select an issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="booking">Booking Problem</option>
                    <option value="property">Property Issue</option>
                    <option value="cancellation">Cancellation Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Please describe your issue in detail..."
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Your email address"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={closeSupportModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && reviewingBooking && (
        <NestReviewForm
          isOpen={showReviewForm}
          onClose={closeReviewForm}
          onSubmit={handleReviewSubmit}
          booking={reviewingBooking}
          service={reviewingBooking.service}
        />
      )}
    </div>
  );
};

export default BookedNests;