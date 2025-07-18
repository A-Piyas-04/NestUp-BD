import React from 'react';
import './ListingCard.css';

const ListingCard = ({ title, location, price, image, availableFrom, availableTo, verifiedHost = false, hygieneBadge = false }) => {
  // Format dates to be more user-friendly
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formattedAvailableFrom = availableFrom ? formatDate(availableFrom) : '';
  const formattedAvailableTo = availableTo ? formatDate(availableTo) : '';

  return (
    <div className="listing-card">
      <div className="listing-image-container">
        <img src={image} alt={title} className="listing-image" />
        {verifiedHost && <span className="listing-badge verified-badge">✓ Verified</span>}
        {hygieneBadge && <span className="listing-badge hygiene-badge">✨ Hygiene Certified</span>}
      </div>
      
      <div className="listing-content">
        <h3 className="listing-title">{title}</h3>
        <p className="listing-location">
          <span className="location-icon">📍</span> {location}
        </p>
        <p className="listing-availability">
          <span className="calendar-icon">📅</span> {formattedAvailableFrom} - {formattedAvailableTo}
        </p>
        <div className="listing-price-container">
          <p className="listing-price">{price}</p>
          <span className="price-period">per month</span>
        </div>
        <div className="listing-actions">
          <button className="listing-button primary">View Details</button>
          <button className="listing-button secondary">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
