import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1: About Us + Social Media */}
        <div className="footer-column">
          <h3>About NestUp BD</h3>
          <p>Bangladesh's premier platform for connecting property seekers with verified accommodations and essential relocation services.</p>
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
          <h3>Contact Information</h3>
          <p>Email: info@nestupbd.com</p>
          <p>Support: +880 1700-123456</p>
          <p>Office: Gulshan Avenue, Dhaka 1212</p>
        </div>

        {/* Column 3: Quick Links */}
        <div className="footer-column">
          <h3>Resources</h3>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/blog">Relocation Guide</a></li>
            <li><a href="/careers">Join Our Team</a></li>
          </ul>
        </div>
        
        {/* Column 4: Legal */}
        <div className="footer-column">
          <h3>Legal</h3>
          <ul>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-conditions">Terms of Service</a></li>
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