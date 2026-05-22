import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * AppContext — Global application state
 * Manages top-level UI state: theme, sidebar, notifications.
 * Auth state is managed by AuthContext.
 */
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  const value = {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to consume AppContext.
 * Must be used within AppProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
