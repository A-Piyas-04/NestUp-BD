import React, { useState, useEffect } from 'react';
import './Search.css';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import ListingCard from '../../components/ListingCard/ListingCard';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const dummyListings = [
  {
    title: 'Student Studio Apartment',
    district: 'Dhaka',
    area: 'Dhanmondi',
    price: '৳7,500/month',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 7500,
    availableFrom: '2024-01-01',
    availableTo: '2024-06-30'
  },
  {
    title: 'Shared 3BR Apartment',
    district: 'Dhaka',
    area: 'Gulshan',
    price: '৳5,000/month',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 5000,
    availableFrom: '2023-12-15',
    availableTo: '2024-12-15'
  },
  {
    title: 'Cozy 2BHK Near University',
    district: 'Dhaka',
    area: 'Mohammadpur',
    price: '৳8,000/month',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: true,
    priceNumeric: 8000,
    availableFrom: '2024-02-01',
    availableTo: '2025-01-31'
  },
  {
    title: 'Single Room in Shared Flat',
    district: 'Dhaka',
    area: 'Banani',
    price: '৳4,500/month',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 4500,
    availableFrom: '2024-03-01',
    availableTo: '2025-02-28'
  },
  {
    title: 'Budget Student Housing',
    district: 'Dhaka',
    area: 'Mirpur',
    price: '৳3,500/month',
    image: 'https://images.unsplash.com/photo-1595877244574-e90ce41ce089?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZG9ybXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: false,
    priceNumeric: 3500,
    availableFrom: '2024-01-15',
    availableTo: '2024-07-15'
  },
  {
    title: 'Family Apartment',
    district: 'Narayanganj',
    area: 'Rupganj',
    price: '৳10,000/month',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGx1eHVyeSUyMGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 10000,
    availableFrom: '2024-04-01',
    availableTo: '2025-03-31'
  },
  {
    title: 'Traditional Home with Garden',
    district: 'Rajshahi',
    area: 'Boalia',
    price: '৳6,500/month',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 6500,
    availableFrom: '2024-05-01',
    availableTo: '2025-04-30'
  },
  {
    title: 'Beachfront Student Hostel',
    district: 'Cox\'s Bazar',
    area: 'Kolatoli',
    price: '৳6,000/month',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2glMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 6000,
    availableFrom: '2024-06-01',
    availableTo: '2025-05-31'
  },
  {
    title: 'Mountain View Dormitory',
    district: 'Sylhet',
    area: 'Jaflong',
    price: '৳4,000/month',
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FiaW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: true,
    priceNumeric: 4000,
    availableFrom: '2024-02-15',
    availableTo: '2024-08-14'
  },
  {
    title: 'Modern Student Apartment',
    district: 'Gazipur',
    area: 'Tongi',
    price: '৳5,500/month',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dG93bmhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 5500,
    availableFrom: '2024-03-01',
    availableTo: '2025-02-28'
  },
  {
    title: 'Lakeside Student Housing',
    district: 'Khulna',
    area: 'Rupsha',
    price: '৳4,200/month',
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YnVuZ2Fsb3d8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: true,
    priceNumeric: 4200,
    availableFrom: '2024-04-15',
    availableTo: '2024-10-14'
  },
  {
    title: 'Heritage Home',
    district: 'Barisal',
    area: 'Sadar',
    price: '৳5,800/month',
    image: 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8b2xkJTIwaG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 5800,
    availableFrom: '2024-05-01',
    availableTo: '2025-04-30'
  },
  {
    title: 'Eco-Friendly Shared House',
    district: 'Rangpur',
    area: 'Pirganj',
    price: '৳3,800/month',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGlueSUyMGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: true,
    priceNumeric: 3800,
    availableFrom: '2024-03-15',
    availableTo: '2024-09-14'
  },
  {
    title: 'Student Flat with Study Room',
    district: 'Dhaka',
    area: 'Uttara',
    price: '৳6,000/month',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVudGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 6000,
    availableFrom: '2024-02-01',
    availableTo: '2025-01-31'
  },
  {
    title: 'Farmhouse Student Dormitory',
    district: 'Mymensingh',
    area: 'Fulbaria',
    price: '৳4,800/month',
    image: 'https://images.unsplash.com/photo-1593604572577-1c6c44fa2804?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFybWhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 4800,
    availableFrom: '2024-01-15',
    availableTo: '2024-07-14'
  },
];

const Search = () => {
  const [activeFilters, setActiveFilters] = useState({
    district: '',
    area: '',
    minPrice: '',
    maxPrice: '',
    verifiedHosts: false,
    hygieneBadge: false,
    availableFrom: '',
    availableTo: ''
  });

  const [filteredListings, setFilteredListings] = useState(dummyListings);
  const [totalListings, setTotalListings] = useState(dummyListings.length);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (filters) => {
    setIsLoading(true);
    setActiveFilters(filters);
    
    // Simulate API delay
    setTimeout(() => {
      // Apply filters to listings
      const filtered = dummyListings.filter(listing => {
        // District filter
        if (filters.district && listing.district !== filters.district) {
          return false;
        }
        
        // Area filter (case insensitive partial match)
        if (filters.area && !listing.area.toLowerCase().includes(filters.area.toLowerCase())) {
          return false;
        }
        
        // Price range filter
        if (filters.minPrice && listing.priceNumeric < parseInt(filters.minPrice)) {
          return false;
        }
        if (filters.maxPrice && listing.priceNumeric > parseInt(filters.maxPrice)) {
          return false;
        }
        
        // Date range filter
        if (filters.availableFrom || filters.availableTo) {
          // If either date filter is applied
          const filterFromDate = filters.availableFrom ? new Date(filters.availableFrom) : null;
          const filterToDate = filters.availableTo ? new Date(filters.availableTo) : null;
          const listingFromDate = new Date(listing.availableFrom);
          const listingToDate = new Date(listing.availableTo);
          
          // Logic: Show the listing if there's any overlap between the filter date range and the listing date range
          
          // Case 1: Filter start date is after listing end date - no overlap
          if (filterFromDate && filterFromDate > listingToDate) {
            return false;
          }
          
          // Case 2: Filter end date is before listing start date - no overlap
          if (filterToDate && filterToDate < listingFromDate) {
            return false;
          }
          
          // All other cases have some overlap, so we keep the listing
        }
        
        // Verified hosts filter
        if (filters.verifiedHosts && !listing.verifiedHost) {
          return false;
        }
        
        // Hygiene badge filter
        if (filters.hygieneBadge && !listing.hygieneBadge) {
          return false;
        }
        
        return true;
      });
      
      setFilteredListings(filtered);
      setTotalListings(filtered.length);
      setIsLoading(false);
    }, 500);
  };

  // Initial load effect
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div>
      <Header />

      <div className="search-page">
        <div className="search-header">
          <div className="container">
            <h1>Find Your Ideal Property</h1>
            <p className="search-subtitle">
              {isLoading ? 'Searching...' : 
                `${totalListings} ${totalListings === 1 ? 'property' : 'properties'} available`}
            </p>
          </div>
        </div>
        
        <div className="search-page-container">
          <div className="search-filter-sidebar">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </div>
          
          <div className="search-results-container">
            {isLoading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Finding the best properties for you...</p>
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="search-results-grid">
                {filteredListings.map((listing, index) => (
                  <ListingCard
                    key={index}
                    title={listing.title}
                    location={`${listing.area}, ${listing.district}`}
                    price={listing.price}
                    image={listing.image}
                    availableFrom={listing.availableFrom}
                    availableTo={listing.availableTo}
                    verifiedHost={listing.verifiedHost}
                    hygieneBadge={listing.hygieneBadge}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>No properties match your criteria</h3>
                <p>Try adjusting your filters or explore our featured properties</p>
                <button className="reset-filters-btn" onClick={() => handleFilterChange({
                  district: '',
                  area: '',
                  minPrice: '',
                  maxPrice: '',
                  verifiedHosts: false,
                  hygieneBadge: false,
                  availableFrom: '',
                  availableTo: ''
                })}>
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
