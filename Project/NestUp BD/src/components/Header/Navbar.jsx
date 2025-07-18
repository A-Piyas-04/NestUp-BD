import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Button from '../Shared/Button/Button';
import { useEffect, useState } from 'react';

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLoginRegister = () => {
    // If on login page, navigate to register and vice versa
    if (location.pathname === '/login') {
      navigate('/register');
    } else {
      navigate('/login');
    }
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // Define navLinks based on authentication status
  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/search', label: 'Search Services' },
    { to: '/provide-service', label: 'List Property' },
    // Only show Dashboard link if authenticated
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : [])
  ];

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
            <Button as="link" to="/provide-service" variant="primary" size="md">
              List Property
            </Button>
          </li>
        </ul>

      </nav>

      {/* User Actions */}
      <div className="user-actions flex items-center space-x-4">
        {/* Only show Dashboard button if authenticated */}
        {isAuthenticated && (
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
        )}

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
          <>
            <Button as="link" to="/login" variant="success" size="md">
              Login
            </Button>
            <Button as="link" to="/register" variant="outline" size="md">
              Register
            </Button>
          </>
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
              <>
                <Button
                  as="link"
                  to="/login"
                  variant="outline"
                  size="md"
                  className="w-full justify-start mb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Button>
                <Button
                  as="link"
                  to="/register"
                  variant="outline"
                  size="md"
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Button>
              </>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;