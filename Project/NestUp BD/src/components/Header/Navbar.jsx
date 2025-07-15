import { NavLink, useNavigate } from 'react-router-dom';
import Button from '../Shared/Button/Button';
import { useEffect, useState } from 'react';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/search', label: 'Search Services' },
  { to: '/dashboard', label: 'Dashboard' }
];

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check token on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const renderLink = ({ to, label, end }, isMobile = false) => (
    <li key={to}>
      <NavLink
        to={to}
        end={end}
        onClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}
        className={({ isActive }) =>
          `${isMobile ? 'block py-2' : ''} transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-gray-700'
          }`
        }
      >
        {label}
      </NavLink>
    </li>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="desktop-nav">
        <ul className="flex space-x-6">
          <li>
            <Button as="link" to="/" variant="primary" size="md">
              Home
            </Button>
          </li>
          <li>
            <Button as="link" to="/search" variant="primary" size="md">
              Search Services
            </Button>
          </li>
          <li>
            <Button variant="primary" size="md">
              Post Service
            </Button>
          </li>
        </ul>

      </nav>

      {/* User Actions */}
      <div className="user-actions flex items-center space-x-4">
        <Button
          as="link"
          to="/dashboard"
          variant="profileButtons"
          size="md"
          className="w-full justify-start"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Dashboard
        </Button>

        {isAuthenticated ? (
          <Button
            variant="danger"
            size="md"
            className="w-full justify-start"
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
          >
            Logout
          </Button>
        ) : (
          <Button as="link" to="/login" variant="success" size="md">
            Login/Register
          </Button>
        )}
      </div>

      {/* Mobile Toggle */}
      <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
      </button>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="flex flex-col space-y-3">
          {navLinks.map(link => renderLink(link, true))}
          <li>
            {/* New: Post Service button (no functionality) for mobile */}
            <Button
              variant="primary"
              size="md"
              className="w-full justify-start"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Post Service
            </Button>
          </li>
          <li>
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="md"
                className="w-full justify-start"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                as="link"
                to="/login"
                variant="outline"
                size="md"
                className="w-full justify-start"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login/Register
              </Button>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
