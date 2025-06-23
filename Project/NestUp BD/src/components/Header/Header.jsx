import { useState, useEffect } from 'react';
import './Header.css';
import logo from '../../assets/logo.svg';
import Navbar from './Navbar';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        {/* 🔷 Logo */}
        <div className="logo">
          <a href="/">
            <img src={logo} alt="NestUp BD Logo" />
          </a>
        </div>

        {/* 🔗 Navbar (desktop + mobile) */}
        <Navbar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
      </div>
    </header>
  );
};

export default Header;
