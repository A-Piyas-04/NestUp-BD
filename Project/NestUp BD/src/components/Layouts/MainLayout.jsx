import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <main className="min-h-screen pt-20 pb-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;