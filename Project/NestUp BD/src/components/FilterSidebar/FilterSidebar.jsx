import React, { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    district: '',
    area: '',
    minPrice: '',
    maxPrice: '',
    verifiedHosts: false,
    hygieneBadge: false,
    availableFrom: '',
    availableTo: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      district: '',
      area: '',
      minPrice: '',
      maxPrice: '',
      verifiedHosts: false,
      hygieneBadge: false,
      availableFrom: '',
      availableTo: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>Refine Search</h3>
        <button className="reset-button" onClick={handleReset}>Reset</button>
      </div>

      <div className="filter-section">
        <h4>Location</h4>
        <label>
          District
          <select name="district" value={filters.district} onChange={handleChange}>
            <option value="">All Districts</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Gazipur">Gazipur</option>
            <option value="Narayanganj">Narayanganj</option>
            <option value="Chittagong">Chittagong</option>
            <option value="Cox's Bazar">Cox's Bazar</option>
            <option value="Rajshahi">Rajshahi</option>
            <option value="Khulna">Khulna</option>
            <option value="Barisal">Barisal</option>
            <option value="Sylhet">Sylhet</option>
            <option value="Rangpur">Rangpur</option>
            <option value="Mymensingh">Mymensingh</option>
          </select>
        </label>

        <label>
          Area
          <input 
            type="text" 
            name="area" 
            value={filters.area} 
            onChange={handleChange} 
            placeholder="Enter neighborhood or area" 
          />
        </label>
      </div>

      <div className="filter-section">
        <h4>Price Range (৳)</h4>
        <div className="price-inputs">
          <input 
            type="number" 
            name="minPrice" 
            value={filters.minPrice} 
            onChange={handleChange} 
            placeholder="Min" 
          />
          <span className="price-separator">to</span>
          <input 
            type="number" 
            name="maxPrice" 
            value={filters.maxPrice} 
            onChange={handleChange} 
            placeholder="Max" 
          />
        </div>
      </div>

      <div className="filter-section">
        <h4>Availability Period</h4>
        <label>
          Available From
          <input 
            type="date" 
            name="availableFrom" 
            value={filters.availableFrom} 
            onChange={handleChange} 
          />
        </label>

        <label>
          Available To
          <input 
            type="date" 
            name="availableTo" 
            value={filters.availableTo} 
            onChange={handleChange} 
          />
        </label>
      </div>

      <div className="filter-section">
        <h4>Property Features</h4>
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="verifiedHosts" 
            checked={filters.verifiedHosts} 
            onChange={handleChange} 
          />
          <span>Verified Hosts Only</span>
        </label>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="hygieneBadge" 
            checked={filters.hygieneBadge} 
            onChange={handleChange} 
          />
          <span>Hygiene Certified</span>
        </label>
      </div>

      <button className="apply-button" onClick={handleApply}>Apply Filters</button>
    </div>
  );
};

export default FilterSidebar;
