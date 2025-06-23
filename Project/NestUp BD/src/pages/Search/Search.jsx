import React from 'react';
import './Search.css';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import ListingCard from '../../components/ListingCard/ListingCard';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const dummyListings = [
  {
    title: 'Modern Studio in Dhanmondi',
    location: 'Dhanmondi, Dhaka',
    price: '৳2000/night',
    image: 'https://via.placeholder.com/400x200',
  },
  {
    title: 'Ride from Airport to Mirpur',
    location: 'Hazrat Shahjalal Intl.',
    price: '৳500',
    image: 'https://via.placeholder.com/400x200',
  },
  {
    title: 'Daily Meals Service',
    location: 'Uttara Sector 10',
    price: '৳250/day',
    image: 'https://via.placeholder.com/400x200',
  },
  {
    title: 'Ride from Airport to Mirpur',
    location: 'Hazrat Shahjalal Intl.',
    price: '৳500',
    image: 'https://via.placeholder.com/400x200',
  },
  {
    title: 'Daily Meals Service',
    location: 'Uttara Sector 10',
    price: '৳250/day',
    image: 'https://via.placeholder.com/400x200',
  },
];

const Search = () => {
  return (
    <div>
      <Header />

      <div className="search-page">
        <div className="search-page-container">
          <div className="search-filter-sidebar">
            <FilterSidebar />
          </div>
          <div className="search-results-grid">
            {dummyListings.map((listing, index) => (
              <ListingCard
                key={index}
                title={listing.title}
                location={listing.location}
                price={listing.price}
                image={listing.image}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
