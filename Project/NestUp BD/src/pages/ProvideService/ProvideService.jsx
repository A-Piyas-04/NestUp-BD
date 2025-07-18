import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './ProvideService.css';

const ProvideService = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    propertyType: '',
    description: '',
    
    // Location Details
    district: '',
    area: '',
    address: '',
    
    // Pricing & Availability
    price: '',
    availableFrom: '',
    availableTo: '',
    
    // Property Details
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    furnishing: 'unfurnished',
    
    // Amenities & Features
    amenities: {
      wifi: false,
      ac: false,
      parking: false,
      kitchen: false,
      laundry: false,
      studyArea: false,
      securityGuard: false,
      cctv: false,
    },
    
    // Photos & Media
    photos: [],
    
    // Contact Information
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactWhatsapp: '',
    
    // Terms & Conditions
    termsAgreed: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: checked
          }
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked
        });
      }
    } else if (type === 'file') {
      const selectedFiles = Array.from(files);
      setFormData({
        ...formData,
        photos: [...formData.photos, ...selectedFiles]
      });
      
      // Create preview URLs for the selected images
      const newPreviewImages = selectedFiles.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      
      setPreviewImages([...previewImages, ...newPreviewImages]);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const removeImage = (index) => {
    const updatedPhotos = [...formData.photos];
    updatedPhotos.splice(index, 1);
    
    const updatedPreviews = [...previewImages];
    URL.revokeObjectURL(updatedPreviews[index].url);
    updatedPreviews.splice(index, 1);
    
    setFormData({
      ...formData,
      photos: updatedPhotos
    });
    setPreviewImages(updatedPreviews);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    } else if (step === 2) {
      if (!formData.district) newErrors.district = 'District is required';
      if (!formData.area.trim()) newErrors.area = 'Area is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    } else if (step === 3) {
      if (!formData.price.trim()) newErrors.price = 'Price is required';
      if (isNaN(formData.price) || Number(formData.price) <= 0) newErrors.price = 'Please enter a valid price';
      if (!formData.availableFrom) newErrors.availableFrom = 'Available from date is required';
      if (!formData.availableTo) newErrors.availableTo = 'Available to date is required';
      
      if (formData.availableFrom && formData.availableTo) {
        const fromDate = new Date(formData.availableFrom);
        const toDate = new Date(formData.availableTo);
        
        if (fromDate >= toDate) {
          newErrors.availableTo = 'End date must be after start date';
        }
      }
    } else if (step === 4) {
      if (!formData.bedrooms) newErrors.bedrooms = 'Number of bedrooms is required';
      if (!formData.bathrooms) newErrors.bathrooms = 'Number of bathrooms is required';
    } else if (step === 6) {
      if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
      if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
      if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) newErrors.contactEmail = 'Email is invalid';
    } else if (step === 7) {
      if (!formData.termsAgreed) newErrors.termsAgreed = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would submit the form data to your backend here
      console.log('Form submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message and redirect
      alert('Your listing has been submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Basic Info' },
      { number: 2, label: 'Location' },
      { number: 3, label: 'Pricing' },
      { number: 4, label: 'Details' },
      { number: 5, label: 'Amenities' },
      { number: 6, label: 'Photos' },
      { number: 7, label: 'Contact' },
    ];
    
    return (
      <div className="step-indicator">
        {steps.map((step) => (
          <div 
            key={step.number} 
            className={`step ${activeStep === step.number ? 'active' : ''} ${activeStep > step.number ? 'completed' : ''}`}
          >
            <div className="step-number">{step.number}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderForm = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="form-step">
            <h3>Basic Information</h3>
            <p className="step-description">Start with the basic details about your property</p>
            
            <div className="form-group">
              <label htmlFor="title">
                Listing Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Cozy Studio Apartment Near Dhaka University"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <div className="error-message">{errors.title}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="propertyType">
                Property Type <span className="required">*</span>
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className={errors.propertyType ? 'error' : ''}
              >
                <option value="">Select property type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
                <option value="hostel">Hostel</option>
                <option value="dormitory">Dormitory</option>
                <option value="sublet">Sublet</option>
              </select>
              {errors.propertyType && <div className="error-message">{errors.propertyType}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property in detail. Include information about the space, neighborhood, and any special features."
                rows="5"
                className={errors.description ? 'error' : ''}
              ></textarea>
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="form-step">
            <h3>Location Details</h3>
            <p className="step-description">Where is your property located?</p>
            
            <div className="form-group">
              <label htmlFor="district">
                District <span className="required">*</span>
              </label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={errors.district ? 'error' : ''}
              >
                <option value="">Select district</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Gazipur">Gazipur</option>
                <option value="Narayanganj">Narayanganj</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Cox's Bazar">Cox's Bazar</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barisal">Barisal</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
              {errors.district && <div className="error-message">{errors.district}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="area">
                Area/Neighborhood <span className="required">*</span>
              </label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g., Dhanmondi, Gulshan, Uttara"
                className={errors.area ? 'error' : ''}
              />
              {errors.area && <div className="error-message">{errors.area}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="address">
                Full Address <span className="required">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter the complete address of your property"
                rows="3"
                className={errors.address ? 'error' : ''}
              ></textarea>
              {errors.address && <div className="error-message">{errors.address}</div>}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="form-step">
            <h3>Pricing & Availability</h3>
            <p className="step-description">Set your rental price and availability period</p>
            
            <div className="form-group">
              <label htmlFor="price">
                Monthly Rent (৳) <span className="required">*</span>
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 5000"
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <div className="error-message">{errors.price}</div>}
              <div className="form-hint">Enter amount in Bangladeshi Taka (৳)</div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="availableFrom">
                  Available From <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="availableFrom"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  className={errors.availableFrom ? 'error' : ''}
                />
                {errors.availableFrom && <div className="error-message">{errors.availableFrom}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="availableTo">
                  Available To <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="availableTo"
                  name="availableTo"
                  value={formData.availableTo}
                  onChange={handleChange}
                  className={errors.availableTo ? 'error' : ''}
                />
                {errors.availableTo && <div className="error-message">{errors.availableTo}</div>}
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="form-step">
            <h3>Property Details</h3>
            <p className="step-description">Tell us more about your property features</p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms">
                  Bedrooms <span className="required">*</span>
                </label>
                <select
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className={errors.bedrooms ? 'error' : ''}
                >
                  <option value="">Select</option>
                  <option value="0">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5+">5+ Bedrooms</option>
                </select>
                {errors.bedrooms && <div className="error-message">{errors.bedrooms}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="bathrooms">
                  Bathrooms <span className="required">*</span>
                </label>
                <select
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className={errors.bathrooms ? 'error' : ''}
                >
                  <option value="">Select</option>
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4+">4+ Bathrooms</option>
                </select>
                {errors.bathrooms && <div className="error-message">{errors.bathrooms}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="squareFeet">
                  Square Feet
                </label>
                <input
                  type="number"
                  id="squareFeet"
                  name="squareFeet"
                  value={formData.squareFeet}
                  onChange={handleChange}
                  placeholder="e.g., 800"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="furnishing">
                  Furnishing
                </label>
                <select
                  id="furnishing"
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                >
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-furnished</option>
                  <option value="fully-furnished">Fully furnished</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="form-step">
            <h3>Amenities & Features</h3>
            <p className="step-description">Select the amenities available at your property</p>
            
            <div className="amenities-grid">
              <label className="amenity-checkbox">
                <input
                  type="checkbox"
                  name="amenities.wifi"
                  checked={formData.amenities.wifi}
                  onChange={handleChange}
                />
                <div className="amenity-icon">📶</div>
                <span>WiFi</span>
              </label>
              
              <label className="amenity-checkbox">
                <input
                  type="checkbox"
                  name="amenities.ac"
                  checked={formData.amenities.ac}
                  onChange={handleChange}
                />
                <div className="amenity-icon">❄️</div>
                <span>Air Conditioning</span>
              </label>
              
              <label className="amenity-checkbox">
                <input
                  type="checkbox"
                  name="amenities.parking"
                  checked={formData.amenities.parking}
                  onChange={handleChange}
                />
                <div className="amenity-icon">🅿️</div>
                <span>Parking</span>
              </label>
              
              <label className="amenity-checkbox">
                <input
                  type="checkbox"
                  name="amenities.kitchen"
                  checked={formData.amenities.kitchen}
                  onChange={handleChange}
                />
                <div className="amenity-icon">🍳</div>
                <span>Kitchen</span>
              </label>
              
              <label className="amenity-checkbox">
                <input
                  type="checkbox"
                  name="amenities.laundry"
                  checked={formData.amenities.laundry}
                  onChange={handleChange}
                />
                <div className="amenity-icon">🧺</div>
                <span>Laundry</span>
              </label>
              
              <label className="amenity-checkbox">
                <input
                  type="checkbox"
                  name="amenities.studyArea"
                  checked={formData.amenities.studyArea}
                  onChange={handleChange}
                />
                <div className="amenity-icon">📚</div>
                <span>Study Area</span>
              </label>
              
              <label className="amenity-checkbox">
                <input
                  type="checkbox"
                  name="amenities.securityGuard"
                  checked={formData.amenities.securityGuard}
                  onChange={handleChange}
                />
                <div className="amenity-icon">💂</div>
                <span>Security Guard</span>
              </label>
              
              <label className="amenity-checkbox">
                <input
                  type="checkbox"
                  name="amenities.cctv"
                  checked={formData.amenities.cctv}
                  onChange={handleChange}
                />
                <div className="amenity-icon">📹</div>
                <span>CCTV</span>
              </label>
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="form-step">
            <h3>Photos & Media</h3>
            <p className="step-description">Upload photos of your property (max 10 photos)</p>
            
            <div className="photo-upload-container">
              <label className="photo-upload-label">
                <input
                  type="file"
                  name="photos"
                  onChange={handleChange}
                  accept="image/*"
                  multiple
                  disabled={formData.photos.length >= 10}
                  className="photo-input"
                />
                <div className="upload-icon">📷</div>
                <span>Click to upload photos</span>
                <span className="upload-hint">Maximum 10 photos, JPEG or PNG format</span>
              </label>
            </div>
            
            {previewImages.length > 0 && (
              <div className="photo-preview-container">
                <h4>Uploaded Photos ({previewImages.length}/10)</h4>
                <div className="photo-grid">
                  {previewImages.map((image, index) => (
                    <div key={index} className="photo-preview">
                      <img src={image.url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 7:
        return (
          <div className="form-step">
            <h3>Contact Information</h3>
            <p className="step-description">How can potential tenants reach you?</p>
            
            <div className="form-group">
              <label htmlFor="contactName">
                Contact Person <span className="required">*</span>
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Your full name"
                className={errors.contactName ? 'error' : ''}
              />
              {errors.contactName && <div className="error-message">{errors.contactName}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="contactPhone">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="e.g., 01712345678"
                className={errors.contactPhone ? 'error' : ''}
              />
              {errors.contactPhone && <div className="error-message">{errors.contactPhone}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="contactEmail">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="Your email address"
                className={errors.contactEmail ? 'error' : ''}
              />
              {errors.contactEmail && <div className="error-message">{errors.contactEmail}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="contactWhatsapp">
                WhatsApp Number (Optional)
              </label>
              <input
                type="tel"
                id="contactWhatsapp"
                name="contactWhatsapp"
                value={formData.contactWhatsapp}
                onChange={handleChange}
                placeholder="e.g., 01712345678"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label terms-checkbox">
                <input
                  type="checkbox"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleChange}
                  className={errors.termsAgreed ? 'error' : ''}
                />
                <span>
                  I agree to the <a href="#" className="terms-link">Terms and Conditions</a> and confirm that all information provided is accurate.
                </span>
              </label>
              {errors.termsAgreed && <div className="error-message">{errors.termsAgreed}</div>}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      
      <div className="provide-service-page">
        <div className="page-header">
          <div className="container">
            <h1>List Your Property</h1>
            <p className="page-subtitle">
              Share your space with verified tenants across Bangladesh
            </p>
          </div>
        </div>
        
        <div className="container">
          <div className="form-container">
            {renderStepIndicator()}
            
            <form onSubmit={activeStep === 7 ? handleSubmit : e => e.preventDefault()}>
              {renderForm()}
              
              <div className="form-navigation">
                {activeStep > 1 && (
                  <button
                    type="button"
                    className="back-button"
                    onClick={prevStep}
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                )}
                
                {activeStep < 7 ? (
                  <button
                    type="button"
                    className="next-button"
                    onClick={nextStep}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Listing'}
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="help-section">
            <div className="help-card">
              <div className="help-icon">❓</div>
              <h3>Need Help?</h3>
              <p>If you have any questions or need assistance with your listing, our support team is here to help.</p>
              <a href="#" className="help-link">Contact Support</a>
            </div>
            
            <div className="help-card">
              <div className="help-icon">📝</div>
              <h3>Listing Tips</h3>
              <ul className="tips-list">
                <li>Add high-quality photos to attract more tenants</li>
                <li>Be detailed and honest in your property description</li>
                <li>Set a competitive price based on location and amenities</li>
                <li>Respond quickly to inquiries to increase your chances</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ProvideService; 