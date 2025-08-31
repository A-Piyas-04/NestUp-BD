import React, { useState } from 'react';
import './ReviewCard.css';

const ReviewCard = ({ 
  review, 
  showNestName = false, 
  showActions = false, 
  onEdit = null, 
  onDelete = null,
  compact = false 
}) => {
  const [showFullComment, setShowFullComment] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : 'empty'}`}>
        ⭐
      </span>
    ));
  };

  const getStatusClass = (rating) => {
    if (rating >= 4) return 'positive';
    if (rating >= 3) return 'neutral';
    return 'negative';
  };

  const truncateComment = (comment, maxLength = 150) => {
    if (comment.length <= maxLength) return comment;
    return showFullComment ? comment : `${comment.substring(0, maxLength)}...`;
  };



  return (
    <div className={`review-card ${compact ? 'compact' : ''} ${getStatusClass(review.rating)}`}>
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {(review.reviewerAvatar || review.reviewer?.avatar) ? (
              <img src={review.reviewerAvatar || review.reviewer?.avatar} alt={review.reviewerName || review.reviewer?.name} />
            ) : (
              <div className="avatar-placeholder">
                {(review.reviewerName || review.reviewer?.name)?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="reviewer-details">
            <h4 className="reviewer-name">{review.reviewerName || review.reviewer?.name || 'Anonymous'}</h4>
            {showNestName && (
              <p className="nest-name">{review.nestName}</p>
            )}
            {review.service && review.service.title && (
              <p className="service-title">{review.service.title}</p>
            )}
            <div className="review-meta">
              <div className="rating">
                {renderStars(review.rating)}
                <span className="rating-number">({review.rating}/5)</span>
              </div>
              <span className="review-date">{formatDate(review.date || review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="review-actions">
          {showActions && (
            <>
              <button 
                className="action-btn edit-btn" 
                onClick={() => onEdit && onEdit(review)}
                title="Edit Review"
              >
                ✏️
              </button>
              <button 
                className="action-btn delete-btn" 
                onClick={() => onDelete && onDelete(review.id)}
                title="Delete Review"
              >
                🗑️
              </button>
            </>
          )}

        </div>
      </div>

      <div className="review-content">
        <p className="review-comment">
          {truncateComment(review.comment || review.text)}
          {(review.comment || review.text)?.length > 150 && (
            <button 
              className="show-more-btn"
              onClick={() => setShowFullComment(!showFullComment)}
            >
              {showFullComment ? 'Show less' : 'Show more'}
            </button>
          )}
        </p>
        
        {review.images && review.images.length > 0 && (
          <div className="review-images">
            {review.images.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`Review image ${index + 1}`} 
                className="review-image"
              />
            ))}
          </div>
        )}
      </div>

      {review.hostReply && (
        <div className="host-reply">
          <div className="reply-header">
            <span className="reply-label">Host Reply:</span>
            <span className="reply-date">{formatDate(review.hostReply.date)}</span>
          </div>
          <p className="reply-text">{review.hostReply.message || review.hostReply.text}</p>
        </div>
      )}



      {review.helpful && (
        <div className="review-footer">
          <div className="helpful-section">
            <span className="helpful-text">Was this helpful?</span>
            <div className="helpful-buttons">
              <button className="helpful-btn">
                👍 {review.helpful.yes || 0}
              </button>
              <button className="helpful-btn">
                👎 {review.helpful.no || 0}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;