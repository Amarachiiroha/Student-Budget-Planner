import { useState, useEffect } from 'react';
import { loadTheme, saveTheme } from '../utils/localStorage';

/**
 * Custom hook for theme management
 * @returns {Object} { theme, toggleTheme, isDark }
 */
export const useTheme = () => {
  const [theme, setTheme] = useState('light');

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = loadTheme();
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        newTheme === 'dark' ? '#0f172a' : '#6366f1'
      );
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
    applyTheme(newTheme);
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
};