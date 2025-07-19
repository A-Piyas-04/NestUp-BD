import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState({
    propertyDetails: location.state?.propertyDetails || {
      title: 'Student Studio Apartment',
      location: 'Dhanmondi, Dhaka',
      price: '৳7,500',
      duration: '6 months',
      totalAmount: '৳45,000',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    paymentMethod: 'mobile_banking',
    paymentDetails: {
      mobileNumber: '',
      transactionId: '',
      bankName: '',
      accountNumber: '',
      cardNumber: '',
      cardExpiry: '',
      cardCVV: '',
      cardHolderName: ''
    },
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      nidNumber: '',
      address: ''
    },
    termsAccepted: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    {
      id: 'mobile_banking',
      name: 'Mobile Banking',
      icon: '📱',
      description: 'bKash, Nagad, Rocket, Upay',
      popular: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Direct bank transfer',
      popular: false
    },
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Visa, Mastercard, American Express',
      popular: false
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: '💰',
      description: 'Pay at our office',
      popular: false
    }
  ];

  const banks = [
    'Sonali Bank',
    'Rupali Bank',
    'Agrani Bank',
    'Janata Bank',
    'BRAC Bank',
    'City Bank',
    'Eastern Bank',
    'Prime Bank',
    'Pubali Bank',
    'UCB Bank',
    'Dhaka Bank',
    'Mercantile Bank',
    'National Bank',
    'Standard Bank',
    'One Bank',
    'Premier Bank',
    'Trust Bank',
    'Mutual Trust Bank',
    'First Security Bank',
    'Bank Asia'
  ];

  const handleInputChange = (section, field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!paymentData.personalInfo.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!paymentData.personalInfo.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(paymentData.personalInfo.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!paymentData.personalInfo.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^(\+880|880|0)?1[3-9]\d{8}$/.test(paymentData.personalInfo.phone)) {
        newErrors.phone = 'Please enter a valid Bangladeshi phone number';
      }
      if (!paymentData.personalInfo.nidNumber.trim()) {
        newErrors.nidNumber = 'NID number is required';
      }
      if (!paymentData.personalInfo.address.trim()) {
        newErrors.address = 'Address is required';
      }
    }

    if (step === 2) {
      if (paymentData.paymentMethod === 'mobile_banking') {
        if (!paymentData.paymentDetails.mobileNumber.trim()) {
          newErrors.mobileNumber = 'Mobile number is required';
        } else if (!/^(\+880|880|0)?1[3-9]\d{8}$/.test(paymentData.paymentDetails.mobileNumber)) {
          newErrors.mobileNumber = 'Please enter a valid mobile number';
        }
        if (!paymentData.paymentDetails.transactionId.trim()) {
          newErrors.transactionId = 'Transaction ID is required';
        }
      } else if (paymentData.paymentMethod === 'bank_transfer') {
        if (!paymentData.paymentDetails.bankName.trim()) {
          newErrors.bankName = 'Bank name is required';
        }
        if (!paymentData.paymentDetails.accountNumber.trim()) {
          newErrors.accountNumber = 'Account number is required';
        }
      } else if (paymentData.paymentMethod === 'credit_card') {
        if (!paymentData.paymentDetails.cardNumber.trim()) {
          newErrors.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(paymentData.paymentDetails.cardNumber.replace(/\s/g, ''))) {
          newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        }
        if (!paymentData.paymentDetails.cardExpiry.trim()) {
          newErrors.cardExpiry = 'Expiry date is required';
        }
        if (!paymentData.paymentDetails.cardCVV.trim()) {
          newErrors.cardCVV = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(paymentData.paymentDetails.cardCVV)) {
          newErrors.cardCVV = 'Please enter a valid CVV';
        }
        if (!paymentData.paymentDetails.cardHolderName.trim()) {
          newErrors.cardHolderName = 'Card holder name is required';
        }
      }
    }

    if (step === 3) {
      if (!paymentData.termsAccepted) {
        newErrors.terms = 'You must accept the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePayment = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // In a real app, you would handle the payment response here
      alert('Payment successful! You will receive a confirmation email shortly.');
      navigate('/dashboard');
    }, 3000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map((step) => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
          <div className="step-number">{currentStep > step ? '✓' : step}</div>
          <span className="step-label">
            {step === 1 ? 'Personal Info' : step === 2 ? 'Payment Method' : 'Confirmation'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="form-step">
      <h3>Personal Information</h3>
      <p className="step-description">Please provide your details for booking confirmation</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            value={paymentData.personalInfo.fullName}
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
            value={paymentData.personalInfo.email}
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
            value={paymentData.personalInfo.phone}
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
            value={paymentData.personalInfo.nidNumber}
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
          value={paymentData.personalInfo.address}
          onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
          className={errors.address ? 'error' : ''}
          placeholder="Enter your complete address"
          rows="3"
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>
    </div>
  );

  const renderPaymentMethod = () => (
    <div className="form-step">
      <h3>Payment Method</h3>
      <p className="step-description">Choose your preferred payment method</p>
      
      <div className="payment-methods">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-method ${paymentData.paymentMethod === method.id ? 'selected' : ''} ${method.popular ? 'popular' : ''}`}
            onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: method.id }))}
          >
            <div className="method-icon">{method.icon}</div>
            <div className="method-info">
              <h4>{method.name}</h4>
              <p>{method.description}</p>
              {method.popular && <span className="popular-badge">Most Popular</span>}
            </div>
            <div className="method-radio">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentData.paymentMethod === method.id}
                onChange={() => {}}
              />
            </div>
          </div>
        ))}
      </div>

      {paymentData.paymentMethod === 'mobile_banking' && (
        <div className="payment-details">
          <h4>Mobile Banking Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number *</label>
              <input
                type="tel"
                id="mobileNumber"
                value={paymentData.paymentDetails.mobileNumber}
                onChange={(e) => handleInputChange('paymentDetails', 'mobileNumber', e.target.value)}
                className={errors.mobileNumber ? 'error' : ''}
                placeholder="01XXXXXXXXX"
              />
              {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="transactionId">Transaction ID *</label>
              <input
                type="text"
                id="transactionId"
                value={paymentData.paymentDetails.transactionId}
                onChange={(e) => handleInputChange('paymentDetails', 'transactionId', e.target.value)}
                className={errors.transactionId ? 'error' : ''}
                placeholder="Enter transaction ID"
              />
              {errors.transactionId && <span className="error-message">{errors.transactionId}</span>}
            </div>
          </div>
          <div className="payment-instructions">
            <h5>How to pay:</h5>
            <ol>
              <li>Send ৳{paymentData.propertyDetails.totalAmount} to: <strong>01XXXXXXXXX</strong></li>
              <li>Use "NestUp BD" as reference</li>
              <li>Copy the transaction ID and paste it above</li>
              <li>Click "Proceed to Payment"</li>
            </ol>
          </div>
        </div>
      )}

      {paymentData.paymentMethod === 'bank_transfer' && (
        <div className="payment-details">
          <h4>Bank Transfer Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bankName">Bank Name *</label>
              <select
                id="bankName"
                value={paymentData.paymentDetails.bankName}
                onChange={(e) => handleInputChange('paymentDetails', 'bankName', e.target.value)}
                className={errors.bankName ? 'error' : ''}
              >
                <option value="">Select Bank</option>
                {banks.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
              {errors.bankName && <span className="error-message">{errors.bankName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="accountNumber">Account Number *</label>
              <input
                type="text"
                id="accountNumber"
                value={paymentData.paymentDetails.accountNumber}
                onChange={(e) => handleInputChange('paymentDetails', 'accountNumber', e.target.value)}
                className={errors.accountNumber ? 'error' : ''}
                placeholder="Enter account number"
              />
              {errors.accountNumber && <span className="error-message">{errors.accountNumber}</span>}
            </div>
          </div>
          <div className="payment-instructions">
            <h5>Bank Account Details:</h5>
            <div className="bank-details">
              <p><strong>Account Name:</strong> NestUp BD Ltd.</p>
              <p><strong>Account Number:</strong> 1234567890</p>
              <p><strong>Bank:</strong> BRAC Bank</p>
              <p><strong>Branch:</strong> Dhanmondi</p>
              <p><strong>Amount:</strong> ৳{paymentData.propertyDetails.totalAmount}</p>
            </div>
          </div>
        </div>
      )}

      {paymentData.paymentMethod === 'credit_card' && (
        <div className="payment-details">
          <h4>Card Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number *</label>
              <input
                type="text"
                id="cardNumber"
                value={paymentData.paymentDetails.cardNumber}
                onChange={(e) => handleInputChange('paymentDetails', 'cardNumber', formatCardNumber(e.target.value))}
                className={errors.cardNumber ? 'error' : ''}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="cardHolderName">Card Holder Name *</label>
              <input
                type="text"
                id="cardHolderName"
                value={paymentData.paymentDetails.cardHolderName}
                onChange={(e) => handleInputChange('paymentDetails', 'cardHolderName', e.target.value)}
                className={errors.cardHolderName ? 'error' : ''}
                placeholder="As printed on card"
              />
              {errors.cardHolderName && <span className="error-message">{errors.cardHolderName}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cardExpiry">Expiry Date *</label>
              <input
                type="text"
                id="cardExpiry"
                value={paymentData.paymentDetails.cardExpiry}
                onChange={(e) => handleInputChange('paymentDetails', 'cardExpiry', formatExpiry(e.target.value))}
                className={errors.cardExpiry ? 'error' : ''}
                placeholder="MM/YY"
                maxLength="5"
              />
              {errors.cardExpiry && <span className="error-message">{errors.cardExpiry}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="cardCVV">CVV *</label>
              <input
                type="text"
                id="cardCVV"
                value={paymentData.paymentDetails.cardCVV}
                onChange={(e) => handleInputChange('paymentDetails', 'cardCVV', e.target.value)}
                className={errors.cardCVV ? 'error' : ''}
                placeholder="123"
                maxLength="4"
              />
              {errors.cardCVV && <span className="error-message">{errors.cardCVV}</span>}
            </div>
          </div>
        </div>
      )}

      {paymentData.paymentMethod === 'cash' && (
        <div className="payment-details">
          <h4>Cash Payment</h4>
          <div className="payment-instructions">
            <h5>Visit our office to complete payment:</h5>
            <div className="office-details">
              <p><strong>Address:</strong> House #123, Road #5, Dhanmondi, Dhaka-1205</p>
              <p><strong>Phone:</strong> +880 1234-567890</p>
              <p><strong>Hours:</strong> Sunday-Thursday, 9:00 AM - 6:00 PM</p>
              <p><strong>Amount to pay:</strong> ৳{paymentData.propertyDetails.totalAmount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => (
    <div className="form-step">
      <h3>Review & Confirm</h3>
      <p className="step-description">Please review your booking details before proceeding</p>
      
      <div className="booking-summary">
        <div className="property-summary">
          <img src={paymentData.propertyDetails.image} alt={paymentData.propertyDetails.title} />
          <div className="property-info">
            <h4>{paymentData.propertyDetails.title}</h4>
            <p>📍 {paymentData.propertyDetails.location}</p>
            <p>📅 Duration: {paymentData.propertyDetails.duration}</p>
            <p className="total-amount">Total Amount: {paymentData.propertyDetails.totalAmount}</p>
          </div>
        </div>
        
        <div className="personal-summary">
          <h4>Personal Information</h4>
          <p><strong>Name:</strong> {paymentData.personalInfo.fullName}</p>
          <p><strong>Email:</strong> {paymentData.personalInfo.email}</p>
          <p><strong>Phone:</strong> {paymentData.personalInfo.phone}</p>
          <p><strong>NID:</strong> {paymentData.personalInfo.nidNumber}</p>
          <p><strong>Address:</strong> {paymentData.personalInfo.address}</p>
        </div>
        
        <div className="payment-summary">
          <h4>Payment Method</h4>
          <p><strong>Method:</strong> {paymentMethods.find(m => m.id === paymentData.paymentMethod)?.name}</p>
          {paymentData.paymentMethod === 'mobile_banking' && (
            <p><strong>Mobile:</strong> {paymentData.paymentDetails.mobileNumber}</p>
          )}
          {paymentData.paymentMethod === 'bank_transfer' && (
            <p><strong>Bank:</strong> {paymentData.paymentDetails.bankName}</p>
          )}
          {paymentData.paymentMethod === 'credit_card' && (
            <p><strong>Card:</strong> **** **** **** {paymentData.paymentDetails.cardNumber.slice(-4)}</p>
          )}
        </div>
      </div>
      
      <div className="terms-section">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="terms"
            checked={paymentData.termsAccepted}
            onChange={(e) => setPaymentData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
          />
          <label htmlFor="terms">
            I agree to the <a href="#" target="_blank">Terms and Conditions</a> and <a href="#" target="_blank">Privacy Policy</a>
          </label>
        </div>
        {errors.terms && <span className="error-message">{errors.terms}</span>}
      </div>
    </div>
  );

  return (
    <div>
      <Header />
      
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-header">
            <h1>Complete Your Booking</h1>
            <p>Secure payment gateway for Bangladesh</p>
          </div>
          
          {renderStepIndicator()}
          
          <div className="payment-content">
            <div className="payment-form">
              {currentStep === 1 && renderPersonalInfo()}
              {currentStep === 2 && renderPaymentMethod()}
              {currentStep === 3 && renderConfirmation()}
              
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button type="button" className="back-button" onClick={prevStep}>
                    ← Back
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button type="button" className="next-button" onClick={nextStep}>
                    Next Step →
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="pay-button" 
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing Payment...' : `Pay ${paymentData.propertyDetails.totalAmount}`}
                  </button>
                )}
              </div>
            </div>
            
            <div className="payment-sidebar">
              <div className="booking-card">
                <h3>Booking Summary</h3>
                <div className="property-card">
                  <img src={paymentData.propertyDetails.image} alt={paymentData.propertyDetails.title} />
                  <div className="property-details">
                    <h4>{paymentData.propertyDetails.title}</h4>
                    <p>📍 {paymentData.propertyDetails.location}</p>
                    <p>📅 {paymentData.propertyDetails.duration}</p>
                  </div>
                </div>
                
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Monthly Rent:</span>
                    <span>{paymentData.propertyDetails.price}</span>
                  </div>
                  <div className="price-row">
                    <span>Duration:</span>
                    <span>{paymentData.propertyDetails.duration}</span>
                  </div>
                  <div className="price-row total">
                    <span>Total Amount:</span>
                    <span>{paymentData.propertyDetails.totalAmount}</span>
                  </div>
                </div>
                
                <div className="security-badges">
                  <div className="security-badge">
                    <span>🔒</span>
                    <span>SSL Secured</span>
                  </div>
                  <div className="security-badge">
                    <span>🛡️</span>
                    <span>PCI Compliant</span>
                  </div>
                  <div className="security-badge">
                    <span>✅</span>
                    <span>Verified Gateway</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Payment; 