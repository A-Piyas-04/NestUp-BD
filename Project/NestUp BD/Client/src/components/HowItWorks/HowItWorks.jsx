import './HowItWorks.css';

const HowItWorks = () => {
  const seekerSteps = [
    {
      id: 'seeker-1',
      icon: '🔍',
      title: 'Browse & Filter',
      description: 'Find properties that match your exact requirements',
      color: 'white'
    },
    {
      id: 'seeker-2',
      icon: '📅',
      title: 'Schedule Viewings',
      description: 'Book appointments with verified property owners',
      color: 'white'
    },
    {
      id: 'seeker-3',
      icon: '📝',
      title: 'Secure Agreement',
      description: 'Complete paperwork through our secure platform',
      color: 'white'
    },
    {
      id: 'seeker-4',
      icon: '🔑',
      title: 'Move In',
      description: 'Enjoy your new space with peace of mind',
      color: 'white'
    }
  ];

  const providerSteps = [
    {
      id: 'provider-1',
      icon: '📸',
      title: 'List Property',
      description: 'Create detailed listings with high-quality photos',
      color: 'white'
    },
    {
      id: 'provider-2',
      icon: '📲',
      title: 'Respond to Inquiries',
      description: 'Manage communications through our secure messaging system',
      color: 'white'
    },
    {
      id: 'provider-3',
      icon: '📊',
      title: 'Screen Applicants',
      description: 'Review verified profiles and select ideal tenants',
      color: 'white'
    },
    {
      id: 'provider-4',
      icon: '💰',
      title: 'Receive Payments',
      description: 'Get timely, secure payments through our platform',
      color: 'white'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="section-title">Streamlined Experience</h2>
        
        <div className="workflow-container">
          {/* Service Seeker Journey */}
          <div className="workflow-row">
            <div className="workflow-header">
              <h3 className="workflow-title">For Property Seekers</h3>
            </div>
            <div className="workflow-steps">
              {seekerSteps.map((step, index) => (
                <div className="workflow-step" key={step.id}>
                  <div className="step-card" style={{ backgroundColor: step.color }}>
                    <div className="step-icon">{step.icon}</div>
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-description">{step.description}</p>
                  </div>
                  {index < seekerSteps.length - 1 && <div className="step-arrow"></div>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Service Provider Journey */}
          <div className="workflow-row">
            <div className="workflow-header">
              <h3 className="workflow-title">For Property Owners</h3>
            </div>
            <div className="workflow-steps">
              {providerSteps.map((step, index) => (
                <div className="workflow-step" key={step.id}>
                  <div className="step-card" style={{ backgroundColor: step.color }}>
                    <div className="step-icon">{step.icon}</div>
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-description">{step.description}</p>
                  </div>
                  {index < providerSteps.length - 1 && <div className="step-arrow"></div>}
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