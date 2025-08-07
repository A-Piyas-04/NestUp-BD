import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyNests = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view your services');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/my-services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      } else {
        throw new Error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load your services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewNest = () => {
    navigate('/provide-service');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (service) => {
    if (service.availability.isAvailable) {
      return <span className="status-badge active">Active</span>;
    } else {
      return <span className="status-badge pending">Inactive</span>;
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>My Nests</h1>
          <p>Manage your provided accommodation services</p>
        </div>
        <div className="content-section">
          <p>Loading your services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>My Nests</h1>
          <p>Manage your provided accommodation services</p>
        </div>
        <div className="content-section">
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Nests</h1>
        <p>Manage your provided accommodation services</p>
      </div>
      
      <div className="content-section">
        <div className="section-header">
          <h2>Your Active Listings ({services.length})</h2>
          <button className="btn-primary" onClick={handleAddNewNest}>
            Add New Nest
          </button>
        </div>
        
        {services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No listings yet</h3>
            <p>Start by adding your first property listing</p>
            <button className="btn-primary" onClick={handleAddNewNest} style={{ marginTop: '1rem' }}>
              Add Your First Nest
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {services.map((service) => (
              <div key={service._id} className="listing-card">
                <div className="listing-image">
                  {service.photos && service.photos.length > 0 ? (
                    <img src={service.photos[0]} alt={service.title} />
                  ) : (
                    <div style={{ 
                      height: '200px', 
                      backgroundColor: '#f3f4f6', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#9ca3af'
                    }}>
                      📷 No Image
                    </div>
                  )}
                  {getStatusBadge(service)}
                </div>
                <div className="listing-content">
                  <h3>{service.title}</h3>
                  <p className="location">📍 {service.location.area}, {service.location.district}</p>
                  <p className="price">৳{service.price.toLocaleString()}/month</p>
                  <div className="listing-stats">
                    <span>🏠 {service.propertyType}</span>
                    <span>🛏️ {service.propertyDetails.bedrooms} bed</span>
                    <span>🚿 {service.propertyDetails.bathrooms} bath</span>
                  </div>
                  <div className="listing-stats">
                    <span>📅 Available: {formatDate(service.availability.from)} - {formatDate(service.availability.to)}</span>
                  </div>
                  <div className="listing-actions">
                    <button className="btn-secondary">Edit</button>
                    <button className="btn-secondary">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNests;