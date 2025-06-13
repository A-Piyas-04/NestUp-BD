import React from 'react';

const FilterSidebar = () => {
  // Service types for checkboxes
  const serviceTypes = [
    { id: 'plumber', label: 'Plumber' },
    { id: 'electrician', label: 'Electrician' },
    { id: 'cleaner', label: 'Cleaner' },
    { id: 'painter', label: 'Painter' },
    { id: 'carpenter', label: 'Carpenter' },
    { id: 'gardener', label: 'Gardener' },
  ];

  // Rating options
  const ratingOptions = [
    { value: 5, label: '5 Stars' },
    { value: 4, label: '4+ Stars' },
    { value: 3, label: '3+ Stars' },
    { value: 2, label: '2+ Stars' },
    { value: 1, label: '1+ Stars' },
  ];

  return (
    <div className="filter-sidebar bg-white p-6 rounded-lg shadow-md sticky top-24">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Filter Services</h2>
      
      {/* Service Type Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Service Type</h3>
        <div className="space-y-2">
          {serviceTypes.map((service) => (
            <div key={service.id} className="flex items-center">
              <input
                type="checkbox"
                id={service.id}
                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor={service.id} className="ml-2 text-gray-600">
                {service.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Location Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Location</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter your location"
            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Rating Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Rating</h3>
        <div className="space-y-2">
          {ratingOptions.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                id={`rating-${option.value}`}
                name="rating"
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label htmlFor={`rating-${option.value}`} className="ml-2 text-gray-600 flex items-center">
                {option.label}
                <div className="ml-1 flex">
                  {[...Array(option.value)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Price Range (BDT)</h3>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="min-price" className="block text-sm text-gray-600 mb-1">Min</label>
            <input
              type="number"
              id="min-price"
              placeholder="0"
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="max-price" className="block text-sm text-gray-600 mb-1">Max</label>
            <input
              type="number"
              id="max-price"
              placeholder="10000"
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Apply Filters Button */}
      <button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded transition duration-200">
        Apply Filters
      </button>
    </div>
  );
};

export default FilterSidebar;