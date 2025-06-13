import './HowItWorks.css';

const HowItWorks = () => {
  const seekerSteps = [
    {
      id: 'seeker-1',
      icon: '🔍',
      title: 'Searches Service',
      description: 'Find what you need with filters',
      color: '#e6f7ff'
    },
    {
      id: 'seeker-2',
      icon: '💳',
      title: 'Books & Pays',
      description: 'Secure, in-app transactions',
      color: '#e6f7ff'
    },
    {
      id: 'seeker-3',
      icon: '✅',
      title: 'Receives Service',
      description: 'Get quality assistance',
      color: '#e6f7ff'
    },
    {
      id: 'seeker-4',
      icon: '⭐',
      title: 'Rates Experience',
      description: 'Share your feedback',
      color: '#e6f7ff'
    }
  ];

  const providerSteps = [
    {
      id: 'provider-1',
      icon: '📝',
      title: 'Posts Gig',
      description: 'List your services',
      color: '#f0f7ff'
    },
    {
      id: 'provider-2',
      icon: '📋',
      title: 'Manages Requests',
      description: 'Accept and schedule jobs',
      color: '#f0f7ff'
    },
    {
      id: 'provider-3',
      icon: '🚚',
      title: 'Delivers Service',
      description: 'Provide quality work',
      color: '#f0f7ff'
    },
    {
      id: 'provider-4',
      icon: '📈',
      title: 'Builds Reputation',
      description: 'Grow your business',
      color: '#f0f7ff'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        
        <div className="workflow-container">
          {/* Service Seeker Journey */}
          <div className="workflow-row">
            <div className="workflow-header">
              <h3 className="workflow-title">Service Seeker Journey</h3>
            </div>
            <div className="workflow-steps">
              {seekerSteps.map((step, index) => (
                <div className="workflow-step" key={step.id}>
                  <div className="step-card" style={{ backgroundColor: step.color }}>
                    <div className="step-icon">{step.icon}</div>
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-description">{step.description}</p>
                  </div>
                  {index < seekerSteps.length - 1 && <div className="step-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Service Provider Journey */}
          <div className="workflow-row">
            <div className="workflow-header">
              <h3 className="workflow-title">Service Provider Journey</h3>
            </div>
            <div className="workflow-steps">
              {providerSteps.map((step, index) => (
                <div className="workflow-step" key={step.id}>
                  <div className="step-card" style={{ backgroundColor: step.color }}>
                    <div className="step-icon">{step.icon}</div>
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-description">{step.description}</p>
                  </div>
                  {index < providerSteps.length - 1 && <div className="step-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;