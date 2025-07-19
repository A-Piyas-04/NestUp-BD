export const validateStep = (step, paymentData) => {
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

  return newErrors;
}; 