import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceModal from '../../../../components/ServiceModal/ServiceModal';
import './MyNests.css';

const MyNests = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to delete services');
        return;
      }

      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove the deleted service from the state
        setServices(services.filter(service => service._id !== serviceId));
        alert('Service deleted successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  };

  const handleToggleActive = async (serviceId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/services/${serviceId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the service in the local state
        setServices(services.map(service => 
          service._id === serviceId 
            ? { ...service, availability: { ...service.availability, isAvailable: data.service.isActive } }
            : service
        ));
        alert(data.message);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update service status');
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('An error occurred while updating the service status');
    }
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
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
          <div className="loading">
            Loading your services...
          </div>
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
          <div className="error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-nests-container">
      <div className="page-header">
        <h1>My Nests</h1>
        <p>Manage your property listings and track their performance</p>
      </div>
      
      <div className="content-section">
        <div className="section-header">
          <h2>Your Active Listings ({services.length})</h2>
          <button className="btn-primary" onClick={handleAddNewNest}>
            Add New Nest
          </button>
        </div>
        
        {services.length === 0 ? (
          <div className="empty-state">
            <div className="dashboard-empty-icon">🏠</div>
            <h3>No Properties Listed Yet</h3>
            <p>Start earning by listing your first property on NestUp BD</p>
            <button className="btn-primary" onClick={handleAddNewNest}>
              Add Your First Nest
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {services.map((service) => (
              <div key={service._id} className="listing-card">
                <div className="card-image">
                  <img 
                    src={service.thumbnail || service.images?.[0] || '/placeholder-image.jpg'} 
                    alt={service.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="card-status">
                    <span className={`status-badge ${service.isBooked ? 'booked' : 'available'}`}>
                      {service.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="card-title">{service.title}</h3>
                    <span className={`status-badge ${service.availability?.isAvailable ? 'active' : 'inactive'}`}>
                      {service.availability?.isAvailable ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="card-location">📍 {service.location.area}, {service.location.district}</p>
                  <p className="card-price">৳{service.price.toLocaleString()}</p>
                  <div className="card-stats">
                    <span>🏠 {service.propertyType}</span>
                    <span>🛏️ {service.propertyDetails.bedrooms} bed</span>
                    <span>🚿 {service.propertyDetails.bathrooms} bath</span>
                  </div>
                  <div className="card-stats">
                    <span>📅 Available: {formatDate(service.availability.from)} - {formatDate(service.availability.to)}</span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => handleViewDetails(service)}
                    >
                      View Details
                    </button>
                    <button 
                      className={service.availability?.isAvailable ? "btn-warning" : "btn-success"}
                      onClick={() => handleToggleActive(service._id, service.availability?.isAvailable)}
                    >
                      {service.availability?.isAvailable ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleDeleteService(service._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ServiceModal 
        service={selectedService}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default MyNests;