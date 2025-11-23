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
      className="relative w-14 h-8 rounded-full transition-all duration-500 ease-out focus:outline-none hover:scale-105 active:scale-95 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
      style={{
        background: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)',
        border: '1px solid var(--border-subtle)'
      }}
      aria-label="Toggle Theme"
    >
      {/* Sliding Knob */}
      <div
        className="absolute top-0.5 left-0.5 w-[26px] h-[26px] rounded-full shadow-md flex items-center justify-center transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)"
        style={{
          transform: darkMode ? 'translateX(24px)' : 'translateX(0)',
          background: darkMode ? 'var(--bg-secondary)' : '#ffffff',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        {/* Sun Icon */}
        <svg
          className={`absolute w-4 h-4 transition-all duration-500 ${
            darkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
          style={{ color: '#f59e0b' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>

        {/* Moon Icon */}
        <svg
          className={`absolute w-4 h-4 transition-all duration-500 ${
            darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
          style={{ color: 'var(--accent-primary)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
    </button>
  );
};

export default ThemeToggle;
