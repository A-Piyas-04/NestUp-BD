import React from 'react';

const RegisterForm = () => {
  return (
    <form className="auth-form">
      <label>Full Name</label>
      <input type="text" placeholder="Your full name" required />

      <label>Email</label>
      <input type="email" placeholder="Enter your email" required />

      <label>Password</label>
      <input type="password" placeholder="Create a password" required />

      <label>Confirm Password</label>
      <input type="password" placeholder="Re-enter password" required />

      <button type="submit" className="submit-button">Register</button>
    </form>
  );
};

export default RegisterForm;