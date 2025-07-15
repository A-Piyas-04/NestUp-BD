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

  return (
    <div className="filter-sidebar">
      <label>
        Division:
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
        District:
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
        Search Area:
        <input 
          type="text" 
          name="area" 
          value={filters.area} 
          onChange={handleChange} 
          placeholder="Enter local area..." 
        />
      </label>

      <label>
        Price Range:
        <input 
          type="number" 
          name="minPrice" 
          value={filters.minPrice} 
          onChange={handleChange} 
          placeholder="Min" 
        />
        <input 
          type="number" 
          name="maxPrice" 
          value={filters.maxPrice} 
          onChange={handleChange} 
          placeholder="Max" 
        />
      </label>

      <label>
        <input 
          type="checkbox" 
          name="verifiedHosts" 
          checked={filters.verifiedHosts} 
          onChange={handleChange} 
        />
        Verified Hosts
      </label>

      <label>
        <input 
          type="checkbox" 
          name="hygieneBadge" 
          checked={filters.hygieneBadge} 
          onChange={handleChange} 
        />
        Hygiene Badge
      </label>

      <button className="apply-button" onClick={handleApply}>Apply Filter</button>
    </div>
  );
};

export default FilterSidebar;
