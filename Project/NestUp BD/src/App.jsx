import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import LoginRegister from './pages/Auth/LoginRegister';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/register" element={<LoginRegister />} />
          {/* Other routes will be added later */}
          <Route path="*" element={<Home />} /> {/* Temporary fallback */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
