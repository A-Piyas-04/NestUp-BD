import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home/Home';
import LoginRegister from './pages/Auth/LoginRegister';
import Search from './pages/Search/Search';
import Dashboard from './pages/Dashboard/Dashboard';

import NotFound from './pages/NotFound/NotFound';
import ProvideService from './pages/ProvideService/ProvideService';
import Payment from './pages/Payment/Payment';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}><Home /></motion.div>} />
        <Route path="/search" element={<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}><Search /></motion.div>} />
        <Route path="/dashboard/*" element={<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}><Dashboard /></motion.div>} />

        <Route path="/login" element={<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}><LoginRegister /></motion.div>} />
        <Route path="/register" element={<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}><LoginRegister /></motion.div>} />
        <Route path="/provide-service" element={<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}><ProvideService /></motion.div>} />
        <Route path="/payment" element={<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}><Payment /></motion.div>} />
        <Route path="/payment/:serviceId" element={<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}><Payment /></motion.div>} />
        <Route path="*" element={<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}><NotFound /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
