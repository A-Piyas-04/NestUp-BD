import React, { useState, useEffect } from 'react';
import './Search.css';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import ListingCard from '../../components/ListingCard/ListingCard';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const dummyListings = [
  {
    title: 'Modern Studio Apartment',
    division: 'Dhaka Division',
    district: 'Dhaka',
    area: 'Dhanmondi',
    price: '৳15,000/month',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 15000
  },
  {
    title: 'Spacious 3BHK Family Home',
    division: 'Dhaka Division',
    district: 'Dhaka',
    area: 'Gulshan',
    price: '৳35,000/month',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 35000
  },
  {
    title: 'Cozy 2BHK Near University',
    division: 'Dhaka Division',
    district: 'Dhaka',
    area: 'Mohammadpur',
    price: '৳18,000/month',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: true,
    priceNumeric: 18000
  },
  {
    title: 'Luxury Apartment with Pool',
    division: 'Dhaka Division',
    district: 'Dhaka',
    area: 'Banani',
    price: '৳45,000/month',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 45000
  },
  {
    title: 'Affordable Student Housing',
    division: 'Dhaka Division',
    district: 'Dhaka',
    area: 'Mirpur',
    price: '৳8,000/month',
    image: 'https://images.unsplash.com/photo-1595877244574-e90ce41ce089?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZG9ybXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: false,
    priceNumeric: 8000
  },
  {
    title: 'Riverside Villa',
    division: 'Dhaka Division',
    district: 'Narayanganj',
    area: 'Rupganj',
    price: '৳60,000/month',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGx1eHVyeSUyMGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 60000
  },
  {
    title: 'Traditional Home with Garden',
    division: 'Rajshahi Division',
    district: 'Rajshahi',
    area: 'Boalia',
    price: '৳22,000/month',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 22000
  },
  {
    title: 'Beachfront Cottage',
    division: 'Chittagong Division',
    district: 'Cox\'s Bazar',
    area: 'Kolatoli',
    price: '৳30,000/month',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2glMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 30000
  },
  {
    title: 'Mountain View Cabin',
    division: 'Sylhet Division',
    district: 'Sylhet',
    area: 'Jaflong',
    price: '৳25,000/month',
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FiaW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: true,
    priceNumeric: 25000
  },
  {
    title: 'Modern Townhouse',
    division: 'Dhaka Division',
    district: 'Gazipur',
    area: 'Tongi',
    price: '৳28,000/month',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dG93bmhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 28000
  },
  {
    title: 'Lakeside Bungalow',
    division: 'Khulna Division',
    district: 'Khulna',
    area: 'Rupsha',
    price: '৳20,000/month',
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YnVuZ2Fsb3d8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: true,
    priceNumeric: 20000
  },
  {
    title: 'Heritage Home',
    division: 'Barisal Division',
    district: 'Barisal',
    area: 'Sadar',
    price: '৳18,500/month',
    image: 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8b2xkJTIwaG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 18500
  },
  {
    title: 'Eco-Friendly Tiny House',
    division: 'Rangpur Division',
    district: 'Rangpur',
    area: 'Pirganj',
    price: '৳12,000/month',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGlueSUyMGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: false,
    hygieneBadge: true,
    priceNumeric: 12000
  },
  {
    title: 'Penthouse with City View',
    division: 'Dhaka Division',
    district: 'Dhaka',
    area: 'Uttara',
    price: '৳50,000/month',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVudGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: true,
    priceNumeric: 50000
  },
  {
    title: 'Farmhouse with Land',
    division: 'Mymensingh Division',
    district: 'Mymensingh',
    area: 'Fulbaria',
    price: '৳32,000/month',
    image: 'https://images.unsplash.com/photo-1593604572577-1c6c44fa2804?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFybWhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    verifiedHost: true,
    hygieneBadge: false,
    priceNumeric: 32000
  },
];

const Search = () => {
  const [activeFilters, setActiveFilters] = useState({
    division: '',
    district: '',
    area: '',
    minPrice: '',
    maxPrice: '',
    verifiedHosts: false,
    hygieneBadge: false
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
        // Division filter
        if (filters.division && listing.division !== filters.division) {
          return false;
        }
        
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
                  division: '',
                  district: '',
                  area: '',
                  minPrice: '',
                  maxPrice: '',
                  verifiedHosts: false,
                  hygieneBadge: false
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
