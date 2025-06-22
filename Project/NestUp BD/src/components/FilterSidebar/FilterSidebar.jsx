import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = () => {
  return (
    <div className="filter-sidebar">
      <h3>Filter Services</h3>
      <label>
        Service Type:
        <select>
          <option>All</option>
          <option>Housing</option>
          <option>Transport</option>
          <option>Food</option>
        </select>
      </label>

      <label>
        Location:
        <input type="text" placeholder="Enter area..." />
      </label>

      <label>
        Price Range:
        <input type="number" placeholder="Min" />
        <input type="number" placeholder="Max" />
      </label>

      <label>
        <input type="checkbox" />
        Verified Hosts
      </label>

      <label>
        <input type="checkbox" />
        Hygiene Badge
      </label>

      <button className="apply-button">Apply Filter</button>
    </div>
  );
};

export default FilterSidebar;
