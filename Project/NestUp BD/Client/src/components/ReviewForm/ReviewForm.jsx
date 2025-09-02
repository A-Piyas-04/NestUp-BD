import React, { useState } from 'react';
import './ReviewForm.css';

const ReviewForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  isEditing = false,
  nestName = '',
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 0,
    comment: initialData?.comment || '',
    images: initialData?.images || []
  });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = 'Please write a review comment';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const reviewData = {
        ...formData,
        comment: formData.comment.trim()
      };
      
      onSubmit(reviewData);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, comment: value }));
    if (errors.comment && value.trim().length >= 10) {
      setErrors(prev => ({ ...prev, comment: null }));
    }
  };

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).slice(0, 5 - formData.images.length);
    const imageUrls = newImages.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(imageUrls).then(urls => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating] || '';
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>{isEditing ? 'Edit Your Review' : 'Write a Review'}</h3>
        {nestName && (
          <p className="nest-name">for {nestName}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        {/* Rating Section */}
        <div className="form-group">
          <label className="form-label">Rating *</label>
          <div className="rating-input">
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${
                    star <= formData.rating ? 'active' : ''
                  }`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => {
                    // Visual preview on hover
                    const stars = document.querySelectorAll('.star-btn');
                    stars.forEach((s, i) => {
                      if (i < star) {
                        s.classList.add('hover');
                      } else {
                        s.classList.remove('hover');
                      }
                    });
                  }}
                  onMouseLeave={() => {
                    // Remove hover effects
                    document.querySelectorAll('.star-btn').forEach(s => {
                      s.classList.remove('hover');
                    });
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <span className="rating-text">
                {getRatingText(formData.rating)} ({formData.rating}/5)
              </span>
            )}
          </div>
          {errors.rating && (
            <span className="error-message">{errors.rating}</span>
          )}
        </div>

        {/* Comment Section */}
        <div className="form-group">
          <label className="form-label" htmlFor="comment">
            Your Review *
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={handleCommentChange}
            placeholder="Share your experience with this accommodation. What did you like? What could be improved?"
            className={`form-textarea ${errors.comment ? 'error' : ''}`}
            rows={5}
            maxLength={1000}
          />
          <div className="textarea-footer">
            <span className="char-count">
              {formData.comment.length}/1000 characters
            </span>
            {errors.comment && (
              <span className="error-message">{errors.comment}</span>
            )}
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="form-group">
          <label className="form-label">Photos (Optional)</label>
          <div 
            className={`image-upload-area ${
              dragActive ? 'drag-active' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="file-input"
              disabled={formData.images.length >= 5}
            />
            <label htmlFor="image-upload" className="upload-label">
              <div className="upload-icon">📷</div>
              <div className="upload-text">
                <p>Drop images here or click to upload</p>
                <p className="upload-subtext">
                  Up to 5 images, max 5MB each
                </p>
              </div>
            </label>
          </div>
          
          {formData.images.length > 0 && (
            <div className="uploaded-images">
              {formData.images.map((image, index) => (
                <div key={index} className="image-preview">
                  <img src={image} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || formData.rating === 0 || !formData.comment.trim()}
          >
            {isLoading ? (
              <span className="loading-spinner">⏳</span>
            ) : (
              isEditing ? 'Update Review' : 'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;