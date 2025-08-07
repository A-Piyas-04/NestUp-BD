import React from 'react';

const BookedNests = () => {
  const bookedNests = [
    {
      id: 1,
      nestName: 'Modern Apartment in Banani',
      hostName: 'Sarah Ahmed',
      location: 'Banani, Dhaka',
      price: '৳15,000',
      duration: '3 months',
      startDate: '2024-02-01',
      endDate: '2024-05-01',
      status: 'active',
      rating: 4.5
    },
    {
      id: 2,
      nestName: 'Student Housing near DU',
      hostName: 'Rahim Khan',
      location: 'Dhanmondi, Dhaka',
      price: '৳9,500',
      duration: '6 months',
      startDate: '2024-01-15',
      endDate: '2024-07-15',
      status: 'active',
      rating: 4.2
    },
    {
      id: 3,
      nestName: 'Cozy Room in Gulshan',
      hostName: 'Fatima Rahman',
      location: 'Gulshan, Dhaka',
      price: '৳12,000',
      duration: '1 month',
      startDate: '2023-12-01',
      endDate: '2024-01-01',
      status: 'completed',
      rating: 4.8
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'Active', class: 'status-active' },
      completed: { text: 'Completed', class: 'status-completed' },
      cancelled: { text: 'Cancelled', class: 'status-cancelled' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Booked Nests</h1>
        <p>Your accommodation bookings and history</p>
      </div>
      
      <div className="bookings-summary">
        <div className="summary-card">
          <h3>Active Bookings</h3>
          <div className="booking-count">2</div>
          <p>Currently staying</p>
        </div>
        
        <div className="summary-card">
          <h3>Total Bookings</h3>
          <div className="booking-count">5</div>
          <p>All time</p>
        </div>
        
        <div className="summary-card">
          <h3>Average Rating</h3>
          <div className="avg-rating">4.5 ⭐</div>
          <p>Given to hosts</p>
        </div>
      </div>
      
      <div className="bookings-section">
        <h2>Your Bookings</h2>
        
        <div className="bookings-list">
          {bookedNests.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-info">
                  <h3>{booking.nestName}</h3>
                  <p className="host-name">Hosted by {booking.hostName}</p>
                  <p className="location">📍 {booking.location}</p>
                </div>
                <div className="booking-status">
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              
              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{booking.duration}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">{booking.price}/month</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Period:</span>
                  <span className="detail-value">{booking.startDate} to {booking.endDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Rating:</span>
                  <span className="detail-value">⭐ {booking.rating}/5</span>
                </div>
              </div>
              
              <div className="booking-actions">
                <button className="btn-primary">View Details</button>
                <button className="btn-secondary">Contact Host</button>
                {booking.status === 'completed' && (
                  <button className="btn-secondary">Write Review</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookedNests; 