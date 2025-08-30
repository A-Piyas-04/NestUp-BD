import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HostProfile.css';

const HostProfile = () => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [nestReviews, setNestReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hostId) {
      fetchUserProfile();
    }
  }, [hostId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/users/${hostId}/profile`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      setUserProfile(data);
      // Fetch nest reviews after getting user profile
      fetchNestReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNestReviews = async () => {
    setReviewsLoading(true);
    
    try {
      const response = await fetch(`/api/nest-reviews/host/${hostId}?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="host-profile-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading host profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="host-profile-page">
        <div className="error-state">
          <h2>Error Loading Profile</h2>
          <p>{error}</p>
          <button onClick={fetchUserProfile} className="retry-btn">
            Retry
          </button>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="host-profile-page">
        <div className="error-state">
          <h2>Host Not Found</h2>
          <p>The requested host profile could not be found.</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="host-profile-page">
      <div className="host-profile-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Host Profile</h1>
      </div>

      <div className="host-profile-content">
        <div className="host-info-section">
          <div className="host-avatar">
            {userProfile.profilePicture ? (
              <img src={userProfile.profilePicture} alt={userProfile.name} />
            ) : (
              <div className="avatar-placeholder">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'H'}
              </div>
            )}
          </div>
          
          <div className="host-details">
            <h2>{userProfile.name || 'Host Name'}</h2>
            <p className="host-email">{userProfile.email}</p>
            
            {userProfile.phone && (
              <div className="contact-info">
                <h3>Contact Information</h3>
                <p><strong>Phone:</strong> {userProfile.phone}</p>
                {userProfile.email && <p><strong>Email:</strong> {userProfile.email}</p>}
              </div>
            )}
            
            {userProfile.location && (
              <div className="location-info">
                <h3>Location</h3>
                <p>{userProfile.location}</p>
              </div>
            )}
            
            <div className="member-info">
              <p><strong>Member since:</strong> {formatDate(userProfile.createdAt)}</p>
              {userProfile.gender && <p><strong>Gender:</strong> {userProfile.gender}</p>}
              {userProfile.dateOfBirth && <p><strong>Date of Birth:</strong> {formatDate(userProfile.dateOfBirth)}</p>}
            </div>
            
            {userProfile.isStudent && (
              <div className="academic-info">
                <h3>Academic Information</h3>
                {userProfile.institution && <p><strong>Institution:</strong> {userProfile.institution}</p>}
                {userProfile.department && <p><strong>Department:</strong> {userProfile.department}</p>}
                {userProfile.studentId && <p><strong>Student ID:</strong> {userProfile.studentId}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Nest Reviews Section */}
        <div className="host-reviews-section">
          <h2>Property Reviews</h2>
          
          {userProfile.nestRating && userProfile.nestRating.count > 0 ? (
            <>
              <div className="overall-rating">
                <div className="rating-display">
                  <span className="rating-number">{userProfile.nestRating.average.toFixed(1)}</span>
                  <div className="stars-large">
                    {renderStars(userProfile.nestRating.average)}
                  </div>
                  <span className="rating-count">({userProfile.nestRating.count} review{userProfile.nestRating.count !== 1 ? 's' : ''})</span>
                </div>
              </div>
              
              {userProfile.nestRating.categories && (
                <div className="category-ratings">
                  <h3>Rating Breakdown</h3>
                  <div className="category-grid">
                    {Object.entries(userProfile.nestRating.categories).map(([category, rating]) => (
                      <div key={category} className="category-item">
                        <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <div className="category-rating">
                          <div className="stars-small">
                            {renderStars(rating)}
                          </div>
                          <span className="category-score">{rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="recent-reviews">
                <h3>Recent Reviews</h3>
                {reviewsLoading ? (
                  <div className="reviews-loading">
                    <div className="spinner-small"></div>
                    <p>Loading reviews...</p>
                  </div>
                ) : nestReviews.length > 0 ? (
                  <div className="reviews-list">
                    {nestReviews.slice(0, 5).map((review) => (
                      <div key={review._id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">{review.reviewer?.name || 'Anonymous'}</span>
                            <span className="review-date">{formatDate(review.createdAt)}</span>
                          </div>
                          <div className="review-rating">
                            <div className="stars-small">
                              {renderStars(review.overallRating)}
                            </div>
                            <span className="rating-value">{review.overallRating.toFixed(1)}</span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="review-comment">{review.comment}</p>
                        )}
                        
                        {review.categories && (
                          <div className="review-categories">
                            {Object.entries(review.categories).map(([category, rating]) => (
                              <div key={category} className="review-category">
                                <span>{category}: {rating}/5</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-reviews">No reviews available yet.</p>
                )}
              </div>
            </>
          ) : (
            <div className="no-rating">
              <p>This host's properties haven't received any reviews yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostProfile;