import './ServiceCards.css';

const ServiceCards = () => {
  const services = [
    {
      id: 'housing',
      icon: '🏠',
      title: 'Housing',
      description: 'Verified short/long stay rooms',
      link: '/search?service=housing'
    },
    {
      id: 'transport',
      icon: '🚗',
      title: 'Transport',
      description: 'Book rides, vans & relocation vehicles',
      link: '/search?service=transport'
    },
    {
      id: 'food',
      icon: '🥗',
      title: 'Food & Water',
      description: 'Daily meals & water supply',
      link: '/search?service=food'
    }
  ];

  return (
    <section className="service-cards-section">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <div className="service-cards">
          {services.map((service) => (
            <div className="service-card" key={service.id}>
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <a href={service.link} className="service-link">Learn More</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;