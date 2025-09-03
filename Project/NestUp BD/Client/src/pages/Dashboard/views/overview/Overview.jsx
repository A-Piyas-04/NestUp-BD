import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import StatsCards from '../../components/StatsCards';
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

        

      </div>
    </div>
  );
};

export default Overview;