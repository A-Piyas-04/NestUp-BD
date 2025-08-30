import Header from '../../components/Header/Header';
import HeroSection from '../../components/HeroSection/HeroSection';
import ServiceCards from '../../components/ServiceCards/ServiceCards';
import HowItWorks from '../../components/HowItWorks/HowItWorks';

import Footer from '../../components/Footer/Footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Header />
<main>
  <HeroSection />
  <ServiceCards />
  <HowItWorks />
</main>
      <Footer />
    </div>
  );
};

export default Home;