import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import Overview from './views/Overview';
import MyListings from './views/MyListings';
import AddListing from './views/AddListing';
import Settings from './views/Settings';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

import './Dashboard.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Header />

      <div className="dashboard-layout">
        <DashboardSidebar isOpen={sidebarOpen} />
        
        <button 
          className="sidebar-toggle" 
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? "×" : "≡"}
        </button>

        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/add-listing" element={<AddListing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Dashboard;
