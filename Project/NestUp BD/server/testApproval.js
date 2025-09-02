import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testApproval() {
  try {
    // You'll need to get a valid token from the frontend or create one
    // For now, let's test without authentication to see the specific error
    const bookingId = '68b495677c59599530d2ece0';
    
    console.log('Testing booking approval for ID:', bookingId);
    
    const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail due to missing auth, but we'll see the error
      },
      body: JSON.stringify({ approvalReason: 'Test approval' })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
  } catch (error) {
    console.error('Error testing approval:', error);
  }
}

testApproval();