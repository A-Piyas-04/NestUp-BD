import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPrompt.css';

const LoginPrompt = ({ message = "Please log in to access this feature" }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="login-prompt">
      <div className="login-prompt-content">
        <div className="login-prompt-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H11V21H5V3H13V9H21Z" fill="#6366f1"/>
            <path d="M16 10V12H22V10H16ZM16 14V16H22V14H16ZM16 18V20H22V18H16Z" fill="#6366f1"/>
          </svg>
        </div>
        <h3>Authentication Required</h3>
        <p>{message}</p>
        <button className="login-prompt-button" onClick={handleLoginClick}>
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;