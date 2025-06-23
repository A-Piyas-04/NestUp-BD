import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import LoginRegister from './pages/Auth/LoginRegister';
import Search from './pages/Search/Search';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} /> 
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/register" element={<LoginRegister />} />
          <Route path="*" element={<Home />} /> {/* fallback */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
