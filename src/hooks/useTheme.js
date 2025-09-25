import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('todo-theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem('todo-theme', theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};