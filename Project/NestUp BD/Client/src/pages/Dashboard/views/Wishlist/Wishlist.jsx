import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import ListingCard from '../../../../components/ListingCard/ListingCard';
import ServiceModal from '../../../../components/ServiceModal/ServiceModal';
import './Wishlist.css';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view your wishlist');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/wishlist/remove/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove from local state
        setWishlist(prev => prev.filter(item => item._id !== serviceId));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const handleViewServiceDetails = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="dashboard-page-header">
          <h1>My Wishlist</h1>
          <p>Your saved properties</p>
        </div>
        <div className="loading-state">
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-container">
        <div className="page-header">
          <h1>My Wishlist</h1>
          <p>Your saved properties</p>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchWishlist} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="page-header">
        <h1>My Wishlist</h1>
        <p>Your saved properties ({wishlist.length} items)</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Start exploring properties and save your favorites here!</p>
          <a href="/search" className="btn-primary">
            Browse Properties
          </a>
        </div>
      ) : (
        <div className="content-section">
          <div className="wishlist-grid">
            {wishlist.map((service) => (
              <div key={service._id} className="wishlist-item">
                <ListingCard
                  title={service.title}
                  location={`${service.location.area}, ${service.location.district}`}
                  price={`৳${service.price.toLocaleString()}`}
                  image={service.thumbnail}
                  availableFrom={service.availability.from}
                  availableTo={service.availability.to}

                  service={service}
                  user={user}
                  onViewDetails={handleViewServiceDetails}
                />
                <div className="wishlist-actions">
                  <button 
                    onClick={() => handleRemoveFromWishlist(service._id)}
                    className="remove-btn"
                    title="Remove from wishlist"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <ServiceModal 
        service={selectedService}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reviews={selectedService?.reviews || null}
      />
    </div>
  );
};

export default Wishlist;