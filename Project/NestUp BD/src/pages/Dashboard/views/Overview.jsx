import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import './Overview.css';

const Overview = () => {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  return (
    <div className="overview-container">
      <div className="welcome-section">
        <h1>Hello, {userName}!</h1>
        <p className="welcome-subtitle">Welcome to your personal dashboard</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>0</h3>
          <p>Active Listings</p>
        </div>
        <div className="stat-card">
          <h3>0</h3>
          <p>Saved Properties</p>
        </div>
        <div className="stat-card">
          <h3>0</h3>
          <p>Messages</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-empty">
          <p>No recent activity to display</p>
          <button className="activity-cta">Explore Properties</button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
