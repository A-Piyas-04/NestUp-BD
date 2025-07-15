import { useState } from 'react';
import './HeroSection.css';
import temporaryHousingImage from '../../assets/images/temporary-housing-apts.jpg';

// Remove the old illustration import
// import heroIllustration from '../../assets/images/hero-illustration.svg';

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
          <h1>Relocate with Confidence. Anytime. Anywhere.</h1>
          <p className="subheadline">Find housing, transport, and food solutions—all in one place.</p>

          <div className="cta-buttons">
            <button className="cta-button primary">Find a Place</button>
            <button className="cta-button secondary">Offer a Room</button>
          </div>

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-inputs">
              <div className="input-group">
                <label htmlFor="location">Where are you moving to?</label>
                <input
                  type="text"
                  id="location"
                  placeholder="City, Area, or Address"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="service">Service</label>
                <select
                  id="service"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                >
                  <option value="">Select a service</option>
                  <option value="housing">Housing</option>
                  <option value="transport">Transport</option>
                  <option value="food">Food</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="date">Date</label>
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
              Search Now
            </button>
          </form>
        </div>

        <div className="hero-image">
          <img
            src={temporaryHousingImage}
            alt="Temporary housing apartments"
            className="modern-building-image"
          />

        </div>
      </div>
    </section>
  );
};

export default HeroSection;