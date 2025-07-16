import React from 'react';
import './ListingCard.css';

const ListingCard = ({ title, location, price, image, verifiedHost = false, hygieneBadge = false }) => {
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
