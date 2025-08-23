import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
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
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Please login to view your payment history');
        }
        
        const response = await fetch(`/api/payments?status=${filter === 'all' ? '' : filter}&page=1&limit=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payment history');
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
  }, [user, filter]);

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
    const statusConfig = {
      completed: { text: 'Completed', class: 'status-completed' },
      pending: { text: 'Pending', class: 'status-pending' },
      failed: { text: 'Failed', class: 'status-failed' },
      refunded: { text: 'Refunded', class: 'status-refunded' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  // Use API stats if available, fallback to client calculation
  const paymentsArray = Array.isArray(paymentHistory) ? paymentHistory : [];
  const totalSpent = paymentHistory.stats?.totalSpent || paymentsArray
    .filter(payment => payment.status === 'completed' || payment.status === 'paid')
    .reduce((sum, payment) => sum + (payment.totalAmount || payment.amount), 0);
  const totalRefunded = paymentHistory.stats?.totalRefunded || 0;
  const netSpent = paymentHistory.stats?.netSpent || (totalSpent - totalRefunded);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Payment History</h1>
          <p>Loading your payment history...</p>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
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
    <div className="page-container">
      <div className="page-header">
        <h1>Payment History</h1>
        <p>Track all your accommodation payments and transactions</p>
      </div>
      
      <div className="payment-summary">
        <div className="summary-card">
          <h3>Net Spent</h3>
          <div className="total-amount">{formatAmount(netSpent)}</div>
          <p>After refunds</p>
        </div>
        
        <div className="summary-card">
          <h3>Total Transactions</h3>
          <div className="transaction-count">{paymentHistory.stats?.total || pagination.totalPayments || paymentsArray.length}</div>
          <p>Payment records</p>
        </div>
        
        <div className="summary-card">
          <h3>Pending Payments</h3>
          <div className="pending-count">
            {paymentHistory.stats?.pending || paymentsArray.filter(p => p.status === 'pending' || p.status === 'processing').length}
          </div>
          <p>Awaiting completion</p>
        </div>
        
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
          <div className="filter-options">
            <select className="filter-select" value={filter} onChange={handleFilterChange}>
              <option value="all">All Transactions</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        
        <div className="transactions-list">
          {paymentsArray.length === 0 ? (
            <div className="empty-state">
              <p>No payment history found.</p>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} className="btn-secondary">
                  View All Transactions
                </button>
              )}
            </div>
          ) : (
            paymentsArray.map((payment) => (
              <div key={payment._id} className="transaction-card">
                <div className="transaction-header">
                  <div className="transaction-info">
                    <h3>{payment.service?.title || 'Property Booking'}</h3>
                    <p className="host-name">{payment.service?.location?.area}, {payment.service?.location?.district}</p>
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
                
                <div className="transaction-actions">
                  <button className="btn-secondary">View Details</button>
                  {(payment.status === 'completed' || payment.status === 'paid') && (
                    <button className="btn-secondary">Download Receipt</button>
                  )}
                  {(payment.status === 'pending' || payment.status === 'processing') && (
                    <button className="btn-primary">Check Status</button>
                  )}
                  {payment.canBeRefunded && (
                    <button className="btn-secondary">Request Refund</button>
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