import React from 'react';
import { paymentMethods, banks } from '../data/paymentData';

const PaymentMethodStep = ({ 
  paymentMethod, 
  paymentDetails, 
  errors, 
  handleInputChange, 
  setPaymentMethod,
  totalAmount 
}) => {
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

  return (
    <div className="form-step">
      <h3>Payment Method</h3>
      <p className="step-description">Choose your preferred payment method</p>
      
      <div className="payment-methods">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-method ${paymentMethod === method.id ? 'selected' : ''} ${method.popular ? 'popular' : ''}`}
            onClick={() => setPaymentMethod(method.id)}
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
                checked={paymentMethod === method.id}
                onChange={() => {}}
              />
            </div>
          </div>
        ))}
      </div>

      {paymentMethod === 'mobile_banking' && (
        <div className="payment-details">
          <h4>bKash Payment Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mobileNumber">bKash Number *</label>
              <input
                type="tel"
                id="mobileNumber"
                value={paymentDetails.mobileNumber}
                onChange={(e) => handleInputChange('paymentDetails', 'mobileNumber', e.target.value)}
                className={errors.mobileNumber ? 'error' : ''}
                placeholder="01XXXXXXXXX"
              />
              {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="transactionId">bKash Transaction ID *</label>
              <input
                type="text"
                id="transactionId"
                value={paymentDetails.transactionId}
                onChange={(e) => handleInputChange('paymentDetails', 'transactionId', e.target.value)}
                className={errors.transactionId ? 'error' : ''}
                placeholder="Enter bKash transaction ID"
              />
              {errors.transactionId && <span className="error-message">{errors.transactionId}</span>}
            </div>
          </div>
          <div className="payment-instructions">
            <h5>How to pay with bKash:</h5>
            <ol>
              <li>Open your bKash app</li>
              <li>Send ৳{totalAmount} to: <strong>01XXXXXXXXX</strong></li>
              <li>Use "NestUp BD" as reference</li>
              <li>Copy the transaction ID from bKash</li>
              <li>Paste the transaction ID above</li>
              <li>Click "Proceed to Payment"</li>
            </ol>
            <div className="bkash-note">
              <p><strong>Note:</strong> Only bKash payments are accepted for mobile banking. Please ensure you have sufficient balance in your bKash account.</p>
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'bank_transfer' && (
        <div className="payment-details">
          <h4>Bank Transfer Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bankName">Bank Name *</label>
              <select
                id="bankName"
                value={paymentDetails.bankName}
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
                value={paymentDetails.accountNumber}
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
              <p><strong>Amount:</strong> ৳{totalAmount}</p>
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'credit_card' && (
        <div className="payment-details">
          <h4>Card Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number *</label>
              <input
                type="text"
                id="cardNumber"
                value={paymentDetails.cardNumber}
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
                value={paymentDetails.cardHolderName}
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
                value={paymentDetails.cardExpiry}
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
                value={paymentDetails.cardCVV}
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

      {paymentMethod === 'cash' && (
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
      )}
    </div>
  );
};

export default PaymentMethodStep; 