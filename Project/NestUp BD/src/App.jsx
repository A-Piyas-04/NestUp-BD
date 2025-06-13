import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Other routes will be added later */}
          <Route path="*" element={<Home />} /> {/* Temporary fallback */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
