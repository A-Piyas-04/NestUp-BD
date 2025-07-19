import React from 'react';
import { paymentMethods } from '../data/paymentData';

const ConfirmationStep = ({ 
  propertyDetails, 
  personalInfo, 
  paymentMethod, 
  paymentDetails, 
  termsAccepted, 
  errors, 
  setTermsAccepted 
}) => {
  return (
    <div className="form-step">
      <h3>Review & Confirm</h3>
      <p className="step-description">Please review your booking details before proceeding</p>
      
      <div className="booking-summary">
        <div className="property-summary">
          <img src={propertyDetails.image} alt={propertyDetails.title} />
          <div className="property-info">
            <h4>{propertyDetails.title}</h4>
            <p>📍 {propertyDetails.location}</p>
            <p>📅 Duration: {propertyDetails.duration}</p>
            <p className="total-amount">Total Amount: {propertyDetails.totalAmount}</p>
          </div>
        </div>
        
        <div className="personal-summary">
          <h4>Personal Information</h4>
          <p><strong>Name:</strong> {personalInfo.fullName}</p>
          <p><strong>Email:</strong> {personalInfo.email}</p>
          <p><strong>Phone:</strong> {personalInfo.phone}</p>
          <p><strong>NID:</strong> {personalInfo.nidNumber}</p>
          <p><strong>Address:</strong> {personalInfo.address}</p>
        </div>
        
        <div className="payment-summary">
          <h4>Payment Method</h4>
          <p><strong>Method:</strong> {paymentMethods.find(m => m.id === paymentMethod)?.name}</p>
          {paymentMethod === 'mobile_banking' && (
            <p><strong>Mobile:</strong> {paymentDetails.mobileNumber}</p>
          )}
          {paymentMethod === 'bank_transfer' && (
            <p><strong>Bank:</strong> {paymentDetails.bankName}</p>
          )}
          {paymentMethod === 'credit_card' && (
            <p><strong>Card:</strong> **** **** **** {paymentDetails.cardNumber.slice(-4)}</p>
          )}
        </div>
      </div>
      
      <div className="terms-section">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <label htmlFor="terms">
            I agree to the <a href="#" target="_blank">Terms and Conditions</a> and <a href="#" target="_blank">Privacy Policy</a>
          </label>
        </div>
        {errors.terms && <span className="error-message">{errors.terms}</span>}
      </div>
    </div>
  );
};

export default ConfirmationStep; 