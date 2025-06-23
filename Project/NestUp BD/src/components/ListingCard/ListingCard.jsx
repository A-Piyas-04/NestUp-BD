import React from 'react';
import './ListingCard.css';

const ListingCard = ({ title, location, price, image }) => {
  return (
    <div className="listing-card">
      <img src={image} alt="Service" className="listing-image" />
      <div className="listing-content">
        <h3 className="listing-title">{title}</h3>
        <p className="listing-location">{location}</p>
        <p className="listing-price">Price: {price}</p>
        <button className="listing-button">View Details</button>
      </div>
    </div>
  );
};

export default ListingCard;
