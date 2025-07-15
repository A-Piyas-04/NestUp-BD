import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        // Store both token and user name
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', name);
        login(data.token, name);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <label>Full Name</label>
      <input 
        type="text" 
        placeholder="Your full name" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        required 
      />

      <label>Email</label>
      <input 
        type="email" 
        placeholder="Enter your email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required 
      />

      <label>Password</label>
      <input 
        type="password" 
        placeholder="Create a password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required 
      />

      <label>Confirm Password</label>
      <input 
        type="password" 
        placeholder="Re-enter password" 
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required 
      />

      <button type="submit" className="submit-button">Register</button>
    </form>
  );
};

export default RegisterForm;