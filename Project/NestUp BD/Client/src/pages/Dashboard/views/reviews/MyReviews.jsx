import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import ReviewForm from '../../../../components/ReviewForm/ReviewForm';
import ReviewList from '../../../../components/ReviewList/ReviewList';
import './MyReviews.css';

const MyReviews = () => {
  const { user } = useAuth();
  const [nestReviews, setNestReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReplies: 0
  });

  // Fetch user's nest reviews
  useEffect(() => {
    fetchMyNestReviews();
  }, []);

  const fetchMyNestReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/nest-reviews/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const reviews = data.data?.reviews || [];
        setNestReviews(reviews);
        
        // Calculate stats
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;
        const pendingReplies = reviews.filter(review => !review.hostReply).length;
        
        setStats({
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          pendingReplies
        });
      } else {
        setError('Failed to load your nest reviews. Please try again later.');
      }
      
    } catch (err) {
      console.error('Error fetching nest reviews:', err);
      setError('Failed to load your nest reviews. Please try again later.');
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
        // Note: Delete functionality not implemented yet
        
        setNestReviews(prev => prev.filter(r => r.id !== review.id));
        
        // Update stats
        const updatedReviews = nestReviews.filter(r => r.id !== review.id);
        const totalReviews = updatedReviews.length;
        const averageRating = totalReviews > 0 
          ? updatedReviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews 
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
      // Note: Edit functionality not implemented yet
      // const updatedReview = await response.json();
      
      // Update local state
      const updatedReview = {
        ...editingReview,
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      setNestReviews(prev => prev.map(review => 
        review.id === editingReview.id ? updatedReview : review
      ));
      
      // Update stats
      const updatedReviews = nestReviews.map(review => 
        review.id === editingReview.id ? updatedReview : review
      );
      const totalReviews = updatedReviews.length;
      const averageRating = totalReviews > 0 
        ? updatedReviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews 
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
          <button onClick={fetchMyNestReviews} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-reviews-container">
      <div className="dashboard-page-header">
        <h1>My Nest Reviews</h1>
        <p>Manage and track all the nest reviews you've written</p>
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
        {nestReviews.length === 0 ? (
          <div className="empty-reviews">
            <div className="empty-icon">📝</div>
            <h3>No Nest Reviews Yet</h3>
            <p>You haven't written any nest reviews yet. Stay at a nest and share your experience!</p>
            <button className="btn-primary" onClick={() => window.location.href = '/search'}>
              Find Places to Stay
            </button>
          </div>
        ) : (
          <ReviewList
            reviews={nestReviews}
            showNestNames={true}
            showActions={true}
            onEditReview={handleEditReview}
            onDeleteReview={handleDeleteReview}
            showFilters={true}
            showStats={false}
            emptyMessage="No nest reviews match your filters"
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