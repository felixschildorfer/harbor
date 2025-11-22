import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { authAPI, setAccessToken } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'harborAccessToken';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessTokenState, setAccessTokenState] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [initializing, setInitializing] = useState(true);

  const persistToken = useCallback((token) => {
    setAccessTokenState(token);
    setAccessToken(token);
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const bootstrapSession = useCallback(async () => {
    try {
      if (accessTokenState) {
        setAccessToken(accessTokenState);
        const { data } = await authAPI.me();
        setUser(data.user);
      } else {
        const { data } = await authAPI.refresh();
        persistToken(data.accessToken);
        setUser(data.user);
      }
    } catch (error) {
      console.warn('Session bootstrap failed:', error?.message);
      if (accessTokenState) {
        try {
          const { data } = await authAPI.refresh();
          persistToken(data.accessToken);
          setUser(data.user);
          return;
        } catch (refreshError) {
          console.warn('Session refresh failed:', refreshError.message);
        }
      }
      persistToken(null);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, [accessTokenState, persistToken]);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  const handleAuthSuccess = useCallback((data) => {
    if (!data) {
      persistToken(null);
      setUser(null);
      return;
    }
    persistToken(data.accessToken);
    setUser(data.user);
  }, [persistToken]);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    handleAuthSuccess(data);
  }, [handleAuthSuccess]);

  const register = useCallback(async (payload) => {
    const { data } = await authAPI.register(payload);
    handleAuthSuccess(data);
  }, [handleAuthSuccess]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      persistToken(null);
      setUser(null);
    }
  }, [persistToken]);

  const value = useMemo(() => ({
    user,
    loading: initializing,
    login,
    register,
    logout,
  }), [user, initializing, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
