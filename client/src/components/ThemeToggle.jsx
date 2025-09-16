import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.theme === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-4 glass-morphism hover:scale-105 active:scale-95"
      style={{
        background: darkMode ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
        focusRingColor: 'rgba(22, 219, 101, 0.2)'
      }}
    >
      {/* Toggle Track */}
      <div className="absolute inset-1 rounded-full transition-all duration-300"
           style={{ background: 'var(--accent-primary)' }}>
      </div>

      {/* Toggle Button */}
      <div
        className="relative w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300"
        style={{
          transform: darkMode ? 'translateX(32px)' : 'translateX(0px)'
        }}
      >
        {/* Icon Container */}
        <div className="relative w-4 h-4">
          {/* Sun Icon */}
          <svg
            className={`absolute inset-0 w-4 h-4 text-yellow-500 transition-all duration-300 ${
              darkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>

          {/* Moon Icon */}
          <svg
            className={`absolute inset-0 w-4 h-4 text-indigo-300 transition-all duration-300 ${
              darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </div>

      {/* Background Glow Effect */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-300"
        style={{
          background: darkMode 
            ? 'radial-gradient(circle, rgba(22, 219, 101, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(5, 140, 66, 0.1) 0%, transparent 70%)'
        }}
      />
    </button>
  );
};

export default ThemeToggle;
