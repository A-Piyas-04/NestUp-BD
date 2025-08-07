import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ListingCard.css';

const ListingCard = ({ title, location, price, image, availableFrom, availableTo, verifiedHost = false, hygieneBadge = false }) => {
  const navigate = useNavigate();
  
  // Format dates to be more user-friendly
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formattedAvailableFrom = availableFrom ? formatDate(availableFrom) : '';
  const formattedAvailableTo = availableTo ? formatDate(availableTo) : '';

  const handleViewDetails = () => {
    // Calculate duration in months
    const fromDate = new Date(availableFrom);
    const toDate = new Date(availableTo);
    const durationInMonths = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24 * 30));
    
    // Extract price number
    const priceNumber = parseInt(price.replace(/[^\d]/g, ''));
    const totalAmount = priceNumber * durationInMonths;
    
    const propertyDetails = {
      title,
      location,
      price: `৳${priceNumber.toLocaleString()}`,
      duration: `${durationInMonths} months`,
      totalAmount: `৳${totalAmount.toLocaleString()}`,
      image,
      availableFrom: formattedAvailableFrom,
      availableTo: formattedAvailableTo
    };

    navigate('/payment', { state: { propertyDetails } });
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save property:', title);
  };

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
          <button className="listing-button primary" onClick={handleViewDetails}>Book Now</button>
          <button className="listing-button secondary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
