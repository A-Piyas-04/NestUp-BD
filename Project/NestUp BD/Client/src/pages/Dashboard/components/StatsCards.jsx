import React, { useState, useEffect } from 'react';
import './StatsCards.css';

const StatsCards = () => {
  const [stats, setStats] = useState([
    {
      id: 'active-nests',
      title: 'Your Active Nests',
      value: '0',
      change: '',
      positive: true,
      icon: '🏠',
      color: 'blue'
    },
    {
      id: 'booked-nests',
      title: 'Booked Nests',
      value: '0',
      change: '',
      positive: true,
      icon: '📋',
      color: 'green'
    },
    {
      id: 'total-payments',
      title: 'Total Payments',
      value: '৳0',
      change: '',
      positive: true,
      icon: '💳',
      color: 'purple'
    },
    {
      id: 'completed-bookings',
      title: 'Completed Bookings',
      value: '0',
      change: '',
      positive: true,
      icon: '✅',
      color: 'red'
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user's services
        const servicesResponse = await fetch('/api/my-services', {
          credentials: 'include'
        });
        
        // Fetch user's bookings
        const bookingsResponse = await fetch('/api/bookings', {
          credentials: 'include'
        });
        
        // Fetch user's payments
        const paymentsResponse = await fetch('/api/payments', {
          credentials: 'include'
        });
        
        if (servicesResponse.ok && bookingsResponse.ok && paymentsResponse.ok) {
          const servicesData = await servicesResponse.json();
          const bookingsData = await bookingsResponse.json();
          const paymentsData = await paymentsResponse.json();
          
          const activeNests = servicesData.services?.length || 0;
          const bookedNests = bookingsData.bookings?.length || 0;
          const completedBookings = bookingsData.bookings?.filter(b => b.status === 'completed').length || 0;
          
          // Calculate total payments
          const totalPayments = paymentsData.payments?.reduce((sum, payment) => {
            return payment.status === 'completed' ? sum + payment.amount : sum;
          }, 0) || 0;
          
          setStats([
            {
              id: 'active-nests',
              title: 'Your Active Nests',
              value: activeNests.toString(),
              change: '',
              positive: true,
              icon: '🏠',
              color: 'blue'
            },
            {
              id: 'booked-nests',
              title: 'Booked Nests',
              value: bookedNests.toString(),
              change: '',
              positive: true,
              icon: '📋',
              color: 'green'
            },
            {
              id: 'total-payments',
              title: 'Total Payments',
              value: `৳${totalPayments.toLocaleString()}`,
              change: '',
              positive: true,
              icon: '💳',
              color: 'purple'
            },
            {
              id: 'completed-bookings',
              title: 'Completed Bookings',
              value: completedBookings.toString(),
              change: '',
              positive: true,
              icon: '✅',
              color: 'red'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-cards">
        {[1, 2, 3, 4].map((i) => (
          <div className="stat-card loading" key={i}>
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3 className="stat-value">Loading...</h3>
              <p className="stat-title">Fetching data</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-cards">
      {stats.map((stat) => (
        <div className={`stat-card ${stat.color}`} key={stat.id}>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <h3 className="stat-value">{stat.value}</h3>
            <p className="stat-title">{stat.title}</p>
            <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;