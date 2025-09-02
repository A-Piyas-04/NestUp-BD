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
  // Automatically select cash payment since it's the only option
  useEffect(() => {
    if (!paymentMethod) {
      setPaymentMethod('cash');
    }
  }, [paymentMethod, setPaymentMethod]);
  // No formatting functions needed for cash payment

  return (
    <div className="form-step">
      <h3>Payment Method</h3>
      <p className="step-description">Cash payment is the only available payment method</p>
      
      <div className="payment-methods">
        <div className="payment-method selected popular">
          <div className="method-icon">💰</div>
          <div className="method-info">
            <h4>Cash Payment</h4>
            <p>Pay at our office</p>
            <span className="popular-badge">Available Method</span>
          </div>
          <div className="method-radio">
            <input
              type="radio"
              name="paymentMethod"
              checked={true}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Only cash payment is available */}
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
    </div>
  );
};

export default PaymentMethodStep;