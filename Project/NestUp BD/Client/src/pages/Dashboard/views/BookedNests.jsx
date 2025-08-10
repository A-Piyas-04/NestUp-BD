import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const BookedNests = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [bookedNests, setBookedNests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

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
        const response = await fetch('/api/bookings', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookedNests(data.bookings || []);
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

  // Format date display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Format amount display
  const formatAmount = (amount) => {
    return `৳${amount.toLocaleString()}`;
  };

  // Calculate duration between dates
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  };

  // Determine booking status based on dates and payment status
  const getBookingStatus = (booking) => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    
    if (booking.status === 'cancelled') return 'cancelled';
    if (booking.paymentStatus !== 'completed') return 'pending';
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    if (now > endDate) return 'completed';
    return booking.status;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'Active', class: 'status-active' },
      upcoming: { text: 'Upcoming', class: 'status-pending' },
      completed: { text: 'Completed', class: 'status-completed' },
      cancelled: { text: 'Cancelled', class: 'status-cancelled' },
      pending: { text: 'Pending', class: 'status-pending' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  // Calculate summary statistics from real data
  const activeBookings = bookedNests.filter(booking => {
    const status = getBookingStatus(booking);
    return status === 'active' || status === 'upcoming';
  }).length;

  const totalBookings = bookedNests.length;

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
          <h3>Completed Bookings</h3>
          <div className="avg-rating">{bookedNests.filter(b => getBookingStatus(b) === 'completed').length}</div>
          <p>Successfully finished</p>
        </div>
      </div>
      
      <div className="bookings-section">
        <h2>Your Bookings</h2>
        
        <div className="bookings-list">
          {bookedNests.length === 0 ? (
            <div className="empty-state">
              <p>No bookings found.</p>
              <p>Start exploring properties to make your first booking!</p>
            </div>
          ) : (
            bookedNests.map((booking) => {
              const status = getBookingStatus(booking);
              return (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-info">
                      <h3>{booking.service?.title || 'Property Booking'}</h3>
                      <p className="host-name">Booking ID: {booking.confirmationCode || booking._id.slice(-8)}</p>
                      <p className="location">📍 {booking.service?.location?.area}, {booking.service?.location?.district}</p>
                    </div>
                    <div className="booking-status">
                      {getStatusBadge(status)}
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{calculateDuration(booking.startDate, booking.endDate)}</span>
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
                      <span className="detail-label">Payment Status:</span>
                      <span className="detail-value">{booking.paymentStatus}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Booked On:</span>
                      <span className="detail-value">{formatDate(booking.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="booking-actions">
                    <button className="btn-primary">View Details</button>
                    <button className="btn-secondary">Contact Support</button>
                    {status === 'completed' && (
                      <button className="btn-secondary">Write Review</button>
                    )}
                    {(status === 'pending' || status === 'upcoming') && (
                      <button className="btn-secondary">Modify Booking</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BookedNests;