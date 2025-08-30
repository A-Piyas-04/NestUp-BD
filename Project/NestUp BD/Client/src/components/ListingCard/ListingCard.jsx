import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
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
  isBooked = false,
  service = null,
  user = null,
  onViewDetails = null,
  showReviews = true,
  reviews = null
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
      // Debug: Log service data before navigation
      console.log('ListingCard handleViewDetails - service:', service);
      console.log('ListingCard handleViewDetails - service._id:', service?._id);
      
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
        price: service?.pricing?.basePrice ? `৳${service.pricing.basePrice.toLocaleString()}` : `৳${priceNumber.toLocaleString()}`,
        duration: `${durationInMonths} months`,
        totalAmount: service?.pricing?.totalAmount ? `৳${service.pricing.totalAmount.toLocaleString()}` : `৳${totalAmount.toLocaleString()}`,
        image: image || service?.images?.[0] || service?.thumbnail,
        availableFrom: formattedAvailableFrom,
        availableTo: formattedAvailableTo,
        startDate: availableFrom,
        endDate: availableTo,
        fees: service?.pricing?.fees || null
      };

      console.log('ListingCard handleViewDetails - propertyDetails:', propertyDetails);
      // Navigate with serviceId in URL for better UX (bookmarkable, refreshable)
      if (service?._id) {
        navigate(`/payment/${service._id}`, { state: { propertyDetails } });
      } else {
        navigate('/payment', { state: { propertyDetails } });
      }
    }
  };

  const handleBook = () => {
    // Debug: Log service data before navigation
    console.log('ListingCard handleBook - service:', service);
    console.log('ListingCard handleBook - service._id:', service?._id);
    
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
      price: service?.pricing?.basePrice ? `৳${service.pricing.basePrice.toLocaleString()}` : `৳${priceNumber.toLocaleString()}`,
      duration: `${durationInDays} days`,
      totalAmount: service?.pricing?.totalAmount ? `৳${service.pricing.totalAmount.toLocaleString()}` : `৳${totalAmount.toLocaleString()}`,
      image: image || service?.images?.[0] || service?.thumbnail,
      availableFrom: formattedAvailableFrom,
      availableTo: formattedAvailableTo,
      startDate: availableFrom,
      endDate: availableTo,
      fees: service?.pricing?.fees || null
    };

    console.log('ListingCard handleBook - propertyDetails:', propertyDetails);
    // Navigate with serviceId in URL for better UX (bookmarkable, refreshable)
    if (service?._id) {
      navigate(`/payment/${service._id}`, { state: { propertyDetails } });
    } else {
      navigate('/payment', { state: { propertyDetails } });
    }
  };

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hostRating, setHostRating] = useState({ averageRating: 0, totalReviews: 0 });


  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  // Check if property is already in wishlist and fetch review data
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !service || !service._id) return;
      
      try {
        const response = await fetch(`/api/wishlist/check/${service._id}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isInWishlist);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    const fetchHostRating = async () => {
      if (!service || !service.owner || !showReviews) return;
      
      try {
        // Fetch host rating from user profile
        const hostId = service.owner._id || service.owner;
        const response = await fetch(`/api/users/${hostId}/rating`);
        if (response.ok) {
          const data = await response.json();
          setHostRating({
            averageRating: data.hostRating?.average || 0,
            totalReviews: data.hostRating?.count || 0
          });
        }
      } catch (error) {
        console.error('Error fetching host rating:', error);
        // Set default values on error
        setHostRating({ averageRating: 0, totalReviews: 0 });
      }
    };

    checkWishlistStatus();
    fetchHostRating();
  }, [user, service, showReviews]);

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
      const url = isSaved 
        ? `/api/wishlist/remove/${service._id}`
        : '/api/wishlist/add';
      
      const method = isSaved ? 'DELETE' : 'POST';
      const body = isSaved ? undefined : JSON.stringify({ serviceId: service._id });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
  
  // Check if service is booked - prioritize API-provided booking status
  const serviceIsBooked = isBooked || 
    (service && service.bookingStatus === 'booked') || 
    (service && service.isBooked) || 
    (service && service.availability === false);

  return (
    <div className="listing-card">
      <div className="listing-image-container">
        {image || (service && (service.images?.[0] || service.thumbnail)) ? (
          <img src={image || service.images?.[0] || service.thumbnail} alt={title} className="listing-image" />
        ) : (
          <div className="no-image">
            <span>📷 No Image</span>
          </div>
        )}
        {verifiedHost && <span className="listing-badge verified-badge">✓ Verified</span>}
        {hygieneBadge && <span className="listing-badge hygiene-badge">✨ Hygiene Certified</span>}
        {serviceIsBooked && <span className="listing-badge booked-badge">🔒 Booked</span>}
        
        {/* Save Button - Top Left */}
        <button 
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          disabled={isLoading}
          title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isLoading ? '⏳' : (isSaved ? '❤️' : '🤍')}
        </button>
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
          <p className="listing-price">
            {service?.pricing?.basePrice ? `৳${service.pricing.basePrice.toLocaleString()}` : price}
          </p>
          <span className="price-period">
            {service?.pricing?.period || 'per month'}
          </span>
        </div>
        
        {showReviews && hostRating.totalReviews > 0 && (
          <div className="listing-host-rating">
            <div className="host-rating">
              <div className="stars">
                {renderStars(hostRating.averageRating)}
              </div>
              <span className="rating-text">
                Host: {hostRating.averageRating.toFixed(1)} ({hostRating.totalReviews} review{hostRating.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        )}
        <div className="listing-actions">
          <button className="listing-button tertiary" onClick={handleViewDetails}>
            View Details
          </button>
          <button 
            className={`listing-button ${serviceIsBooked ? 'disabled booked' : isOwnListing ? 'disabled own-listing' : 'primary'}`}
            onClick={serviceIsBooked ? null : handleBook}
            disabled={isOwnListing || serviceIsBooked}
            title={
              serviceIsBooked ? "This property has been booked by another user" :
              isOwnListing ? "You cannot book your own listing" : 
              "Book this property"
            }
          >
            {serviceIsBooked ? 'Booked' : isOwnListing ? 'Your Listing' : 'Book'}
          </button>
          
          {!isOwnListing && (
            <button 
              className="listing-button secondary" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/host-profile/${service?.owner?._id || service?.owner}`);
              }}
              style={{ marginTop: '8px', fontSize: '0.9em' }}
            >
              View Host Profile
            </button>
          )}

        </div>
      </div>
      

    </div>
  );
};

export default ListingCard;
