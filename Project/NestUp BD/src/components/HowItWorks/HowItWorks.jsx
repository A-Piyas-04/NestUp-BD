import './HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      number: '1️⃣',
      title: 'Search your city',
      description: 'Use filters to find services',
      color: '#e6f7ff'
    },
    {
      id: 2,
      number: '2️⃣',
      title: 'View verified listings',
      description: 'Trusted, rated providers',
      color: '#fff7e6'
    },
    {
      id: 3,
      number: '3️⃣',
      title: 'Book and pay',
      description: 'Seamless, in-app booking',
      color: '#f6ffed'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          {steps.map((step) => (
            <div className="step" key={step.id}>
              <div className="step-number" style={{ backgroundColor: step.color }}>
                {step.number}
              </div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;