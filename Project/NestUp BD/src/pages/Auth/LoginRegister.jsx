import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm.jsx';
import './LoginRegister.css';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      {/* ✅ Top-left button */}
      <button className="home-button" onClick={() => navigate('/')}>
        ← Back to Homepage
      </button>

      <div className="auth-card">
        <h2>{isLogin ? 'Login to Your Account' : 'Create a New Account'}</h2>
        {isLogin ? <LoginForm /> : <RegisterForm />}
        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;
