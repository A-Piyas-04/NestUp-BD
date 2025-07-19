import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import Overview from './views/Overview';
import MyNests from './views/MyNests';
import NestReviews from './views/NestReviews';
import BookedNests from './views/BookedNests';
import ProfileInfo from './views/ProfileInfo';
import PaymentHistory from './views/PaymentHistory';

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
            <Route path="/my-nests" element={<MyNests />} />
            <Route path="/nest-reviews" element={<NestReviews />} />
            <Route path="/booked-nests" element={<BookedNests />} />
            <Route path="/profile-info" element={<ProfileInfo />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Dashboard;
