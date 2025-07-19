import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardSidebar = ({ isOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/dashboard/my-nests',
      label: 'My Nests',
      icon: '🏠'
    },
    {
      path: '/dashboard/nest-reviews',
      label: 'Nest Reviews',
      icon: '⭐'
    },
    {
      path: '/dashboard/booked-nests',
      label: 'Booked Nests',
      icon: '📅'
    },
    {
      path: '/dashboard/profile-info',
      label: 'Profile Info',
      icon: '👤'
    },
    {
      path: '/dashboard/payment-history',
      label: 'Payment History',
      icon: '💰'
    }
  ];

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-title">
        <span className="sidebar-title-icon">📋</span>
        Dashboard
      </div>
      
      <nav>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span className="menu-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-profile">
        <div className="profile-info">
          <div className="profile-avatar">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <p className="profile-name">{user?.name || 'User'}</p>
            <p className="profile-email">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
