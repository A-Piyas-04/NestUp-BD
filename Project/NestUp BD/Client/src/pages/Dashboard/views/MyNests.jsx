import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceModal from '../../../components/ServiceModal/ServiceModal';

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
            ? { ...service, isActive: data.service.isActive }
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
                  {service.thumbnail ? (
                    <img src={service.thumbnail} alt={service.title} />
                  ) : (
                    <div style={{ 
                      height: '200px', 
                      backgroundColor: '#f0f0f0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#666'
                    }}>
                      📷 No Image
                    </div>
                  )}
                  {getStatusBadge(service)}
                </div>
                <div className="listing-content">
                  <div className="listing-header">
                    <h3>{service.title}</h3>
                    <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="location">📍 {service.location.area}, {service.location.district}</p>
                  <p className="price">৳{service.price.toLocaleString()}</p>
                  <div className="listing-stats">
                    <span>🏠 {service.propertyType}</span>
                    <span>🛏️ {service.propertyDetails.bedrooms} bed</span>
                    <span>🚿 {service.propertyDetails.bathrooms} bath</span>
                  </div>
                  <div className="listing-stats">
                    <span>📅 Available: {formatDate(service.availability.from)} - {formatDate(service.availability.to)}</span>
                  </div>
                  <div className="listing-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => handleViewDetails(service)}
                    >
                      View Details
                    </button>
                    <button 
                      className={service.isActive ? "btn-warning" : "btn-success"}
                      onClick={() => handleToggleActive(service._id, service.isActive)}
                    >
                      {service.isActive ? 'Deactivate' : 'Activate'}
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