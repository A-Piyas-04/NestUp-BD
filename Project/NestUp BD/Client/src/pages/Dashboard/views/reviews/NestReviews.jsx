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
        
        setStats({
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10
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

            showFilters={true}
            showStats={false}
            emptyMessage="No reviews found"
            emptySubMessage="Try adjusting your search criteria"
          />
        )}
      </div>


    </div>
  );
};

export default NestReviews;