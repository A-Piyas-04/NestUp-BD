import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import Overview from './views/Overview';
import MyListings from './views/MyListings';
import AddListing from './views/AddListing';
import Settings from './views/Settings';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

import './Dashboard.css';

const Dashboard = () => {
return (
  <>
    <Header />

    <div className="dashboard-layout">
      <DashboardSidebar />

      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="my-listings" element={<MyListings />} />
          <Route path="add-listing" element={<AddListing />} />
        </Routes>
      </div>
    </div>

    <Footer />
  </>
);

};

export default Dashboard;
