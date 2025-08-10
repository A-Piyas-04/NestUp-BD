import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';
import Overview from './views/Overview';
import MyNests from './views/MyNests';
import NestReviews from './views/NestReviews';
import BookedNests from './views/BookedNests';
import Wishlist from './views/Wishlist';
import ProfileInfo from './views/ProfileInfo';
import PaymentHistory from './views/PaymentHistory';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

import './Dashboard.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}><Overview /></motion.div>} />
              <Route path="/my-nests" element={<motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}><MyNests /></motion.div>} />
              <Route path="/nest-reviews" element={<motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}><NestReviews /></motion.div>} />
              <Route path="/booked-nests" element={<motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}><BookedNests /></motion.div>} />
              <Route path="/wishlist" element={<motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}><Wishlist /></motion.div>} />
              <Route path="/profile-info" element={<motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}><ProfileInfo /></motion.div>} />
              <Route path="/payment-history" element={<motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}><PaymentHistory /></motion.div>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Dashboard;
