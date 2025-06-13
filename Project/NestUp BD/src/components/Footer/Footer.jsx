import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1: About Us + Social Media */}
        <div className="footer-column">
          <h3>About Us</h3>
          <p>NestUp BD helps you relocate with confidence by providing housing, transport, and food solutions all in one place.</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="social-icon facebook"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="social-icon twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="social-icon instagram"></i>
            </a>
          </div>
        </div>

        {/* Column 2: Contact Info */}
        <div className="footer-column">
          <h3>Contact Us</h3>
          <p>Email: support@nestupbd.com</p>
          <p>Phone: +880 1234-567890</p>
          <p>Address: Dhaka, Bangladesh</p>
        </div>

        {/* Column 3: Terms & Policies */}
        <div className="footer-column">
          <h3>Legal</h3>
          <ul>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-conditions">Terms & Conditions</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} NestUp BD. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;