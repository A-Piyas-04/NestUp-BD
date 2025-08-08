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

  // Fetch user data from server
  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      setUser(null);
    }
    
    setLoading(false);
  };

  // On mount, fetch user data if token exists
  useEffect(() => {
    fetchUserData();
  }, []);

  /**
   * Logs in the user and saves token to localStorage, then fetches user data.
   * @param {string} token
   * @param {string} name
   */
  const login = async (token, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', name);
    
    // Fetch complete user data after login
    await fetchUserData();
  };

  /**
   * Updates user data in context and optionally on server.
   * @param {object} userData
   * @param {boolean} saveToServer
   */
  const updateUser = async (userData, saveToServer = false) => {
    if (saveToServer) {
      const token = localStorage.getItem('token');
      if (!token) return false;

      try {
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(userData)
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          return true;
        } else {
          console.error('Failed to update profile on server');
          return false;
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        return false;
      }
    } else {
      // Just update local state
      setUser(prev => ({ ...prev, ...userData }));
      return true;
    }
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
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 */
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
