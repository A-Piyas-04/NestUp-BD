import React, { useState } from 'react';
import './NestReviewForm.css';

const NestReviewForm = ({
  isOpen,
  onClose,
  onSubmit,
  booking,
  service
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    categories: {
      cleanliness: 0,
      location: 0,
      amenities: 0,
      value: 0,
      accuracy: 0
    },
    images: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categoryLabels = {
    cleanliness: 'Cleanliness',
    location: 'Location',
    amenities: 'Amenities',
    value: 'Value for Money',
    accuracy: 'Accuracy of Description'
  };

  const handleRatingChange = (field, rating) => {
    if (field === 'overall') {
      setFormData(prev => ({ ...prev, rating }));
    } else {
      setFormData(prev => ({
        ...prev,
        categories: { ...prev.categories, [field]: rating }
      }));
    }
    
    // Clear error when user provides rating
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }
    
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    setErrors(prev => ({ ...prev, images: null }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.rating) {
      newErrors.rating = 'Overall rating is required';
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters long';
    }
    
    // Check if at least one category is rated
    const categoryRatings = Object.values(formData.categories);
    if (categoryRatings.every(rating => rating === 0)) {
      newErrors.categories = 'Please rate at least one category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('serviceId', service._id);
      submitData.append('bookingId', booking._id);
      submitData.append('rating', formData.rating);
      submitData.append('comment', formData.comment.trim());
      submitData.append('categories', JSON.stringify(formData.categories));
      
      // Add images
      formData.images.forEach((image, index) => {
        submitData.append('images', image);
      });
      
      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        rating: 0,
        comment: '',
        categories: {
          cleanliness: 0,
          location: 0,
          amenities: 0,
          value: 0,
          accuracy: 0
        },
        images: []
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting nest review:', error);
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, onRatingChange, field) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'filled' : ''}`}
            onClick={() => onRatingChange(field, star)}
            disabled={isSubmitting}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="nest-review-modal-overlay" onClick={onClose}>
      <div className="nest-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nest-review-header">
          <h2>Review Your Stay</h2>
          <p className="nest-title">{service?.title}</p>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        
        <div className="nest-review-content">
          <form onSubmit={handleSubmit}>
            {/* Overall Rating */}
            <div className="form-group">
              <label>Overall Rating *</label>
              {renderStars(formData.rating, handleRatingChange, 'overall')}
              {errors.rating && <span className="error-message">{errors.rating}</span>}
            </div>

            {/* Category Ratings */}
            <div className="form-group">
              <label>Rate Your Experience</label>
              <div className="category-ratings">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <div key={key} className="category-item">
                    <span className="category-label">{label}</span>
                    {renderStars(formData.categories[key], handleRatingChange, key)}
                  </div>
                ))}
              </div>
              {errors.categories && <span className="error-message">{errors.categories}</span>}
            </div>

            {/* Comment */}
            <div className="form-group">
              <label htmlFor="comment">Your Review *</label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={handleCommentChange}
                placeholder="Share your experience with this nest. How was your stay?"
                rows={4}
                disabled={isSubmitting}
                maxLength={1000}
              />
              <div className="character-count">
                {formData.comment.length}/1000 characters
              </div>
              {errors.comment && <span className="error-message">{errors.comment}</span>}
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label htmlFor="images">Photos (Optional)</label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isSubmitting}
              />
              <p className="help-text">Add up to 5 photos of your stay</p>
              
              {formData.images.length > 0 && (
                <div className="image-preview">
                  {formData.images.map((image, index) => (
                    <div key={index} className="image-item">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={`Preview ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && <span className="error-message">{errors.images}</span>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="error-message submit-error">{errors.submit}</div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NestReviewForm;