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
      {/* Navigation button */}
      <button className="home-button" onClick={() => navigate('/')}>
        ← Return to Homepage
      </button>

      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Access your NestUp BD account to manage your properties and bookings' 
            : 'Join our community to find or list properties across Bangladesh'}
        </p>
        
        {isLogin ? <LoginForm /> : <RegisterForm />}
        
        <p className="toggle-text">
          {isLogin ? "New to NestUp BD?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;
