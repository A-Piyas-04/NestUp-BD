import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css'; // Ensure this import is present

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as = 'button',
  to,
  onClick,
  disabled = false,
  type = 'button',
  ...props
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${disabled ? 'btn-disabled' : ''} ${className}`;

  if (as === 'link' && to) {
    return (
      <Link to={to} className={buttonClass} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
