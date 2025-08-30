import React, { useState, useEffect } from 'react';
import './UserProfile.css';

const UserProfile = ({ isOpen, onClose, userId }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [nestReviews, setNestReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/users/${userId}/profile`);
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
      const response = await fetch(`/api/nest-reviews/host/${userId}?limit=5`, {
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="user-profile-overlay" onClick={handleOverlayClick}>
      <div className="user-profile-modal">
        <div className="user-profile-header">
          <h2>Host Profile</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="user-profile-content">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading profile...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={fetchUserProfile} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {userProfile && (
            <div className="profile-details">
              <div className="profile-header-section">
                <div className="profile-picture-container">
                  {userProfile.profile?.profilePicture ? (
                    <img
                      src={userProfile.profile.profilePicture}
                      alt="Profile"
                      className="profile-picture"
                    />
                  ) : (
                    <div className="profile-picture-placeholder">
                      {userProfile.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <h3>{userProfile.name}</h3>
                  <p className="occupation">
                    {userProfile.profile?.occupation === 'student'
                      ? `Student at ${userProfile.profile?.institution || 'Institution'}`
                      : userProfile.profile?.occupation || 'Not specified'}
                  </p>
                  <div className="verification-status">
                    {userProfile.isVerified ? (
                      <span className="verified">✓ Verified Host</span>
                    ) : (
                      <span className="unverified">Unverified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-sections">
                <div className="profile-section">
                  <h4>Contact Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{userProfile.email}</span>
                    </div>
                    {userProfile.profile?.phone && (
                      <div className="info-item">
                        <span className="label">Phone:</span>
                        <span className="value">{userProfile.profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {userProfile.profile?.address && (
                  <div className="profile-section">
                    <h4>Location</h4>
                    <div className="info-grid">
                      {userProfile.profile.address.district && (
                        <div className="info-item">
                          <span className="label">District:</span>
                          <span className="value">{userProfile.profile.address.district}</span>
                        </div>
                      )}
                      {userProfile.profile.address.area && (
                        <div className="info-item">
                          <span className="label">Area:</span>
                          <span className="value">{userProfile.profile.address.area}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="profile-section">
                  <h4>Profile Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Member Since:</span>
                      <span className="value">{formatDate(userProfile.createdAt)}</span>
                    </div>
                    {userProfile.profile?.gender && (
                      <div className="info-item">
                        <span className="label">Gender:</span>
                        <span className="value">
                          {userProfile.profile.gender.charAt(0).toUpperCase() + userProfile.profile.gender.slice(1)}
                        </span>
                      </div>
                    )}
                    {userProfile.profile?.dateOfBirth && (
                      <div className="info-item">
                        <span className="label">Date of Birth:</span>
                        <span className="value">{formatDate(userProfile.profile.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {userProfile.profile?.occupation === 'student' && (
                  <div className="profile-section">
                    <h4>Academic Information</h4>
                    <div className="info-grid">
                      {userProfile.profile.institution && (
                        <div className="info-item">
                          <span className="label">Institution:</span>
                          <span className="value">{userProfile.profile.institution}</span>
                        </div>
                      )}
                      {userProfile.profile.department && (
                        <div className="info-item">
                          <span className="label">Department:</span>
                          <span className="value">{userProfile.profile.department}</span>
                        </div>
                      )}
                      {userProfile.profile.studentId && (
                        <div className="info-item">
                          <span className="label">Student ID:</span>
                          <span className="value">{userProfile.profile.studentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Property Rating Section */}
                <div className="profile-section">
                  <h4>Property Rating & Reviews</h4>
                  {userProfile.nestRating && userProfile.nestRating.count > 0 ? (
                    <div className="host-rating-section">
                      <div className="rating-overview">
                        <div className="overall-rating">
                          <span className="rating-number">{userProfile.nestRating.average}</span>
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star} 
                                className={`star ${star <= Math.round(userProfile.nestRating.average) ? 'filled' : ''}`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="rating-count">({userProfile.nestRating.count} reviews)</span>
                        </div>
                      </div>
                      
                      {userProfile.nestRating.categories && (
                        <div className="rating-categories">
                          <h5>Category Ratings</h5>
                          <div className="categories-grid">
                            {Object.entries(userProfile.nestRating.categories).map(([category, rating]) => (
                              rating > 0 && (
                                <div key={category} className="category-item">
                                  <span className="category-name">
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </span>
                                  <span className="category-rating">{rating}/5</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Recent Reviews */}
                      <div className="recent-reviews">
                        <h5>Recent Reviews</h5>
                        {reviewsLoading ? (
                          <p className="loading-text">Loading reviews...</p>
                        ) : nestReviews.length > 0 ? (
                          <div className="reviews-list">
                            {nestReviews.slice(0, 3).map((review) => (
                              <div key={review._id} className="review-item">
                                <div className="review-header">
                                  <div className="reviewer-info">
                                    <span className="reviewer-name">{review.user?.name || 'Anonymous'}</span>
                                    <div className="review-rating">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span 
                                          key={star} 
                                          className={`star small ${star <= Math.round((review.cleanliness + review.communication + review.checkIn + review.accuracy + review.location + review.value) / 6) ? 'filled' : ''}`}
                                        >
                                          ⭐
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <span className="review-date">{formatDate(review.createdAt)}</span>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-reviews">No reviews yet</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="no-rating">
                      <p>This host's properties haven't received any reviews yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="user-profile-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;