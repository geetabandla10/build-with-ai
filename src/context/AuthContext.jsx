import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Local storage sync error:", e);
      return null;
    }
  });

  const login = (credential) => {
    const decoded = jwtDecode(credential);
    const userData = {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const guestLogin = () => {
    const userData = {
      name: 'Guest User',
      email: 'guest@example.com',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
