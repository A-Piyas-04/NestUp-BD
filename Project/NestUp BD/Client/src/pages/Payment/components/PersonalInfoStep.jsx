import React from 'react';

const PersonalInfoStep = ({ personalInfo, errors, handleInputChange }) => {
  return (
    <div className="form-step">
      <h3>Personal Information</h3>
      <p className="step-description">Please provide your details for booking confirmation</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            value={personalInfo.fullName}
            onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
            className={errors.fullName ? 'error' : ''}
            placeholder="Enter your full name"
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            value={personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            className={errors.email ? 'error' : ''}
            placeholder="Enter your email"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            value={personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            className={errors.phone ? 'error' : ''}
            placeholder="01XXXXXXXXX"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="nidNumber">NID Number *</label>
          <input
            type="text"
            id="nidNumber"
            value={personalInfo.nidNumber}
            onChange={(e) => handleInputChange('personalInfo', 'nidNumber', e.target.value)}
            className={errors.nidNumber ? 'error' : ''}
            placeholder="Enter your NID number"
          />
          {errors.nidNumber && <span className="error-message">{errors.nidNumber}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address">Full Address *</label>
        <textarea
          id="address"
          value={personalInfo.address}
          onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
          className={errors.address ? 'error' : ''}
          placeholder="Enter your complete address"
          rows="3"
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>
    </div>
  );
};

export default PersonalInfoStep; 