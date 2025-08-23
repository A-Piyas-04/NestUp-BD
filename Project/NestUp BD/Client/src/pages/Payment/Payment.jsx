// Payment.jsx
// Handles the multi-step payment process for property bookings.
// Steps: Personal Info -> Payment Method -> Confirmation
// Uses local state for form data and step navigation.

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
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

/**
 * Payment component for handling the booking payment process.
 * - Manages step navigation, form state, and validation.
 * - Integrates with child components for each step.
 */
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId: urlServiceId } = useParams();
  const { user } = useAuth();
  
  // Debug: Log what we received from navigation
  console.log('Payment component - location.state:', location.state);
  console.log('Payment component - propertyDetails:', location.state?.propertyDetails);
  console.log('Payment component - urlServiceId:', urlServiceId);
  
  // State for loading service details
  const [isLoadingService, setIsLoadingService] = useState(false);
  const [serviceError, setServiceError] = useState(null);

  // State for all payment-related data
  const [paymentData, setPaymentData] = useState({
    propertyDetails: location.state?.propertyDetails || {
      title: 'Student Studio Apartment',
      location: 'Dhanmondi, Dhaka',
      price: '৳7,500',
      duration: '6 months',
      totalAmount: '৳45,000',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      serviceId: urlServiceId || null,
      startDate: null,
      endDate: null
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

  // Current step in the payment process (1: Personal Info, 2: Payment Method, 3: Confirmation)
  const [currentStep, setCurrentStep] = useState(1);
  // Indicates if payment is being processed
  const [isProcessing, setIsProcessing] = useState(false);
  // Stores validation errors for the current step
  const [errors, setErrors] = useState({});

  // Fetch service details if serviceId is provided via URL but propertyDetails are incomplete
  useEffect(() => {
    const fetchServiceDetails = async () => {
      // Only fetch if we have serviceId from URL and no complete propertyDetails from state
      if (urlServiceId && (!location.state?.propertyDetails || !location.state.propertyDetails.title || location.state.propertyDetails.title === 'Student Studio Apartment')) {
        setIsLoadingService(true);
        setServiceError(null);
        
        try {
          const response = await fetch(`/api/services/${urlServiceId}`);
          if (!response.ok) {
            throw new Error('Service not found');
          }
          
          const service = await response.json();
          
          // Update paymentData with fetched service details
          setPaymentData(prev => ({
            ...prev,
            propertyDetails: {
              serviceId: service._id,
              title: service.title,
              location: `${service.location.area}, ${service.location.district}`,
              price: `৳${service.pricing.basePrice.toLocaleString()}`,
              duration: '1 month', // Default duration
              totalAmount: `৳${service.pricing.totalAmount.toLocaleString()}`,
              image: service.images?.[0] || service.thumbnail,
              startDate: service.availability.availableFrom,
              endDate: service.availability.availableTo,
              fees: service.pricing.fees
            }
          }));
        } catch (error) {
          console.error('Error fetching service details:', error);
          setServiceError('Failed to load service details. Please try again.');
        } finally {
          setIsLoadingService(false);
        }
      }
    };

    fetchServiceDetails();
  }, [urlServiceId, location.state]);

  /**
   * Handles input changes for nested form sections.
   * @param {string} section - The section of paymentData to update
   * @param {string} field - The field within the section
   * @param {any} value - The new value
   */
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

  /**
   * Sets the selected payment method.
   * @param {string} method
   */
  const setPaymentMethod = (method) => {
    setPaymentData(prev => ({ ...prev, paymentMethod: method }));
  };

  /**
   * Sets whether the user has accepted the terms.
   * @param {boolean} accepted
   */
  const setTermsAccepted = (accepted) => {
    setPaymentData(prev => ({ ...prev, termsAccepted: accepted }));
  };

  /**
   * Advances to the next step after validation.
   */
  const nextStep = () => {
    const newErrors = validateStep(currentStep, paymentData);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
    }
  };

  /**
   * Returns to the previous step.
   */
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  /**
   * Handles the final payment action with backend integration.
   */
  const handlePayment = async () => {
    const newErrors = validateStep(currentStep, paymentData);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (!user) {
      alert('Please log in to complete your booking.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Debug: Log payment data before validation
      console.log('handlePayment - paymentData:', paymentData);
      console.log('handlePayment - serviceId:', paymentData.propertyDetails.serviceId);
      
      // Validate serviceId before making the request
      if (!paymentData.propertyDetails.serviceId) {
        console.error('Service ID is missing from paymentData.propertyDetails');
        alert('Service ID is missing. This usually happens when navigating directly to the payment page. Please go back to the property listing and click "Book" again.');
        navigate('/search');
        return;
      }
      
      // Step 1: Create booking
      const token = localStorage.getItem('token');
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          serviceId: paymentData.propertyDetails.serviceId,
          startDate: paymentData.propertyDetails.startDate,
          endDate: paymentData.propertyDetails.endDate,
          guests: 1,
          specialRequests: '',
          personalInfo: {
            phone: paymentData.personalInfo.phone,
            email: paymentData.personalInfo.email,
            fullName: paymentData.personalInfo.fullName,
            nidNumber: paymentData.personalInfo.nidNumber,
            address: paymentData.personalInfo.address
          }
        })
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const bookingData = await bookingResponse.json();
      const bookingId = bookingData.booking._id;

      // Step 2: Process payment
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: bookingId,
          paymentMethod: paymentData.paymentMethod,
          paymentDetails: paymentData.paymentDetails,
          personalInfo: paymentData.personalInfo,
          termsAccepted: paymentData.termsAccepted
        })
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Payment processing failed');
      }

      const paymentResult = await paymentResponse.json();
      
      // Show success message with better UX
      const successMessage = `Payment initiated successfully!\n\nTransaction ID: ${paymentResult.payment.transactionId}\nAmount: ৳${paymentResult.payment.amount}\n\nYou will receive a confirmation email shortly.\nRedirecting to your dashboard...`;
      alert(successMessage);
      
      // Wait a moment for user to read the message, then redirect
      setTimeout(() => {
        navigate('/dashboard/booked-nests', { 
          state: { 
            paymentSuccess: true, 
            transactionId: paymentResult.payment.transactionId,
            amount: paymentResult.payment.amount
          } 
        });
      }, 1000);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Renders the current step's component.
   */
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

  // Show loading state while fetching service details
  if (isLoadingService) {
    return (
      <div>
        <Header />
        <div className="payment-page">
          <div className="payment-container">
            <div className="payment-header">
              <h1>Loading Service Details...</h1>
              <p>Please wait while we fetch the property information</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state if service fetch failed
  if (serviceError) {
    return (
      <div>
        <Header />
        <div className="payment-page">
          <div className="payment-container">
            <div className="payment-header">
              <h1>Error Loading Service</h1>
              <p>{serviceError}</p>
              <button 
                onClick={() => navigate('/search')} 
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

export default Payment; // Main export