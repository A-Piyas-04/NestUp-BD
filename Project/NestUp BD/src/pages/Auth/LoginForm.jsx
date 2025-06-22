import React from 'react';

const LoginForm = () => {
  return (
    <form className="auth-form">
      <label>Email</label>
      <input type="email" placeholder="Enter your email" required />

      <label>Password</label>
      <input type="password" placeholder="Enter your password" required />

      <button type="submit" className="submit-button">Login</button>
    </form>
  );
};

export default LoginForm;