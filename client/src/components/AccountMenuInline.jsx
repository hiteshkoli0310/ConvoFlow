import React, { useContext, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Compact avatar button with dropdown menu for mobile headers
const AccountMenuInline = () => {
  const navigate = useNavigate();
  const { authUser, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!authUser) return null;
  const { fullName, profilePic } = authUser;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full overflow-hidden border grid place-items-center"
        style={{ borderColor: 'rgba(var(--accent-primary-rgb), 0.35)', background: 'var(--bg-secondary)' }}
      >
        {profilePic ? (
          <img src={profilePic} alt={fullName || 'Profile'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {fullName ? fullName.charAt(0).toUpperCase() : '?'}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-xl shadow-2xl border-2 bg-white/95 dark:bg-[rgba(0,0,0,0.95)] z-50"
          style={{ borderColor: '#16db65', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          role="menu"
        >
          <div className="py-2">
            <button
              role="menuitem"
              onClick={() => { setOpen(false); navigate('/profile'); }}
              className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-3 hover:bg-green-100 dark:hover:bg-green-900"
            >
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-green-600 dark:text-green-400 font-medium">Edit Profile</span>
            </button>
            <button
              role="menuitem"
              onClick={() => { setOpen(false); logout(); }}
              className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-3 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-red-600 dark:text-red-400 font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenuInline;
