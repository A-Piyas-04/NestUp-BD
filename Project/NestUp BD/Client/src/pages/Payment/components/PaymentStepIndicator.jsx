import React from 'react';

const PaymentStepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Payment Method' },
    { number: 3, label: 'Confirmation' }
  ];

  return (
    <div className="step-indicator">
      {steps.map((step) => (
        <div 
          key={step.number} 
          className={`step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
        >
          <div className="step-number">
            {currentStep > step.number ? '✓' : step.number}
          </div>
          <span className="step-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
};

export default PaymentStepIndicator; 