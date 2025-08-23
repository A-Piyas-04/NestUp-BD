import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import ReviewForm from '../../../../components/ReviewForm/ReviewForm';
import ReviewList from '../../../../components/ReviewList/ReviewList';
import './MyReviews.css';

const MyReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReplies: 0
  });

  // Fetch user's reviews
  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/reviews/user/${user.id}`);
      // const data = await response.json();
      
      // Sample data for demonstration
      const sampleReviews = [
        {
          id: 1,
          nestName: 'Cozy Studio in Dhanmondi',
          nestId: 'nest_1',
          rating: 5,
          comment: 'Excellent accommodation! The place was clean, well-maintained, and the host was very helpful. Highly recommended for students.',
          date: '2024-01-15',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          hostReply: null,
          canEdit: true,
          canDelete: true,
          images: []
        },
        {
          id: 2,
          nestName: 'Student-Friendly Room in Gulshan',
          nestId: 'nest_2',
          rating: 4,
          comment: 'Good location and reasonable price. The room was comfortable and the facilities were as described.',
          date: '2024-01-10',
          createdAt: '2024-01-10T14:20:00Z',
          updatedAt: '2024-01-10T14:20:00Z',
          hostReply: {
            message: 'Thank you for your review! We\'re glad you enjoyed your stay.',
            date: '2024-01-11T09:15:00Z',
            hostName: 'Ahmed Khan'
          },
          canEdit: true,
          canDelete: true,
          images: []
        },
        {
          id: 3,
          nestName: 'Modern Apartment in Uttara',
          nestId: 'nest_3',
          rating: 3,
          comment: 'The place was okay, but could use some improvements in cleanliness. Location is convenient though.',
          date: '2024-01-05',
          createdAt: '2024-01-05T16:45:00Z',
          updatedAt: '2024-01-05T16:45:00Z',
          hostReply: null,
          canEdit: true,
          canDelete: true,
          images: []
        }
      ];

      setReviews(sampleReviews);
      
      // Calculate stats
      const totalReviews = sampleReviews.length;
      const averageRating = totalReviews > 0 
        ? sampleReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;
      const pendingReplies = sampleReviews.filter(review => !review.hostReply).length;
      
      setStats({
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        pendingReplies
      });
      
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load your reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowEditForm(true);
  };

  const handleDeleteReview = async (review) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/reviews/${review.id}`, { method: 'DELETE' });
        
        setReviews(prev => prev.filter(r => r.id !== review.id));
        
        // Update stats
        const updatedReviews = reviews.filter(r => r.id !== review.id);
        const totalReviews = updatedReviews.length;
        const averageRating = totalReviews > 0 
          ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
          : 0;
        const pendingReplies = updatedReviews.filter(r => !r.hostReply).length;
        
        setStats({
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          pendingReplies
        });
        
      } catch (err) {
        console.error('Error deleting review:', err);
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  const handleUpdateReview = async (updatedData) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/reviews/${editingReview.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedData)
      // });
      // const updatedReview = await response.json();
      
      // Update local state
      const updatedReview = {
        ...editingReview,
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      setReviews(prev => prev.map(review => 
        review.id === editingReview.id ? updatedReview : review
      ));
      
      // Update stats
      const updatedReviews = reviews.map(review => 
        review.id === editingReview.id ? updatedReview : review
      );
      const totalReviews = updatedReviews.length;
      const averageRating = totalReviews > 0 
        ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
      
      setStats(prev => ({
        ...prev,
        averageRating: Math.round(averageRating * 10) / 10
      }));
      
      setShowEditForm(false);
      setEditingReview(null);
      
    } catch (err) {
      console.error('Error updating review:', err);
      alert('Failed to update review. Please try again.');
    }
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingReview(null);
  };

  if (loading) {
    return (
      <div className="my-reviews-container">
        <div className="loading">Loading your reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-reviews-container">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchMyReviews} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-reviews-container">
      <div className="page-header">
        <h1>My Reviews</h1>
        <p>Manage and track all the reviews you've written</p>
      </div>

      {/* Stats Summary */}
      <div className="reviews-stats-summary">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Total Reviews</h3>
            <div className="stat-value">{stats.totalReviews}</div>
            <p>Reviews written</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <div className="stat-value">{stats.averageRating}</div>
            <p>Your average rating</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>Pending Replies</h3>
            <div className="stat-value">{stats.pendingReplies}</div>
            <p>Awaiting host responses</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-section">
        {reviews.length === 0 ? (
          <div className="empty-reviews">
            <div className="empty-icon">📝</div>
            <h3>No Reviews Yet</h3>
            <p>You haven't written any reviews yet. Book a stay and share your experience!</p>
            <button className="btn-primary" onClick={() => window.location.href = '/search'}>
              Find Places to Stay
            </button>
          </div>
        ) : (
          <ReviewList
            reviews={reviews}
            showNestNames={true}
            showActions={true}
            onEditReview={handleEditReview}
            onDeleteReview={handleDeleteReview}
            showFilters={true}
            showStats={false}
            emptyMessage="No reviews match your filters"
            emptySubMessage="Try adjusting your search criteria"
          />
        )}
      </div>

      {/* Edit Review Modal */}
      {showEditForm && editingReview && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeEditForm()}>
          <div className="edit-review-modal">
            <div className="modal-header">
              <h3>Edit Your Review</h3>
              <button className="close-btn" onClick={closeEditForm}>×</button>
            </div>
            <div className="modal-content">
              <div className="property-info">
                <h4>{editingReview.nestName}</h4>
                <p>Originally reviewed on {new Date(editingReview.createdAt).toLocaleDateString()}</p>
              </div>
              <ReviewForm
                isEditing={true}
                initialData={{
                  rating: editingReview.rating,
                  comment: editingReview.comment,
                  images: editingReview.images || []
                }}
                nestName={editingReview.nestName}
                onSubmit={handleUpdateReview}
                onCancel={closeEditForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;