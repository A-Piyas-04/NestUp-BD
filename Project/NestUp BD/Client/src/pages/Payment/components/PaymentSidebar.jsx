import React from 'react';

const PaymentSidebar = ({ propertyDetails }) => {
  return (
    <div className="payment-sidebar">
      <div className="booking-card">
        <h3>Booking Summary</h3>
        <div className="property-card">
          <img src={propertyDetails.image} alt={propertyDetails.title} />
          <div className="property-details">
            <h4>{propertyDetails.title}</h4>
            <p>📍 {propertyDetails.location}</p>
            <p>📅 {propertyDetails.duration}</p>
          </div>
        </div>
        
        <div className="price-breakdown">
          <div className="price-row">
            <span>Monthly Rent:</span>
            <span>{propertyDetails.price}</span>
          </div>
          <div className="price-row">
            <span>Duration:</span>
            <span>{propertyDetails.duration}</span>
          </div>
          <div className="price-row total">
            <span>Total Amount:</span>
            <span>{propertyDetails.totalAmount}</span>
          </div>
        </div>
        
        <div className="security-badges">
          <div className="security-badge">
            <span>🔒</span>
            <span>SSL Secured</span>
          </div>
          <div className="security-badge">
            <span>🛡️</span>
            <span>PCI Compliant</span>
          </div>
          <div className="security-badge">
            <span>✅</span>
            <span>Verified Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSidebar; 