import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Search.css';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import ListingCard from '../../components/ListingCard/ListingCard';
import ServiceModal from '../../components/ServiceModal/ServiceModal';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

// Services will be fetched from API

const Search = () => {
  const { user } = useAuth();
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

  const [filteredListings, setFilteredListings] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServices = async (filters = {}) => {
    setIsLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.district) queryParams.append('district', filters.district);
      if (filters.area) queryParams.append('area', filters.area);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      
      const response = await fetch(`/api/services?${queryParams.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform backend data to match frontend expectations
        const transformedServices = data.services.map(service => ({
          id: service._id,
          title: service.title,
          district: service.location.district,
          area: service.location.area,
          price: `৳${service.price.toLocaleString()}`,
          image: service.thumbnail || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
          verifiedHost: service.isVerified || false,
          hygieneBadge: service.amenities?.wifi || false, // Using wifi as hygiene indicator for now
          priceNumeric: service.price,
          availableFrom: service.availability.from,
          availableTo: service.availability.to,
          propertyType: service.propertyType,
          bedrooms: service.propertyDetails?.bedrooms,
          bathrooms: service.propertyDetails?.bathrooms,
          owner: service.owner,
          // Keep the original service data for modal
          originalService: service
        }));
        
        // Apply client-side filters for date range and other filters not handled by backend
        let filtered = transformedServices;
        
        // Date range filter
        if (filters.availableFrom || filters.availableTo) {
          filtered = filtered.filter(listing => {
            const filterFromDate = filters.availableFrom ? new Date(filters.availableFrom) : null;
            const filterToDate = filters.availableTo ? new Date(filters.availableTo) : null;
            const listingFromDate = new Date(listing.availableFrom);
            const listingToDate = new Date(listing.availableTo);
            
            // Check for overlap
            if (filterFromDate && filterFromDate > listingToDate) {
              return false;
            }
            if (filterToDate && filterToDate < listingFromDate) {
              return false;
            }
            return true;
          });
        }
        
        // Verified hosts filter
        if (filters.verifiedHosts) {
          filtered = filtered.filter(listing => listing.verifiedHost);
        }
        
        // Hygiene badge filter
        if (filters.hygieneBadge) {
          filtered = filtered.filter(listing => listing.hygieneBadge);
        }
        
        setFilteredListings(filtered);
        setTotalListings(filtered.length);
      } else {
        console.error('Failed to fetch services');
        setFilteredListings([]);
        setTotalListings(0);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setFilteredListings([]);
      setTotalListings(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    fetchServices(filters);
  };

  const handleViewServiceDetails = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  // Initial load effect
  useEffect(() => {
    fetchServices();
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
                    service={listing.originalService}
                    user={user}
                    onViewDetails={handleViewServiceDetails}
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
      
      <ServiceModal 
        service={selectedService}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Search;
