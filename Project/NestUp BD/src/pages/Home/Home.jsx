import Header from '../../components/Header/Header';
import HeroSection from '../../components/HeroSection/HeroSection';
import Footer from '../../components/Footer/Footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <main>
        <HeroSection />
        {/* Additional sections can be added here as the project grows */}
      </main>
      <Footer />
    </div>
  );
};

export default Home;