import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import PaymentStepIndicator from './components/PaymentStepIndicator';
import PersonalInfoStep from './components/PersonalInfoStep';
import PaymentMethodStep from './components/PaymentMethodStep';
import ConfirmationStep from './components/ConfirmationStep';
import PaymentSidebar from './components/PaymentSidebar';
import FormNavigation from './components/FormNavigation';
import { validateStep } from './utils/validation';
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

  const setPaymentMethod = (method) => {
    setPaymentData(prev => ({ ...prev, paymentMethod: method }));
  };

  const setTermsAccepted = (accepted) => {
    setPaymentData(prev => ({ ...prev, termsAccepted: accepted }));
  };

  const nextStep = () => {
    const newErrors = validateStep(currentStep, paymentData);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePayment = async () => {
    const newErrors = validateStep(currentStep, paymentData);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            personalInfo={paymentData.personalInfo}
            errors={errors}
            handleInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <PaymentMethodStep
            paymentMethod={paymentData.paymentMethod}
            paymentDetails={paymentData.paymentDetails}
            errors={errors}
            handleInputChange={handleInputChange}
            setPaymentMethod={setPaymentMethod}
            totalAmount={paymentData.propertyDetails.totalAmount}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            propertyDetails={paymentData.propertyDetails}
            personalInfo={paymentData.personalInfo}
            paymentMethod={paymentData.paymentMethod}
            paymentDetails={paymentData.paymentDetails}
            termsAccepted={paymentData.termsAccepted}
            errors={errors}
            setTermsAccepted={setTermsAccepted}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Header />
      
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-header">
            <h1>Complete Your Booking</h1>
            <p>Secure payment gateway for Bangladesh</p>
          </div>
          
          <PaymentStepIndicator currentStep={currentStep} />
          
          <div className="payment-content">
            <div className="payment-form">
              {renderCurrentStep()}
              
              <FormNavigation
                currentStep={currentStep}
                onPrevStep={prevStep}
                onNextStep={nextStep}
                onPayment={handlePayment}
                isProcessing={isProcessing}
                totalAmount={paymentData.propertyDetails.totalAmount}
              />
            </div>
            
            <PaymentSidebar propertyDetails={paymentData.propertyDetails} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Payment; 