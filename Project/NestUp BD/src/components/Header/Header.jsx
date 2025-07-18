import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../Shared/Button/Button';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleScroll = () => {
    if (window.scrollY > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLoginClick = () => {
    console.log('Login button clicked');
    navigate('/login');
  };

  const handleRegisterClick = () => {
    console.log('Register button clicked');
    navigate('/register');
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
            <span>NestUp BD</span>
          </Link>
        </div>

        <nav className="desktop-nav">
          <ul>
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/search">Properties</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>
        </nav>

        <div className="user-actions">
          <Button
            as="link"
            to="/provide-service"
            variant="primary"
            size="md"
            style={{ marginRight: '1rem' }}
          >
            List Property
          </Button>
          {user ? (
            <>
              <Button 
                as="link" 
                to="/dashboard" 
                variant="outline"
                size="md"
              >
                Dashboard
              </Button>
              <Button 
                onClick={handleLogout}
                variant="primary"
                size="md"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                as="link" 
                to="/login" 
                variant="outline"
                size="md"
              >
                Login
              </Button>
              <Button 
                as="link" 
                to="/register" 
                variant="primary"
                size="md"
              >
                Register
              </Button>
            </>
          )}
        </div>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></div>
        </button>

        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}> 
          <ul>
            <li><NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/search" onClick={() => setIsMobileMenuOpen(false)}>Properties</NavLink></li>
            <li><NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</NavLink></li>
            <li><NavLink to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</NavLink></li>
            <li><NavLink to="/provide-service" onClick={() => setIsMobileMenuOpen(false)}>List Property</NavLink></li>
            {user ? (
              <>
                <li><NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink></li>
                <li><a href="#" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</a></li>
              </>
            ) : (
              <>
                <li><NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink></li>
                <li><NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)}>Register</NavLink></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
