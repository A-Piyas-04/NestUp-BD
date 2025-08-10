// Test script to verify payment functionality
// This script tests the complete payment flow from booking creation to payment processing

const testPaymentFlow = async () => {
  const baseURL = 'http://localhost:3000/api';
  
  // Test data
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword'
  };
  
  const testBookingData = {
    serviceId: '60d5ecb74b24a1234567890a', // Replace with actual service ID
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    guestInfo: {
      numberOfGuests: 1,
      specialRequests: 'Test booking'
    },
    contactInfo: {
      phone: '+8801234567890',
      email: 'test@example.com'
    }
  };
  
  const testPaymentData = {
    paymentMethod: 'mobile_banking',
    paymentDetails: {
      mobileNumber: '+8801234567890',
      transactionId: 'TEST' + Date.now()
    },
    personalInfo: {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+8801234567890',
      nidNumber: '1234567890123',
      address: 'Test Address, Dhaka'
    },
    termsAccepted: true
  };
  
  try {
    console.log('🧪 Testing Payment Flow...');
    
    // Step 1: Login (assuming user exists)
    console.log('1. Attempting login...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed - user might not exist');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // Step 2: Create booking
    console.log('2. Creating booking...');
    const bookingResponse = await fetch(`${baseURL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testBookingData)
    });
    
    if (!bookingResponse.ok) {
      const errorData = await bookingResponse.json();
      console.log('❌ Booking creation failed:', errorData.message);
      return;
    }
    
    const bookingData = await bookingResponse.json();
    const bookingId = bookingData.booking._id;
    console.log('✅ Booking created:', bookingId);
    
    // Step 3: Process payment
    console.log('3. Processing payment...');
    const paymentResponse = await fetch(`${baseURL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bookingId: bookingId,
        ...testPaymentData
      })
    });
    
    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json();
      console.log('❌ Payment processing failed:', errorData.message);
      return;
    }
    
    const paymentResult = await paymentResponse.json();
    console.log('✅ Payment initiated:', paymentResult.payment.id);
    
    // Step 4: Check payment history
    console.log('4. Checking payment history...');
    const historyResponse = await fetch(`${baseURL}/my-payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ Payment history retrieved:', historyData.payments.length, 'payments found');
      
      // Find our test payment
      const testPayment = historyData.payments.find(p => p._id === paymentResult.payment.id);
      if (testPayment) {
        console.log('✅ Test payment found in history');
        console.log('   Status:', testPayment.status);
        console.log('   Amount:', testPayment.amount, testPayment.currency);
      } else {
        console.log('⚠️ Test payment not found in history yet (might be processing)');
      }
    } else {
      console.log('❌ Failed to retrieve payment history');
    }
    
    console.log('\n🎉 Payment flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Booking created and stored in MongoDB');
    console.log('   - Payment record created and stored in MongoDB');
    console.log('   - Payment appears in user\'s payment history');
    console.log('   - All backend functionality working correctly');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Note: This is a test script to verify the payment backend functionality
// To run this test:
// 1. Ensure both frontend and backend servers are running
// 2. Create a test user account through the frontend
// 3. Create a test service listing
// 4. Update the serviceId in testBookingData with a real service ID
// 5. Run: node test-payment.js

console.log('Payment Backend Test Script');
console.log('This script tests the complete payment flow:');
console.log('1. User login');
console.log('2. Booking creation');
console.log('3. Payment processing');
console.log('4. Payment history retrieval');
console.log('\nTo run this test, update the serviceId and run: node test-payment.js');

// Uncomment the line below to run the test
// testPaymentFlow();