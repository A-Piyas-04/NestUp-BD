import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import ReviewList from '../../../../components/ReviewList/ReviewList';
import './NestReviews.css';

const NestReviews = () => {
  const { user } = useAuth();
  const [hostReviews, setHostReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
    pendingReplies: 0
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  // Fetch reviews received as a host
  useEffect(() => {
    fetchReceivedHostReviews();
  }, []);

  const fetchReceivedHostReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/nest-reviews/host/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHostReviews(data.data?.reviews || []);
        
        // Calculate stats
        const reviews = data.data?.reviews || [];
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;
        const repliedReviews = reviews.filter(review => review.hostReply && review.hostReply.comment).length;
        const responseRate = totalReviews > 0 ? (repliedReviews / totalReviews) * 100 : 0;
        const pendingReplies = reviews.filter(review => !review.hostReply || !review.hostReply.comment).length;
        
        setStats({
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          responseRate: Math.round(responseRate),
          pendingReplies
        });
      } else {
        setError('Failed to fetch nest reviews');
      }
      
    } catch (err) {
      console.error('Error fetching received nest reviews:', err);
      setError('Error loading nest reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyToReview = (review) => {
    setReplyingTo(review);
    setReplyText('');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/nest-reviews/${replyingTo._id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: replyText.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      // Update local state
      const updatedReviews = hostReviews.map(review => 
        review._id === replyingTo._id 
          ? {
              ...review,
              hostReply: {
                comment: replyText.trim(),
                repliedAt: new Date().toISOString()
              }
            }
          : review
      );
      
      setHostReviews(updatedReviews);
      
      // Update stats
      const repliedReviews = updatedReviews.filter(review => review.hostReply && review.hostReply.comment).length;
      const responseRate = updatedReviews.length > 0 ? (repliedReviews / updatedReviews.length) * 100 : 0;
      const pendingReplies = updatedReviews.filter(review => !review.hostReply || !review.hostReply.comment).length;
      
      setStats(prev => ({
        ...prev,
        responseRate: Math.round(responseRate),
        pendingReplies
      }));
      
      setShowReplyModal(false);
      setReplyingTo(null);
      setReplyText('');
      
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert('Failed to submit reply. Please try again.');
    }
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setReplyingTo(null);
    setReplyText('');
  };

  if (loading) {
    return (
      <div className="nest-reviews-container">
        <div className="loading">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nest-reviews-container">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchReceivedHostReviews} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nest-reviews-container">
      <div className="page-header">
        <h1>Nest Reviews</h1>
        <p>Reviews from guests about your properties</p>
      </div>
      
      <div className="reviews-summary">
        <div className="summary-card">
          <div className="summary-icon">⭐</div>
          <div className="summary-content">
            <h3>Overall Rating</h3>
            <div className="summary-value">{stats.averageRating}</div>
            <p>Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">📝</div>
          <div className="summary-content">
            <h3>Total Reviews</h3>
            <div className="summary-value">{stats.totalReviews}</div>
            <p>Across all your nests</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">💬</div>
          <div className="summary-content">
            <h3>Response Rate</h3>
            <div className="summary-value">{stats.responseRate}%</div>
            <p>You respond to reviews</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <h3>Pending Replies</h3>
            <div className="summary-value">{stats.pendingReplies}</div>
            <p>Awaiting your response</p>
          </div>
        </div>
      </div>
      
      <div className="reviews-section">
        {hostReviews.length === 0 ? (
          <div className="empty-reviews">
            <div className="empty-icon">📝</div>
            <h3>No Nest Reviews Yet</h3>
            <p>You haven't received any nest reviews yet. Keep providing great hosting experiences to get your first review!</p>
          </div>
        ) : (
          <ReviewList
            reviews={hostReviews}
            showNestNames={true}
            showActions={false}
            onReplyToReview={handleReplyToReview}
            showFilters={true}
            showStats={false}
            emptyMessage="No reviews found"
            emptySubMessage="Try adjusting your search criteria"
          />
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && replyingTo && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeReplyModal()}>
          <div className="reply-modal">
            <div className="modal-header">
              <h3>Reply to Review</h3>
              <button className="close-btn" onClick={closeReplyModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="review-context">
                <h4>{replyingTo.nestName}</h4>
                <p><strong>{replyingTo.reviewerName}</strong> - {replyingTo.rating}/5 stars</p>
                <p className="review-text">"{replyingTo.comment}"</p>
              </div>
              <div className="reply-form">
                <label htmlFor="reply-text">Your Reply:</label>
                <textarea
                  id="reply-text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank your guest and address any concerns..."
                  rows={4}
                  maxLength={500}
                />
                <div className="character-count">
                  {replyText.length}/500 characters
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={closeReplyModal}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSubmitReply}>
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NestReviews;