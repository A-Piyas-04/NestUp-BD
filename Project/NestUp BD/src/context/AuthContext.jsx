import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved token in localStorage
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (token && userName) {
      setUser({ name: userName });
    }
    
    setLoading(false);
  }, []);

  const login = (token, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', name);
    setUser({ name });
  };

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

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
