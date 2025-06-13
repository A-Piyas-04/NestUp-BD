import { useState, useEffect } from 'react';
import './Header.css';
import logo from '../../assets/logo.svg';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <a href="/">
            <img src={logo} alt="NestUp BD Logo" />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul>
            <li><a href="/browse">Browse Services</a></li>
          </ul>
        </nav>

        {/* User Actions */}
        <div className="user-actions">
          <button className="btn-register">Register</button>
          <button className="btn-login">Login</button>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><a href="/browse">Browse Services</a></li>
            <li><a href="/register">Register</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;