import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import temporaryHousingImage from '../../assets/images/temporary-housing-apts.jpg';

const HeroSection = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchService, setSearchService] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const dateToUse = searchDate || new Date().toISOString().split('T')[0];
    const queryParams = new URLSearchParams({
      location: searchLocation,
      service: searchService,
      dateFrom: dateToUse
    });
    navigate(`/search?${queryParams.toString()}`);
  };

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

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-inputs">
              <div className="input-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  placeholder="Enter city or area"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="service">Service Type</label>
                <select
                  id="service"
                  value={searchService}
                  onChange={(e) => {
                    if (e.target.value !== 'transport' && e.target.value !== 'food') {
                      setSearchService(e.target.value);
                    }
                  }}
                >
                  <option value="">Select service</option>
                  <option value="housing">Housing</option>
                  <option value="transport" disabled style={{color: '#9ca3af'}}>Transport (Coming Soon)</option>
                  <option value="food" disabled style={{color: '#9ca3af'}}>Food Services (Coming Soon)</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="date">Move-in Date</label>
                <input
                  type="date"
                  id="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <button type="submit" className="search-button">
              <span className="search-icon"></span>
              Find Now
            </button>
          </form>
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