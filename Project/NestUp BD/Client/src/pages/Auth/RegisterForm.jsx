import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    // Validate required fields
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
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
        localStorage.setItem('userName', data.user.name);
        await login(data.token, data.user.name);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
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

      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;