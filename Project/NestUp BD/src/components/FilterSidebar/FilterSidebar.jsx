import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = () => {
  return (
    <div className="filter-sidebar">
      {/* <h3>Filter Services</h3>
      <label>
        Service Type:
        <select>
          <option>All</option>
          <option>Housing</option>
          <option>Transport</option>
          <option>Food</option>
        </select>
      </label> */}

 <label>
        Division:
        <select>
          <option value="">All Divisions</option>
          <option value="Dhaka">Dhaka Division</option>
          <option value="Chittagong">Chittagong Division</option>
          <option value="Rajshahi">Rajshahi Division</option>
          <option value="Khulna">Khulna Division</option>
          <option value="Barisal">Barisal Division</option>
          <option value="Sylhet">Sylhet Division</option>
          <option value="Rangpur">Rangpur Division</option>
          <option value="Mymensingh">Mymensingh Division</option>
        </select>
      </label>

      <label>
        District:
        <select>
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
          {/* Add more districts as needed */}
        </select>
      </label>

      <label>
        Search Area:
        <input type="text" placeholder="Enter local area..." />
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
