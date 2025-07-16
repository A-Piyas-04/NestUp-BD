import React from 'react';
import './StatsCards.css';

const StatsCards = () => {
  const stats = [
    {
      id: 'views',
      title: 'Profile Views',
      value: '124',
      change: '+12%',
      positive: true,
      icon: '👁️',
      color: 'blue'
    },
    {
      id: 'listings',
      title: 'Active Listings',
      value: '3',
      change: '+1',
      positive: true,
      icon: '🏠',
      color: 'green'
    },
    {
      id: 'messages',
      title: 'New Messages',
      value: '8',
      change: '+5',
      positive: true,
      icon: '✉️',
      color: 'purple'
    },
    {
      id: 'saved',
      title: 'Saved Properties',
      value: '12',
      change: '+2',
      positive: true,
      icon: '❤️',
      color: 'red'
    }
  ];

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