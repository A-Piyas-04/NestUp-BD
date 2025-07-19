import React from 'react';

const MyNests = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Nests</h1>
        <p>Manage your provided accommodation services</p>
      </div>
      
      <div className="content-section">
        <div className="section-header">
          <h2>Your Active Listings</h2>
          <button className="btn-primary">Add New Nest</button>
        </div>
        
        <div className="listings-grid">
          <div className="listing-card">
            <div className="listing-image">
              <img src="/placeholder-house.jpg" alt="Accommodation" />
              <span className="status-badge active">Active</span>
            </div>
            <div className="listing-content">
              <h3>Cozy Studio in Dhanmondi</h3>
              <p className="location">📍 Dhanmondi, Dhaka</p>
              <p className="price">৳8,000/month</p>
              <div className="listing-stats">
                <span>👁️ 24 views</span>
                <span>⭐ 4.5 (12 reviews)</span>
              </div>
              <div className="listing-actions">
                <button className="btn-secondary">Edit</button>
                <button className="btn-secondary">View Details</button>
              </div>
            </div>
          </div>
          
          <div className="listing-card">
            <div className="listing-image">
              <img src="/placeholder-house.jpg" alt="Accommodation" />
              <span className="status-badge active">Active</span>
            </div>
            <div className="listing-content">
              <h3>Student-Friendly Room in Gulshan</h3>
              <p className="location">📍 Gulshan, Dhaka</p>
              <p className="price">৳12,000/month</p>
              <div className="listing-stats">
                <span>👁️ 18 views</span>
                <span>⭐ 4.2 (8 reviews)</span>
              </div>
              <div className="listing-actions">
                <button className="btn-secondary">Edit</button>
                <button className="btn-secondary">View Details</button>
              </div>
            </div>
          </div>
          
          <div className="listing-card">
            <div className="listing-image">
              <img src="/placeholder-house.jpg" alt="Accommodation" />
              <span className="status-badge pending">Pending</span>
            </div>
            <div className="listing-content">
              <h3>Shared Apartment in Banani</h3>
              <p className="location">📍 Banani, Dhaka</p>
              <p className="price">৳6,500/month</p>
              <div className="listing-stats">
                <span>👁️ 5 views</span>
                <span>⭐ New listing</span>
              </div>
              <div className="listing-actions">
                <button className="btn-secondary">Edit</button>
                <button className="btn-secondary">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNests; 