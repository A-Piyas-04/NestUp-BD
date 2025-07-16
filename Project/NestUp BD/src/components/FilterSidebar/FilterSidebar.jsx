import React, { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    division: '',
    district: '',
    area: '',
    minPrice: '',
    maxPrice: '',
    verifiedHosts: false,
    hygieneBadge: false
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
      division: '',
      district: '',
      area: '',
      minPrice: '',
      maxPrice: '',
      verifiedHosts: false,
      hygieneBadge: false
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
          Division
          <select name="division" value={filters.division} onChange={handleChange}>
            <option value="">All Divisions</option>
            <option value="Dhaka Division">Dhaka Division</option>
            <option value="Chittagong Division">Chittagong Division</option>
            <option value="Rajshahi Division">Rajshahi Division</option>
            <option value="Khulna Division">Khulna Division</option>
            <option value="Barisal Division">Barisal Division</option>
            <option value="Sylhet Division">Sylhet Division</option>
            <option value="Rangpur Division">Rangpur Division</option>
            <option value="Mymensingh Division">Mymensingh Division</option>
          </select>
        </label>

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
