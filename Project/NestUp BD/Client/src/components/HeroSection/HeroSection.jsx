import { useState } from 'react';
import './HeroSection.css';
import temporaryHousingImage from '../../assets/images/temporary-housing-apts.jpg';

const HeroSection = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchService, setSearchService] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would navigate to search results
    console.log('Search params:', { searchLocation, searchService, searchDate });
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1>Find Your Perfect Space in Bangladesh</h1>
          <p className="subheadline">Seamless relocation solutions with verified housing, transport, and essential services—all on one trusted platform.</p>

          <div className="cta-buttons">
            <button className="cta-button primary">Discover Properties</button>
            <button className="cta-button secondary">List Your Property</button>
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
                  onChange={(e) => setSearchService(e.target.value)}
                >
                  <option value="">Select service</option>
                  <option value="housing">Housing</option>
                  <option value="transport">Transport</option>
                  <option value="food">Food Services</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="date">Move-in Date</label>
                <input
                  type="date"
                  id="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
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