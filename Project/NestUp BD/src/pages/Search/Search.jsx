import React from 'react';
import MainLayout from '../../components/Layouts/MainLayout';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import ListingCard from '../../components/ListingCard/ListingCard';

const Search = () => {
  // Dummy data for service listings
  const dummyListings = [
    {
      id: 1,
      title: 'Professional Plumbing Services',
      location: 'Dhanmondi, Dhaka',
      rating: 4.8,
      price: 1200,
      image: 'https://placehold.co/400x225?text=Plumbing+Services'
    },
    {
      id: 2,
      title: 'Expert Electrician for Home & Office',
      location: 'Gulshan, Dhaka',
      rating: 4.5,
      price: 1500,
      image: 'https://placehold.co/400x225?text=Electrician+Services'
    },
    {
      id: 3,
      title: 'Home Cleaning Services',
      location: 'Banani, Dhaka',
      rating: 4.2,
      price: 800,
      image: 'https://placehold.co/400x225?text=Cleaning+Services'
    },
    {
      id: 4,
      title: 'Interior House Painting',
      location: 'Uttara, Dhaka',
      rating: 4.7,
      price: 3500,
      image: 'https://placehold.co/400x225?text=Painting+Services'
    },
    {
      id: 5,
      title: 'Furniture Repair & Restoration',
      location: 'Mohammadpur, Dhaka',
      rating: 4.3,
      price: 1800,
      image: 'https://placehold.co/400x225?text=Furniture+Repair'
    },
    {
      id: 6,
      title: 'Garden Maintenance & Landscaping',
      location: 'Bashundhara, Dhaka',
      rating: 4.6,
      price: 2200,
      image: 'https://placehold.co/400x225?text=Garden+Services'
    },
    {
      id: 7,
      title: 'AC Repair & Installation',
      location: 'Mirpur, Dhaka',
      rating: 4.4,
      price: 1600,
      image: 'https://placehold.co/400x225?text=AC+Repair'
    },
    {
      id: 8,
      title: 'Computer & Laptop Repair',
      location: 'Motijheel, Dhaka',
      rating: 4.9,
      price: 1000,
      image: 'https://placehold.co/400x225?text=Computer+Repair'
    },
    {
      id: 9,
      title: 'Home Tutoring Services',
      location: 'Wari, Dhaka',
      rating: 4.7,
      price: 2500,
      image: 'https://placehold.co/400x225?text=Tutoring+Services'
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Services</h1>
        
        {/* Search input at the top */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for services..."
              className="w-full p-4 pl-12 pr-10 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200">
                Search
              </span>
            </button>
          </div>
        </div>
        
        {/* Main content with sidebar and listings */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar />
          </div>
          
          {/* Listings */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                <span className="font-medium">{dummyListings.length}</span> services found
              </p>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-gray-600">Sort by:</label>
                <select
                  id="sort"
                  className="border border-gray-300 rounded p-2 focus:ring-primary focus:border-primary"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {dummyListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Search;