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
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // No valid cookie, user is not authenticated
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
    }
    
    setLoading(false);
  };

  // On mount, fetch user data if token exists
  useEffect(() => {
    fetchUserData();
  }, []);

  /**
   * Logs in the user and fetches user data (cookies are set by server).
   * @param {string} token - Not used anymore, kept for compatibility
   * @param {string} name - Not used anymore, kept for compatibility
   */
  const login = async (token, name) => {
    // Cookies are set by the server during login
    // Just fetch user data to update the context
    await fetchUserData();
  };

  /**
   * Updates user data in context and optionally on server.
   * @param {object} userData
   * @param {boolean} saveToServer
   */
  const updateUser = async (userData, saveToServer = false) => {
    if (saveToServer) {
      try {
        const userResponse = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            name: userData.name || user.name,
            email: userData.email || user.email,
            ...userData // Include all other user fields directly
          })
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.text();
          console.error('Failed to update user info on server:', userResponse.status, errorData);
          return false;
        }

        // Fetch updated user data
        await fetchUserData();
        return true;
      } catch (error) {
        console.error('Error updating user:', error);
        return false;
      }
    } else {
      // Just update local state
      setUser(prev => ({ ...prev, ...userData }));
      return true;
    }
  };

  /**
   * Logs out the user and clears cookies.
   */
  const logout = async () => {
    try {
      // Call logout endpoint to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
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
