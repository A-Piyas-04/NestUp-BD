import React from 'react';

const NestReviews = () => {
  const reviews = [
    {
      id: 1,
      nestName: 'Cozy Studio in Dhanmondi',
      reviewer: 'Ahmed Khan',
      rating: 5,
      comment: 'Excellent accommodation! The place was clean, well-maintained, and the host was very helpful. Highly recommended for students.',
      date: '2024-01-15',
      status: 'positive'
    },
    {
      id: 2,
      nestName: 'Student-Friendly Room in Gulshan',
      reviewer: 'Fatima Rahman',
      rating: 4,
      comment: 'Good location and reasonable price. The room was comfortable and the facilities were as described.',
      date: '2024-01-10',
      status: 'positive'
    },
    {
      id: 3,
      nestName: 'Cozy Studio in Dhanmondi',
      reviewer: 'Mohammad Ali',
      rating: 3,
      comment: 'The place was okay, but could use some improvements in cleanliness. Location is convenient though.',
      date: '2024-01-05',
      status: 'neutral'
    }
  ];

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Nest Reviews</h1>
        <p>See what guests are saying about your accommodations</p>
      </div>
      
      <div className="reviews-summary">
        <div className="summary-card">
          <h3>Overall Rating</h3>
          <div className="rating-display">
            <span className="rating-number">4.3</span>
            <span className="rating-stars">⭐⭐⭐⭐☆</span>
          </div>
          <p>Based on 23 reviews</p>
        </div>
        
        <div className="summary-card">
          <h3>Total Reviews</h3>
          <div className="review-count">23</div>
          <p>Across all your nests</p>
        </div>
        
        <div className="summary-card">
          <h3>Response Rate</h3>
          <div className="response-rate">95%</div>
          <p>You respond to reviews</p>
        </div>
      </div>
      
      <div className="reviews-section">
        <h2>Recent Reviews</h2>
        
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className={`review-card ${review.status}`}>
              <div className="review-header">
                <div className="review-info">
                  <h4>{review.nestName}</h4>
                  <p className="reviewer-name">By {review.reviewer}</p>
                  <p className="review-date">{review.date}</p>
                </div>
                <div className="review-rating">
                  <span className="stars">{renderStars(review.rating)}</span>
                  <span className="rating-text">{review.rating}/5</span>
                </div>
              </div>
              
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
              
              <div className="review-actions">
                <button className="btn-secondary">Reply</button>
                <button className="btn-secondary">View Nest</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NestReviews; 