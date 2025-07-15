import { NavLink, useNavigate } from 'react-router-dom';
import Button from '../Shared/Button/Button';
import { useEffect, useState } from 'react';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/search', label: 'Search Services' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/post-listing', label: 'Post Listing' }
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
          {navLinks.slice(0, 2).map(link => renderLink(link))}
          <li>
            <Button as="link" to="/post-listing" variant="primary" size="md">
              Post Listing
            </Button>
          </li>
        </ul>
      </nav>

      {/* User Actions */}
      <div className="user-actions flex items-center space-x-4">
        {renderLink(navLinks[2])}
        {isAuthenticated ? (
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
          >
            Logout
          </Button>

        ) : (
          <Button as="link" to="/login" variant="outline" size="md">
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
