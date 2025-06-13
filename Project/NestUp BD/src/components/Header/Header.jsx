import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/logo.svg';
import Button from '../Shared/Button/Button';

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
          <Link to="/">
            <img src={logo} alt="NestUp BD Logo" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="flex space-x-6">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
                }
                end
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/search" 
                className={({ isActive }) => 
                  `transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
                }
              >
                Search Services
              </NavLink>
            </li>
            <li>
              <Button 
                as="link" 
                to="/post-listing" 
                variant="primary" 
                size="md"
              >
                Post Listing
              </Button>
            </li>
          </ul>
        </nav>

        {/* User Actions */}
        <div className="user-actions flex items-center space-x-4">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/login" 
            className={({ isActive }) => 
              `transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
            }
          >
            Login/Register
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul className="flex flex-col space-y-3">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `block py-2 transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
                }
                end
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/search" 
                className={({ isActive }) => 
                  `block py-2 transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search Services
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `block py-2 transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/post-listing" 
                className={({ isActive }) => 
                  `block py-2 transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Post Listing
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/login" 
                className={({ isActive }) => 
                  `block py-2 transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login/Register
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;