import './TrustBadges.css';

const TrustBadges = () => {
  const badges = [
    {
      id: 'verified',
      icon: '✅',
      label: 'Verified Host'
    },
    {
      id: 'hygiene',
      icon: '🧼',
      label: 'Hygiene Badge'
    },
    {
      id: 'meal',
      icon: '🥣',
      label: 'Meal Included'
    },
    {
      id: 'emergency',
      icon: '🚨',
      label: 'Emergency Ride Available'
    }
  ];

  return (
    <section className="trust-badges-section">
      <div className="container">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="badges-container">
          {badges.map((badge) => (
            <div className="badge" key={badge.id}>
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-label">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;