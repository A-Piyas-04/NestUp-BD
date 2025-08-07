import './ServiceCards.css';

const ServiceCards = () => {
  const services = [
    {
      id: 'housing',
      icon: '🏘️',
      title: 'Premium Housing',
      description: 'Discover verified accommodations from trusted hosts with flexible lease terms',
      link: '/search?service=housing',
      available: true
    },
    {
      id: 'transport',
      icon: '🚚',
      title: 'Relocation Transport',
      description: 'Book specialized moving vehicles with professional drivers',
      link: '/search?service=transport',
      available: false
    },
    {
      id: 'food',
      icon: '🍲',
      title: 'Meal Solutions',
      description: 'Access catering services and essential supplies for your new home',
      link: '/search?service=food',
      available: false
    }
  ];

  return (
    <section className="service-cards-section">
      <div className="container">
        <h2 className="section-title">Comprehensive Relocation Services</h2>
        <div className="service-cards">
          {services.map((service) => (
            <div className="service-card" key={service.id}>
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>

              {!service.available ? (
                <>
                  <div className="coming-soon-badge">Coming Soon</div>
                  <span className="not-available-text">In Development</span>
                </>
              ) : (
                <a href={service.link} className="service-link">Explore Options</a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;
