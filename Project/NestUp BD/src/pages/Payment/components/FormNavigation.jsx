import React from 'react';

const FormNavigation = ({ 
  currentStep, 
  onPrevStep, 
  onNextStep, 
  onPayment, 
  isProcessing, 
  totalAmount 
}) => {
  return (
    <div className="form-navigation">
      {currentStep > 1 && (
        <button type="button" className="back-button" onClick={onPrevStep}>
          ← Back
        </button>
      )}
      
      {currentStep < 3 ? (
        <button type="button" className="next-button" onClick={onNextStep}>
          Next Step →
        </button>
      ) : (
        <button 
          type="button" 
          className="pay-button" 
          onClick={onPayment}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing Payment...' : `Pay ${totalAmount}`}
        </button>
      )}
    </div>
  );
};

export default FormNavigation; 