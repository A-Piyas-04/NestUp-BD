import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import ReviewList from '../../../../components/ReviewList/ReviewList';
import './NestReviews.css';

const NestReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
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

  // Fetch host's property reviews
  useEffect(() => {
    fetchNestReviews();
  }, []);

  const fetchNestReviews = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/reviews/host/${user.id}`);
      // const data = await response.json();
      
      // Sample data for demonstration
      const sampleReviews = [
        {
          id: 1,
          nestName: 'Cozy Studio in Dhanmondi',
          nestId: 'nest_1',
          reviewerName: 'Ahmed Khan',
          reviewerAvatar: null,
          rating: 5,
          comment: 'Excellent accommodation! The place was clean, well-maintained, and the host was very helpful. Highly recommended for students.',
          date: '2024-01-15',
          createdAt: '2024-01-15T10:30:00Z',
          hostReply: null,
          canReply: true,
          images: []
        },
        {
          id: 2,
          nestName: 'Student-Friendly Room in Gulshan',
          nestId: 'nest_2',
          reviewerName: 'Fatima Rahman',
          reviewerAvatar: null,
          rating: 4,
          comment: 'Good location and reasonable price. The room was comfortable and the facilities were as described.',
          date: '2024-01-10',
          createdAt: '2024-01-10T14:20:00Z',
          hostReply: {
            message: 'Thank you for your wonderful review! We\'re delighted you enjoyed your stay.',
            date: '2024-01-11T09:15:00Z',
            hostName: user?.name || 'Host'
          },
          canReply: false,
          images: []
        },
        {
          id: 3,
          nestName: 'Cozy Studio in Dhanmondi',
          nestId: 'nest_1',
          reviewerName: 'Mohammad Ali',
          reviewerAvatar: null,
          rating: 3,
          comment: 'The place was okay, but could use some improvements in cleanliness. Location is convenient though.',
          date: '2024-01-05',
          createdAt: '2024-01-05T16:45:00Z',
          hostReply: null,
          canReply: true,
          images: []
        }
      ];

      setReviews(sampleReviews);
      
      // Calculate stats
      const totalReviews = sampleReviews.length;
      const averageRating = totalReviews > 0 
        ? sampleReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;
      const repliedReviews = sampleReviews.filter(review => review.hostReply).length;
      const responseRate = totalReviews > 0 ? (repliedReviews / totalReviews) * 100 : 0;
      const pendingReplies = sampleReviews.filter(review => !review.hostReply).length;
      
      setStats({
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        responseRate: Math.round(responseRate),
        pendingReplies
      });
      
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
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
      // TODO: Replace with actual API call
      // await fetch(`/api/reviews/${replyingTo.id}/reply`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: replyText.trim() })
      // });

      // Update local state
      const updatedReviews = reviews.map(review => 
        review.id === replyingTo.id 
          ? {
              ...review,
              hostReply: {
                message: replyText.trim(),
                date: new Date().toISOString(),
                hostName: user?.name || 'Host'
              },
              canReply: false
            }
          : review
      );
      
      setReviews(updatedReviews);
      
      // Update stats
      const repliedReviews = updatedReviews.filter(review => review.hostReply).length;
      const responseRate = updatedReviews.length > 0 ? (repliedReviews / updatedReviews.length) * 100 : 0;
      const pendingReplies = updatedReviews.filter(review => !review.hostReply).length;
      
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
          <button onClick={fetchNestReviews} className="btn-primary">
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
        <p>See what guests are saying about your accommodations</p>
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
        {reviews.length === 0 ? (
          <div className="empty-reviews">
            <div className="empty-icon">📝</div>
            <h3>No Reviews Yet</h3>
            <p>Your guests haven't left any reviews yet. Encourage them to share their experience!</p>
          </div>
        ) : (
          <ReviewList
            reviews={reviews}
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