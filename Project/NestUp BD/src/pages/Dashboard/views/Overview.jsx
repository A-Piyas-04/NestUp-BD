import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import StatsCards from '../components/StatsCards';
import './Overview.css';

const Overview = () => {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  return (
    <div className="overview-container">
      <div className="welcome-section">
        <h1>Welcome, {userName}!</h1>
        <p className="welcome-subtitle">Manage your property listings and account settings from your personalized dashboard</p>
      </div>
      
      <StatsCards />
      
      <div className="dashboard-grid">
        <div className="dashboard-card recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-empty">
            <p>Your activity will appear here as you use NestUp BD</p>
            <div className="action-buttons">
              <button className="activity-cta primary">List a Property</button>
              <button className="activity-cta secondary">Find Housing</button>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card quick-tips">
          <h2>Getting Started</h2>
          <div className="tips-container">
            <div className="tip-item">
              <div className="tip-icon">📋</div>
              <div className="tip-content">
                <h4>Complete Your Profile</h4>
                <p>Add verification details to increase trust with potential renters or hosts</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">📸</div>
              <div className="tip-content">
                <h4>Add Quality Photos</h4>
                <p>Properties with professional photos receive 2x more inquiries</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">📊</div>
              <div className="tip-content">
                <h4>Track Performance</h4>
                <p>Monitor your listing views and engagement to optimize your property details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
