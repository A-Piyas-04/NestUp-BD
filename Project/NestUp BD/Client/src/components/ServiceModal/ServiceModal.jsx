import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceModal.css';

const ServiceModal = ({ service, isOpen, onClose }) => {
  const navigate = useNavigate();

  // Conditional return after all hooks
  if (!isOpen || !service) {
    console.log('ServiceModal early return:', { isOpen, service: !!service });
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-header">
          <h2>{service.title}</h2>

        </div>

        <div className="modal-body">
          <div className="modal-image-section">
            {service.thumbnail ? (
              <div className="image-gallery">
                <img 
                  src={service.thumbnail} 
                  alt={service.title} 
                  className="main-image"
                />
              </div>
            ) : (
              <div className="no-image-placeholder">
                <div className="placeholder-icon">📷</div>
                <p>No images available</p>
              </div>
            )}
          </div>

          <div className="modal-details">
            <div className="detail-section">
              <h3>Property Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Property Type:</span>
                  <span className="detail-value">{service.propertyType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">📍 {service.location?.area}, {service.location?.district}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{service.location?.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Bedrooms:</span>
                  <span className="detail-value">🛏️ {service.propertyDetails?.bedrooms}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Bathrooms:</span>
                  <span className="detail-value">🚿 {service.propertyDetails?.bathrooms}</span>
                </div>
                {service.propertyDetails?.squareFeet && (
                  <div className="detail-item">
                    <span className="detail-label">Square Feet:</span>
                    <span className="detail-value">{service.propertyDetails.squareFeet} sq ft</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Furnishing:</span>
                  <span className="detail-value">{service.propertyDetails?.furnishing}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Availability & Pricing</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Available From:</span>
                  <span className="detail-value">📅 {formatDate(service.availability?.from)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Available To:</span>
                  <span className="detail-value">📅 {formatDate(service.availability?.to)}</span>
                </div>
                <div className="detail-item price-item">
                  <span className="detail-label">Rent:</span>
                  <span className="detail-value price">৳{service.price?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {service.amenities && (
              <div className="detail-section">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {service.amenities.wifi && <span className="amenity">📶 WiFi</span>}
                  {service.amenities.ac && <span className="amenity">❄️ Air Conditioning</span>}
                  {service.amenities.parking && <span className="amenity">🚗 Parking</span>}
                  {service.amenities.kitchen && <span className="amenity">🍳 Kitchen</span>}
                  {service.amenities.laundry && <span className="amenity">👕 Laundry</span>}
                  {service.amenities.studyArea && <span className="amenity">📚 Study Area</span>}
                  {service.amenities.securityGuard && <span className="amenity">🛡️ Security Guard</span>}
                  {service.amenities.cctv && <span className="amenity">📹 CCTV</span>}
                </div>
              </div>
            )}

            {service.description && (
              <div className="detail-section">
                <h3>Description</h3>
                <p className="description">{service.description}</p>
              </div>
            )}

            {service.contact && (
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-label">Contact Person:</span>
                    <span className="contact-value">{service.contact.name}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-label">Phone:</span>
                    <span className="contact-value">{service.contact.phone}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-label">Email:</span>
                    <span className="contact-value">{service.contact.email}</span>
                  </div>
                  {service.contact.whatsapp && (
                    <div className="contact-item">
                      <span className="contact-label">WhatsApp:</span>
                      <span className="contact-value">{service.contact.whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Host Information Section */}
            <div className="detail-section host-section">
              <h3>About the Host</h3>
              <p>View the host's profile to see their ratings and reviews from previous guests.</p>
              <button 
                className="btn-secondary view-host-btn" 
                onClick={() => {
                  const hostId = service?.owner?._id || service?.owner;
                  if (hostId) {
                    navigate(`/host-profile/${hostId}`);
                  }
                }}
              >
                View Host Profile & Reviews
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary">
            Contact Host
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;