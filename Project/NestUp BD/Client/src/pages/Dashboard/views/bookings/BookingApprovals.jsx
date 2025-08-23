import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './BookingApprovals.css';

const BookingApprovals = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingAction, setProcessingAction] = useState(null);

  // Fetch bookings based on active tab
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Please login to view bookings');
        }
        
        let endpoint = '/api/bookings/pending-approval';
        if (activeTab === 'approved') {
          endpoint = '/api/bookings/host/approved';
        } else if (activeTab === 'rejected') {
          endpoint = '/api/bookings/host/rejected';
        } else if (activeTab === 'pending') {
          endpoint = '/api/bookings/host/pending';
        }
        
        const response = await fetch(endpoint, {
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
        setBookings(data.bookings || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user, activeTab]);

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

  const getDuration = (booking) => {
    if (!booking.startDate || !booking.endDate) return 'N/A';
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Action handlers
  const handleApprove = async (bookingId) => {
    try {
      setProcessingAction(bookingId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve booking');
      }

      // Remove from current list and show success message
      setBookings(prev => prev.filter(booking => booking._id !== bookingId));
      alert('Booking approved successfully!');
    } catch (err) {
      console.error('Error approving booking:', err);
      alert('Failed to approve booking. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (bookingId, reason) => {
    try {
      setProcessingAction(bookingId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject booking');
      }

      // Remove from current list and show success message
      setBookings(prev => prev.filter(booking => booking._id !== bookingId));
      setShowRejectModal(false);
      setRejectReason('');
      alert('Booking rejected successfully!');
    } catch (err) {
      console.error('Error rejecting booking:', err);
      alert('Failed to reject booking. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const openRejectModal = (booking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedBooking(null);
    setRejectReason('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending Approval', class: 'status-pending' },
      approved: { text: 'Approved', class: 'status-approved' },
      rejected: { text: 'Rejected', class: 'status-rejected' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading booking approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Booking Approvals</h1>
        <p>Manage booking requests for your properties</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approval
        </button>
        <button 
          className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </button>
        <button 
          className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
        </button>
      </div>

      {/* Bookings List */}
      <div className="content-section">
        <div className="section-header">
          <h2>
            {activeTab === 'pending' && 'Pending Approval'}
            {activeTab === 'approved' && 'Approved Bookings'}
            {activeTab === 'rejected' && 'Rejected Bookings'}
          </h2>
          <span className="booking-count">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">📋</div>
            <h3>
              {activeTab === 'pending' && 'No Pending Approvals'}
              {activeTab === 'approved' && 'No Approved Bookings'}
              {activeTab === 'rejected' && 'No Rejected Bookings'}
            </h3>
            <p>
              {activeTab === 'pending' && 'You have no booking requests waiting for approval.'}
              {activeTab === 'approved' && 'You have not approved any bookings yet.'}
              {activeTab === 'rejected' && 'You have not rejected any bookings yet.'}
            </p>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="property-info">
                    <h3>{booking.service?.title || 'Property'}</h3>
                    <p className="location">{booking.service?.location ? `${booking.service.location.area}, ${booking.service.location.district}` : 'Location not available'}</p>
                  </div>
                  {getStatusBadge(activeTab)}
                </div>

                <div className="guest-info">
                  <h4>Guest Information</h4>
                  <p><strong>Name:</strong> {booking.user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {booking.user?.email || 'N/A'}</p>
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <span className="label">Booking ID:</span>
                    <span className="value">{booking._id?.slice(-8) || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value">{getDuration(booking)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Check-in:</span>
                    <span className="value">{formatDate(booking.startDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Check-out:</span>
                    <span className="value">{formatDate(booking.endDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Amount:</span>
                    <span className="value price">{formatAmount(booking.totalAmount)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Booked On:</span>
                    <span className="value">{formatDate(booking.createdAt)}</span>
                  </div>
                </div>

                <div className="booking-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => openDetailsModal(booking)}
                  >
                    View Details
                  </button>
                  
                  {activeTab === 'pending' && (
                    <>
                      <button 
                        className="btn-success"
                        onClick={() => handleApprove(booking._id)}
                        disabled={processingAction === booking._id}
                      >
                        {processingAction === booking._id ? 'Approving...' : 'Approve'}
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => openRejectModal(booking)}
                        disabled={processingAction === booking._id}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
              <div className="detail-section">
                <h4>Property Information</h4>
                <p><strong>Title:</strong> {selectedBooking.service?.title}</p>
                <p><strong>Location:</strong> {selectedBooking.service?.location ? `${selectedBooking.service.location.address}, ${selectedBooking.service.location.area}, ${selectedBooking.service.location.district}` : 'Location not available'}</p>
              </div>
              
              <div className="detail-section">
                <h4>Guest Information</h4>
                <p><strong>Name:</strong> {selectedBooking.user?.name}</p>
                <p><strong>Email:</strong> {selectedBooking.user?.email}</p>
              </div>
              
              <div className="detail-section">
                <h4>Booking Information</h4>
                <p><strong>Booking ID:</strong> {selectedBooking._id}</p>
                <p><strong>Check-in Date:</strong> {formatDate(selectedBooking.startDate)}</p>
                <p><strong>Check-out Date:</strong> {formatDate(selectedBooking.endDate)}</p>
                <p><strong>Duration:</strong> {getDuration(selectedBooking)}</p>
                <p><strong>Total Amount:</strong> {formatAmount(selectedBooking.totalAmount)}</p>
                <p><strong>Booking Date:</strong> {formatDate(selectedBooking.createdAt)}</p>
              </div>
              
              {selectedBooking.rejectionReason && (
                <div className="detail-section">
                  <h4>Rejection Reason</h4>
                  <p>{selectedBooking.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedBooking && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeRejectModal()}>
          <div className="reject-modal">
            <div className="reject-modal-header">
              <h3>Reject Booking</h3>
              <button className="close-btn" onClick={closeRejectModal}>×</button>
            </div>
            <div className="reject-modal-content">
              <p>Are you sure you want to reject this booking for <strong>{selectedBooking.service?.title}</strong>?</p>
              <div className="form-group">
                <label htmlFor="rejectReason">Reason for rejection (optional):</label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this booking..."
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={closeRejectModal}>
                  Cancel
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handleReject(selectedBooking._id, rejectReason)}
                  disabled={processingAction === selectedBooking._id}
                >
                  {processingAction === selectedBooking._id ? 'Rejecting...' : 'Reject Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingApprovals;