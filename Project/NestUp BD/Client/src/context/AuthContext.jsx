// AuthContext.jsx
// Provides authentication state and actions to the app using React Context API.

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext provides user authentication state and actions.
 */
const AuthContext = createContext();

/**
 * AuthProvider wraps the app and manages authentication state.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for saved token and user info in localStorage
  useEffect(() => {
    // Check for saved token in localStorage
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (token && userName) {
      setUser({ name: userName });
    }
    
    setLoading(false);
  }, []);

  /**
   * Logs in the user and saves token/name to localStorage.
   * @param {string} token
   * @param {string} name
   */
  const login = (token, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', name);
    setUser({ name });
  };

  /**
   * Logs out the user and clears localStorage.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 */
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
