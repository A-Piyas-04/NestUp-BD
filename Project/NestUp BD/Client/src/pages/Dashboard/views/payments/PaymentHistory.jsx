import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import LoginPrompt from '../../../../components/LoginPrompt';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed filter state - all payments will be shown as completed
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalPayments: 0
  });

  // Fetch payment history from backend
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!user) {
          setError('Please log in to view your payment history');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/payments?page=1&limit=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in to view your payment history');
          } else {
            const errorText = await response.text();
            setError(`Failed to fetch payment history: ${errorText}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPaymentHistory(data.payments || []);
        setPagination(data.pagination || {
          current: 1,
          total: 1,
          count: 0,
          totalPayments: 0
        });
        // Store stats if available
        if (data.stats) {
          setPaymentHistory(prev => ({ ...prev, stats: data.stats }));
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err.message);
        setPaymentHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  // Format payment method display - use enhanced field if available
  const formatPaymentMethod = (payment) => {
    // Use paymentMethodDisplay from API if available
    if (payment.paymentMethodDisplay) {
      return payment.paymentMethodDisplay;
    }
    
    // Fallback to manual formatting
    const methodMap = {
      'mobile_banking': 'Mobile Banking',
      'bank_transfer': 'Bank Transfer',
      'credit_card': 'Credit Card',
      'cash': 'Cash'
    };
    return methodMap[payment.paymentMethod] || payment.paymentMethod;
  };

  // Format date display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Format amount display
  const formatAmount = (amount, currency = 'BDT') => {
    return `৳${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    // All payments are displayed as completed by default
    return <span className={`status-badge status-completed`}>Completed</span>;
  };

  // Use API stats if available, fallback to client calculation
  const paymentsArray = Array.isArray(paymentHistory) ? paymentHistory : [];
  const totalSpent = paymentHistory.stats?.totalSpent || paymentsArray
    .filter(payment => payment.status === 'completed' || payment.status === 'paid')
    .reduce((sum, payment) => sum + (payment.totalAmount || payment.amount), 0);
  const totalRefunded = paymentHistory.stats?.totalRefunded || 0;
  const netSpent = paymentHistory.stats?.netSpent || (totalSpent - totalRefunded);

  // Removed handleFilterChange function - no longer needed without filtering

  if (loading) {
    return (
      <div className="dashboard-page-container">
        <div className="dashboard-page-header">
          <h1>Payment History</h1>
          <p>Loading your payment history...</p>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    // Show login prompt for authentication errors
    if (error.includes('log in')) {
      return <LoginPrompt message={error} />;
    }
    
    return (
      <div className="dashboard-page-container">
        <div className="dashboard-page-header">
          <h1>Payment History</h1>
          <p>Error loading payment history</p>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-page-header">
        <h1>Payment History</h1>
        <p>Track all your accommodation payments and transactions</p>
      </div>
      
      <div className="payment-summary">

        
        {totalRefunded > 0 && (
          <div className="summary-card">
            <h3>Total Refunded</h3>
            <div className="refund-amount">{formatAmount(totalRefunded)}</div>
            <p>Refunded amount</p>
          </div>
        )}
      </div>
      
      <div className="payment-section">
        <div className="section-header">
          <h2>Transaction History</h2>
        </div>
        
        <div className="transactions-list">
          {paymentsArray.length === 0 ? (
            <div className="empty-state">
              <p>No payment history found.</p>
            </div>
          ) : (
            paymentsArray.map((payment) => (
              <div key={payment._id} className="transaction-card">
                <div className="transaction-header">
                  <div className="transaction-info">
                    <h3>{payment.booking?.service?.title || 'Property Booking'}</h3>
                    <p className="host-name">{payment.booking?.service?.location?.area}, {payment.booking?.service?.location?.district}</p>
                    <p className="host-info">Host: {payment.booking?.service?.owner?.name} ({payment.booking?.service?.owner?.email})</p>
                    <p className="transaction-id">
                      Transaction ID: {payment.formattedConfirmationNumber || payment.paymentDetails?.transactionId || payment._id.slice(-8)}
                    </p>
                  </div>
                  <div className="transaction-amount">
                    <span className="amount">{formatAmount(payment.totalAmount || payment.amount, payment.currency)}</span>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
                
                <div className="transaction-details">
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{formatPaymentMethod(payment)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(payment.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Booking Period:</span>
                    <span className="detail-value">
                      {payment.booking?.startDate && payment.booking?.endDate
                        ? `${formatDate(payment.booking.startDate)} - ${formatDate(payment.booking.endDate)}`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  {payment.processedAt && (
                    <div className="detail-row">
                      <span className="detail-label">Processed:</span>
                      <span className="detail-value">{formatDate(payment.processedAt)}</span>
                    </div>
                  )}
                  {payment.amountBreakdown && (
                    <div className="detail-row">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">
                        {formatAmount(payment.amountBreakdown.baseAmount)}
                      </span>
                    </div>
                  )}
                </div>
                

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;