import React, { useState, useMemo } from 'react';
import ReviewCard from '../ReviewCard/ReviewCard';
import './ReviewList.css';

const ReviewList = ({ 
  reviews = [], 
  showNestNames = false, 
  showActions = false,
  onEditReview = null,
  onDeleteReview = null,
  onReplyToReview = null,
  showFilters = true,
  showStats = true,
  emptyMessage = "No reviews yet",
  emptySubMessage = "Be the first to leave a review!"
}) => {
  const [filters, setFilters] = useState({
    rating: 'all', // all, 5, 4, 3, 2, 1
    sortBy: 'newest', // newest, oldest, highest, lowest
    searchTerm: ''
  });
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Calculate review statistics
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    };
  }, [reviews]);

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filters.rating !== 'all') {
      const targetRating = parseInt(filters.rating);
      filtered = filtered.filter(review => review.rating === targetRating);
    }

    // Filter by search term
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        (review.comment || review.text || '').toLowerCase().includes(searchLower) ||
        (review.reviewerName || '').toLowerCase().includes(searchLower) ||
        (showNestNames && (review.nestName || '').toLowerCase().includes(searchLower))
      );
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'newest':
        default:
          return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
      }
    });

    return filtered;
  }, [reviews, filters, showNestNames]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      rating: 'all',
      sortBy: 'newest',
      searchTerm: ''
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : 'empty'}`}>
        ⭐
      </span>
    ));
  };

  const renderRatingBar = (rating, count) => {
    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
    return (
      <div className="rating-bar-item">
        <span className="rating-label">{rating} ⭐</span>
        <div className="rating-bar">
          <div 
            className="rating-bar-fill" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="rating-count">({count})</span>
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="review-list-container">
        <div className="empty-reviews">
          <div className="empty-icon">📝</div>
          <h3>{emptyMessage}</h3>
          <p>{emptySubMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-list-container">
      {showStats && (
        <div className="review-stats">
          <div className="stats-summary">
            <div className="average-rating">
              <span className="rating-number">{stats.averageRating}</span>
              <div className="rating-stars">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <span className="total-reviews">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map(rating => 
              renderRatingBar(rating, stats.ratingDistribution[rating])
            )}
          </div>
        </div>
      )}

      {showFilters && (
        <div className="review-filters">
          <div className="filters-header">
            <h4>Filter Reviews</h4>
            <button 
              className="toggle-filters-btn"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            >
              {showFiltersPanel ? '▲' : '▼'}
            </button>
          </div>
          
          {showFiltersPanel && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Search Reviews:</label>
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Search in reviews..."
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <label>Filter by Rating:</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
              
              <button 
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      <div className="reviews-header">
        <h4>
          {filteredAndSortedReviews.length} Review{filteredAndSortedReviews.length !== 1 ? 's' : ''}
          {filters.rating !== 'all' && ` (${filters.rating} stars)`}
          {filters.searchTerm && ` matching "${filters.searchTerm}"`}
        </h4>
      </div>

      <div className="reviews-list">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="no-results">
            <p>No reviews match your current filters.</p>
            <button 
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <ReviewCard
              key={review.id || review._id}
              review={review}
              showNestName={showNestNames}
              showActions={showActions}
              onEdit={onEditReview}
              onDelete={onDeleteReview}
              onReply={onReplyToReview}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;