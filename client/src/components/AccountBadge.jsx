import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// Small bottom-left account chip showing avatar + name
// - Click opens Profile page
// - Theme-aware, glassy, non-intrusive
const AccountBadge = () => {
  const navigate = useNavigate();
  const { authUser, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const hideTimerRef = useRef(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const handleEnter = () => {
    clearHideTimer();
    setOpen(true);
  };

  const handleLeave = () => {
    clearHideTimer();
    // Small grace period so users can move the cursor towards the menu
    hideTimerRef.current = setTimeout(() => setOpen(false), 100);
  };

  if (!authUser) return null;

  const { fullName, profilePic } = authUser || {};

  return (
    <div
      className="fixed left-4 bottom-4 z-50"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          // Close when focus leaves the badge and its menu
          if (!e.currentTarget.parentElement.contains(e.relatedTarget)) {
            setOpen(false);
          }
        }}
        className="max-w-[60vw] flex items-center gap-3 px-3 py-2 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
        }}
      >
        <span
          className="w-8 h-8 rounded-full overflow-hidden border"
          style={{ borderColor: "rgba(var(--accent-primary-rgb), 0.35)" }}
        >
          {profilePic ? (
            <img
              src={profilePic}
              alt={fullName || "Profile"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-full h-full grid place-items-center"
              style={{ background: "var(--bg-secondary)" }}
            >
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {fullName ? fullName.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          )}
        </span>
        <span
          className="truncate text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
          title={fullName}
        >
          {fullName}
        </span>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 w-48 rounded-xl shadow-2xl border-2 bg-white/95 dark:bg-[rgba(0,0,0,0.95)]"
          style={{
            borderColor: "#16db65",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
          role="menu"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="py-2">
            <button
              role="menuitem"
              onClick={() => navigate("/profile")}
              className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-3 hover:bg-green-100 dark:hover:bg-green-900"
            >
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-green-600 dark:text-green-400 font-medium">Edit Profile</span>
            </button>
            <button
              role="menuitem"
              onClick={() => logout()}
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

export default AccountBadge;
