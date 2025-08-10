import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListingCard.css';

const ListingCard = ({ 
  title, 
  location, 
  price, 
  image, 
  availableFrom, 
  availableTo, 
  verifiedHost = false, 
  hygieneBadge = false,
  service = null,
  user = null,
  onViewDetails = null
}) => {
  const navigate = useNavigate();
  
  // Format dates to be more user-friendly
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formattedAvailableFrom = availableFrom ? formatDate(availableFrom) : '';
  const formattedAvailableTo = availableTo ? formatDate(availableTo) : '';

  const handleViewDetails = () => {
    if (onViewDetails && service) {
      // If modal callback is provided, use it
      onViewDetails(service);
    } else {
      // Fallback to payment navigation for backward compatibility
      const fromDate = new Date(availableFrom);
      const toDate = new Date(availableTo);
      const durationInMonths = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24 * 30));
      
      const priceNumber = parseInt(price.replace(/[^\d]/g, ''));
      const totalAmount = priceNumber * durationInMonths;
      
      const propertyDetails = {
        serviceId: service?._id,
        title,
        location,
        price: `৳${priceNumber.toLocaleString()}`,
        duration: `${durationInMonths} months`,
        totalAmount: `৳${totalAmount.toLocaleString()}`,
        image,
        availableFrom: formattedAvailableFrom,
        availableTo: formattedAvailableTo,
        startDate: availableFrom,
        endDate: availableTo
      };

      navigate('/payment', { state: { propertyDetails } });
    }
  };

  const handleBook = () => {
    // Navigate directly to payment page for booking
    const fromDate = new Date(availableFrom);
    const toDate = new Date(availableTo);
    const durationInDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    
    const priceNumber = parseInt(price.replace(/[^\d]/g, ''));
    const totalAmount = priceNumber;
    
    const propertyDetails = {
      serviceId: service?._id,
      title,
      location,
      price: `৳${priceNumber.toLocaleString()}`,
      duration: `${durationInDays} days`,
      totalAmount: `৳${totalAmount.toLocaleString()}`,
      image,
      availableFrom: formattedAvailableFrom,
      availableTo: formattedAvailableTo,
      startDate: availableFrom,
      endDate: availableTo
    };

    navigate('/payment', { state: { propertyDetails } });
  };

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if property is already in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !service || !service._id) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/wishlist/check/${service._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isInWishlist);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [user, service]);

  const handleSave = async () => {
    if (!user) {
      alert('Please login to save properties');
      return;
    }

    if (!service || !service._id) {
      alert('Service information not available');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to save properties');
        return;
      }

      const url = isSaved 
        ? `/api/wishlist/remove/${service._id}`
        : '/api/wishlist/add';
      
      const method = isSaved ? 'DELETE' : 'POST';
      const body = isSaved ? undefined : JSON.stringify({ serviceId: service._id });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        const action = isSaved ? 'removed from' : 'added to';
        alert(`Property ${action} wishlist successfully!`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if current user owns this listing
  const isOwnListing = user && service && service.owner && user.email === service.owner.email;

  return (
    <div className="listing-card">
      <div className="listing-image-container">
        {service && service.thumbnail ? (
          <img src={service.thumbnail} alt={title} className="listing-image" />
        ) : (
          <div className="no-image">
            <span>📷 No Image</span>
          </div>
        )}
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
          <button className="listing-button tertiary" onClick={handleViewDetails}>
            View Details
          </button>
          <button 
            className="listing-button primary" 
            onClick={handleBook}
            disabled={isOwnListing}
            title={isOwnListing ? "You cannot book your own listing" : "Book this property"}
          >
            {isOwnListing ? 'Your Listing' : 'Book'}
          </button>
          <button 
            className={`listing-button ${isSaved ? 'primary' : 'secondary'}`} 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? '...' : (isSaved ? 'Saved' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
