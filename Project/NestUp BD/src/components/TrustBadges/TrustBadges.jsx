import './TrustBadges.css';

const TrustBadges = () => {
  const badges = [
    {
      id: 'verified',
      icon: '✓',
      label: 'Verified Properties',
      description: 'All listings undergo a thorough verification process to ensure quality and safety'
    },
    {
      id: 'security',
      icon: '🔒',
      label: 'Secure Transactions',
      description: 'End-to-end encrypted payment system with fraud protection guarantees'
    },
    {
      id: 'support',
      icon: '📞',
      label: '24/7 Customer Support',
      description: 'Our dedicated support team is always available to assist with any issues'
    },
    {
      id: 'guarantee',
      icon: '🛡️',
      label: 'Satisfaction Guarantee',
      description: 'If a property doesn\'t meet our standards, we\'ll help you find a new one'
    }
  ];

  return (
    <section className="trust-badges-section">
      <div className="container">
        <h2 className="section-title">Your Trust Is Our Priority</h2>
        <div className="badges-container">
          {badges.map((badge) => (
            <div className="badge" key={badge.id}>
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-label">{badge.label}</span>
              <p className="badge-description">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;