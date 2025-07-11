import React from 'react';
import { NavLink } from 'react-router-dom';
import './Dashboard.css';

const DashboardSidebar = () => {
  return (
    <aside className="dashboard-sidebar">
      <h2 className="sidebar-title">Dashboard</h2>
      <ul className="sidebar-menu">
        <li><NavLink to="/dashboard" end>Overview</NavLink></li>
        <li><NavLink to="/dashboard/my-listings">My Listings</NavLink></li>
        <li><NavLink to="/dashboard/add-listing">Add Listing</NavLink></li>
        <li><NavLink to="/dashboard/settings">Settings</NavLink></li>
      </ul>
    </aside>
  );
};

export default DashboardSidebar;
