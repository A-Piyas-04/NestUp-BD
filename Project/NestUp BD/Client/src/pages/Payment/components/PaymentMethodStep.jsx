import React, { useEffect } from 'react';
import { paymentMethods } from '../data/paymentData';

const PaymentMethodStep = ({ 
  paymentMethod, 
  paymentDetails, 
  errors, 
  handleInputChange, 
  setPaymentMethod,
  totalAmount 
}) => {
  // Automatically select bKash as the default payment method
  useEffect(() => {
    if (!paymentMethod) {
      setPaymentMethod('bkash');
    }
  }, [paymentMethod, setPaymentMethod]);

  // Format mobile number for bKash
  const formatMobileNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('880')) {
      return cleaned;
    }
    if (cleaned.startsWith('01')) {
      return '880' + cleaned;
    }
    return cleaned;
  };

  const handlePaymentMethodChange = (methodId) => {
    setPaymentMethod(methodId);
  };

  const renderPaymentDetails = () => {
    if (paymentMethod === 'bkash') {
      return (
        <div className="payment-details">
          <h4>bKash Payment Details</h4>
          <div className="form-group">
            <label htmlFor="mobile">Mobile Number *</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={paymentDetails.mobile || ''}
              onChange={(e) => {
                const formatted = formatMobileNumber(e.target.value);
                handleInputChange('paymentDetails', 'mobile', formatted);
              }}
              placeholder="8801XXXXXXXXX"
              className={errors.mobile ? 'error' : ''}
            />
            {errors.mobile && <span className="error-message">{errors.mobile}</span>}
          </div>
          
          <div className="bkash-instructions">
            <h5>Payment Instructions:</h5>
            <ol>
              <li>Dial *247# from your mobile</li>
              <li>Select "Send Money"</li>
              <li>Enter Merchant Number: <strong>01XXXXXXXXX</strong></li>
              <li>Enter Amount: <strong>৳{totalAmount}</strong></li>
              <li>Enter your bKash PIN</li>
              <li>Copy the Transaction ID and enter below</li>
            </ol>
          </div>

          <div className="form-group">
            <label htmlFor="transactionId">Transaction ID *</label>
            <input
              type="text"
              id="transactionId"
              name="transactionId"
              value={paymentDetails.transactionId || ''}
              onChange={(e) => handleInputChange('paymentDetails', 'transactionId', e.target.value.toUpperCase())}
              placeholder="Enter bKash Transaction ID"
              className={errors.transactionId ? 'error' : ''}
            />
            {errors.transactionId && <span className="error-message">{errors.transactionId}</span>}
          </div>
        </div>
      );
    }

    if (paymentMethod === 'cash') {
      return (
        <div className="payment-details">
          <h4>Cash Payment</h4>
          <div className="payment-instructions">
            <h5>Visit our office to complete payment:</h5>
            <div className="office-details">
              <p><strong>Address:</strong> House #123, Road #5, Dhanmondi, Dhaka-1205</p>
              <p><strong>Phone:</strong> +880 1234-567890</p>
              <p><strong>Hours:</strong> Sunday-Thursday, 9:00 AM - 6:00 PM</p>
              <p><strong>Amount to pay:</strong> ৳{totalAmount}</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="form-step">
      <h3>Payment Method</h3>
      <p className="step-description">Choose your preferred payment method</p>
      
      <div className="payment-methods">
        {paymentMethods.map((method) => (
          <div 
            key={method.id}
            className={`payment-method ${
              paymentMethod === method.id ? 'selected' : ''
            } ${method.popular ? 'popular' : ''}`}
            onClick={() => handlePaymentMethodChange(method.id)}
          >
            <div className="method-icon">{method.icon}</div>
            <div className="method-info">
              <h4>{method.name}</h4>
              <p>{method.description}</p>
              {method.popular && <span className="popular-badge">Popular</span>}
            </div>
            <div className="method-radio">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={() => handlePaymentMethodChange(method.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {renderPaymentDetails()}
    </div>
  );
};

export default PaymentMethodStep;