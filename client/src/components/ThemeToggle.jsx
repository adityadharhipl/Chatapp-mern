import React from 'react';

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button 
    onClick={toggleTheme} 
    className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors z-50 shadow-md"
  >
    {theme === 'dark' ? '☀️' : '🌙'}
  </button>
);

export default ThemeToggle;
