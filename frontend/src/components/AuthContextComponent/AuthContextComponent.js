import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userLogged');
    setIsAuthenticated(false);
  }, []);

  const login = useCallback((token) => {
    localStorage.setItem('accessToken', token);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp > currentTime) {
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        logout();
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [logout]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
