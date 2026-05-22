import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as authService from '../services/authService.js';
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '../utils/authStorage.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(token && user);

  const applySession = useCallback((session) => {
    const nextToken = session?.data?.token ?? session?.token;
    const nextUser = session?.data?.user ?? session?.user;

    if (nextToken && nextUser) {
      setToken(nextToken);
      setUser(nextUser);
      setStoredToken(nextToken);
      setStoredUser(nextUser);
    }
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    clearAuthStorage();
  }, []);

  const refreshProfile = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      return null;
    }

    try {
      const response = await authService.getMe();
      const profile = response?.data?.user ?? response?.user;
      if (profile) {
        setUser(profile);
        setStoredUser(profile);
      }
      return profile;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    const bootstrapSession = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await authService.getMe();
        if (!active) {
          return;
        }
        const profile = response?.data?.user ?? response?.user;
        if (profile) {
          setUser(profile);
          setStoredUser(profile);
        }
      } catch {
        if (active) {
          clearSession();
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      active = false;
    };
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      setError(null);
      const response = await authService.login(credentials);
      applySession(response);
      return response;
    },
    [applySession]
  );

  const register = useCallback(
    async (payload) => {
      setError(null);
      const response = await authService.register(payload);
      applySession(response);
      return response;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Client-side logout still proceeds if API is unreachable
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      error,
      setError,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, isAuthenticated, isLoading, error, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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

export default AuthContext;
