import React from 'react';

const PaymentHistory = () => {
  const paymentHistory = [
    {
      id: 1,
      transactionId: 'TXN-2024-001',
      nestName: 'Modern Apartment in Banani',
      hostName: 'Sarah Ahmed',
      amount: '৳45,000',
      paymentMethod: 'Credit Card',
      status: 'completed',
      date: '2024-02-01',
      description: '3 months rent payment'
    },
    {
      id: 2,
      transactionId: 'TXN-2024-002',
      nestName: 'Student Housing near DU',
      hostName: 'Rahim Khan',
      amount: '৳57,000',
      paymentMethod: 'Mobile Banking',
      status: 'completed',
      date: '2024-01-15',
      description: '6 months rent payment'
    },
    {
      id: 3,
      transactionId: 'TXN-2024-003',
      nestName: 'Cozy Room in Gulshan',
      hostName: 'Fatima Rahman',
      amount: '৳12,000',
      paymentMethod: 'Bank Transfer',
      status: 'completed',
      date: '2023-12-01',
      description: '1 month rent payment'
    },
    {
      id: 4,
      transactionId: 'TXN-2024-004',
      nestName: 'Studio in Dhanmondi',
      hostName: 'Ahmed Khan',
      amount: '৳8,000',
      paymentMethod: 'Credit Card',
      status: 'pending',
      date: '2024-02-15',
      description: '1 month rent payment'
    }
  ];

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

  const totalSpent = paymentHistory
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + parseInt(payment.amount.replace('৳', '').replace(',', '')), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Payment History</h1>
        <p>Track all your accommodation payments and transactions</p>
      </div>
      
      <div className="payment-summary">
        <div className="summary-card">
          <h3>Total Spent</h3>
          <div className="total-amount">৳{totalSpent.toLocaleString()}</div>
          <p>All time payments</p>
        </div>
        
        <div className="summary-card">
          <h3>Total Transactions</h3>
          <div className="transaction-count">{paymentHistory.length}</div>
          <p>Payment records</p>
        </div>
        
        <div className="summary-card">
          <h3>Pending Payments</h3>
          <div className="pending-count">
            {paymentHistory.filter(p => p.status === 'pending').length}
          </div>
          <p>Awaiting completion</p>
        </div>
      </div>
      
      <div className="payment-section">
        <div className="section-header">
          <h2>Transaction History</h2>
          <div className="filter-options">
            <select className="filter-select">
              <option value="all">All Transactions</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        
        <div className="transactions-list">
          {paymentHistory.map((transaction) => (
            <div key={transaction.id} className="transaction-card">
              <div className="transaction-header">
                <div className="transaction-info">
                  <h3>{transaction.nestName}</h3>
                  <p className="host-name">Hosted by {transaction.hostName}</p>
                  <p className="transaction-id">Transaction ID: {transaction.transactionId}</p>
                </div>
                <div className="transaction-amount">
                  <span className="amount">{transaction.amount}</span>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">{transaction.paymentMethod}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{transaction.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{transaction.description}</span>
                </div>
              </div>
              
              <div className="transaction-actions">
                <button className="btn-secondary">View Receipt</button>
                <button className="btn-secondary">Download Invoice</button>
                {transaction.status === 'pending' && (
                  <button className="btn-primary">Complete Payment</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory; 