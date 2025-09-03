import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import temporaryHousingImage from '../../assets/images/temporary-housing-apts.jpg';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleDiscoverProperties = () => {
    navigate('/search');
  };

  const handleListProperty = () => {
    navigate('/provide-service');
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1>Find Your Perfect Space in Bangladesh</h1>
          <p className="subheadline">Seamless relocation solutions with verified housing, transport, and essential services—all on one trusted platform.</p>

          <div className="cta-buttons">
            <button className="cta-button primary" onClick={handleDiscoverProperties}>Discover Properties</button>
            <button className="cta-button secondary" onClick={handleListProperty}>List Your Property</button>
          </div>
        </div>

        <div className="hero-image">
          <img
            src={temporaryHousingImage}
            alt="Modern housing in Bangladesh"
            className="modern-building-image"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;