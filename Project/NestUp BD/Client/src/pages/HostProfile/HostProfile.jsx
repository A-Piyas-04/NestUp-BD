import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HostProfile.css';

const HostProfile = () => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [nestReviews, setNestReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hostId) {
      fetchHostData();
    }
  }, [hostId]);

  const fetchHostData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch user profile
      const profileResponse = await fetch(`/api/users/${hostId}/profile`);
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch host profile');
      }
      const profileData = await profileResponse.json();
      setUserProfile(profileData);

      // Fetch nest reviews
      await fetchNestReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNestReviews = async () => {
    setReviewsLoading(true);
    
    try {
      const response = await fetch(`/api/nest-reviews/host/${hostId}/public?limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setNestReviews(data.data?.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching nest reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="host-profile-container">
        <div className="loading">Loading host profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="host-profile-container">
        <div className="error">Error: {error}</div>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="host-profile-container">
        <div className="error">Host not found</div>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="host-profile-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      {/* Host Profile Header */}
      <div className="host-profile-header">
        <div className="host-avatar">
          {userProfile.profilePicture ? (
            <img src={userProfile.profilePicture} alt={userProfile.name} />
          ) : (
            <div className="avatar-placeholder">
              {userProfile.name?.charAt(0)?.toUpperCase() || 'H'}
            </div>
          )}
        </div>
        <div className="host-info">
          <h1>{userProfile.name || 'Host'}</h1>
          <p className="host-email">{userProfile.email}</p>
          <p className="member-since">
            Member since: {formatDate(userProfile.createdAt)}
          </p>
        </div>
      </div>

      {/* Property Reviews Section */}
      <div className="reviews-section">
        <h2>Property Reviews</h2>
        
        {reviewsLoading ? (
          <div className="loading">Loading reviews...</div>
        ) : nestReviews.length > 0 ? (
          <div className="reviews-list">
            {nestReviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.reviewer?.profilePicture ? (
                        <img src={review.reviewer.profilePicture} alt={review.reviewer.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'R'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4>{review.reviewer?.name || 'Anonymous'}</h4>
                      <p className="review-date">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                    <span className="rating-number">({review.rating})</span>
                  </div>
                </div>
                
                {review.comment && (
                  <div className="review-comment">
                    <p>{review.comment}</p>
                  </div>
                )}
                
                {review.service && (
                  <div className="review-service">
                    <small>Service: {review.service.title}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews">
            <p>This host's properties haven't received any reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostProfile;