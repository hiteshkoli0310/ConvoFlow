import React, { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

import ThemeToggle from "./ThemeToggle";
import AccountMenuInline from "./AccountMenuInline";
import { FaEllipsisV } from "react-icons/fa";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);
  const { logout, onlineUsers, axios } = useContext(AuthContext);
  const { incomingRequests, fetchRequests, setShowRequestsPanel, sendFollowRequest } = useContext(ChatContext);
  const [showReqPreview, setShowReqPreview] = useState(false);
  const [input, setInput] = useState("");
  // const [showDropdown, setShowDropdown] = useState(false); // removed in favor of AccountBadge menu
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = React.useRef(null);
  const filteredUsers = users.filter(u => u.mutualFollow);

  // Requests kebab positioning via portal
  const kebabBtnRef = useRef(null);
  const [reqMenuPos, setReqMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!showReqPreview) return;
    const updatePos = () => {
      if (!kebabBtnRef.current) return;
      const r = kebabBtnRef.current.getBoundingClientRect();
      const panelWidth = 288; // w-72
      const gap = 8;
      const left = Math.min(window.innerWidth - 16 - panelWidth, Math.max(16, r.right - panelWidth));
      const top = Math.min(window.innerHeight - 16 - 200, r.bottom + gap); // clamp with some margin
      setReqMenuPos({ top, left });
    };
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [showReqPreview]);

  // Sort users by lastMessageAt (descending)
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
  });

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
  <div className="min-h-screen md:h-full flex flex-col overflow-visible" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
  <div className="p-6 border-b glass-morphism-subtle overflow-visible">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="neon-avatar w-9 h-9 grid place-items-center rounded-xl">
              <img src={assets.logo_icon} alt="ConvoFlow" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-extrabold neon-text text-base">ConvoFlow</span>
            <button
              className="md:hidden ml-2 px-2 py-1 text-xs rounded hover:bg-[var(--bg-secondary)]"
              onClick={() => setShowRequestsPanel(true)}
            >Requests</button>
          </div>

          {/* Right side: kebab for requests (desktop), account+theme (mobile) */}
          <div className="flex items-center gap-2 ml-3 shrink-0 relative z-[30]">
            <div className="hidden md:block relative">
              <button
                ref={kebabBtnRef}
                onClick={async () => { 
                  const next = !showReqPreview; 
                  setShowReqPreview(next); 
                  await fetchRequests(); 
                }}
                className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]"
                title="Requests"
              >
                <FaEllipsisV className="w-4 h-4" />
              </button>
              {showReqPreview && createPortal(
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setShowReqPreview(false)} />
                  <div className="fixed w-72 glass-morphism-strong rounded-xl border z-[9999] drop-shadow-2xl"
                       style={{ top: reqMenuPos.top, left: reqMenuPos.left, borderColor: 'var(--border-subtle)' }}>
                    <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="font-semibold">Requests</span>
                      <button
                        onClick={() => { setShowRequestsPanel(true); setShowReqPreview(false); }}
                        className="text-sm px-2 py-1 rounded hover:bg-[var(--bg-secondary)]"
                      >See All</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {incomingRequests.slice(0,2).map((req) => (
                        <div key={req._id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--bg-secondary)]" onClick={() => { setShowRequestsPanel(true); setShowReqPreview(false); }}>
                          <img src={req.from?.profilePic || assets.avatar_icon} className="w-10 h-10 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{req.from?.fullName}</p>
                          </div>
                        </div>
                      ))}
                      {incomingRequests.length === 0 && (
                        <div className="p-3 text-sm opacity-70">No requests</div>
                      )}
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
            <div className="md:hidden flex items-center gap-2">
              <AccountMenuInline />
              <ThemeToggle />
            </div>
          </div>
          {/* 3-dot menu removed; AccountBadge now hosts profile/logout actions */}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              if (!val.trim()) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
              }
              debounceRef.current = setTimeout(async () => {
                setSearching(true);
                try {
                  const { data } = await axios.get('/api/auth/search', { params: { q: val } });
                  if (data?.success) {
                    setSuggestions(data.users || []);
                    setShowSuggestions(true);
                  } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }
                } catch {
                  setSuggestions([]);
                  setShowSuggestions(false);
                } finally {
                  setSearching(false);
                }
              }, 250);
            }}
            type="text"
            className="w-full px-4 py-3 pl-11 rounded-xl border-2 input-glow transition-all duration-300 placeholder:text-[var(--text-muted)]"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
            placeholder="Search by username..."
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          {searching && (
            <div className="flex items-center gap-2 py-1 text-sm opacity-70" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M22 12a10 10 0 0 1-10 10"/></svg>
              Searching…
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="space-y-2">
            {suggestions.map((u) => (
              <div
                key={u._id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 glass-morphism ${u.mutualFollow ? 'hover:glass-morphism-strong cursor-pointer' : ''}`}
                onClick={() => {
                  if (u.mutualFollow) {
                    setSelectedUser(u);
                    setShowSuggestions(false);
                    setInput('');
                    setShowRequestsPanel(false);
                  }
                }}
              >
                <img className="w-10 h-10 rounded-full object-cover" src={u.profilePic || assets.avatar_icon} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.fullName}</p>
                    <span className="text-xs opacity-70" style={{ color: 'var(--text-muted)' }}>@{u.username}</span>
                  </div>
                </div>
                {u.mutualFollow ? null : (
                  <button
                    className="px-3 py-2 rounded-lg text-white text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                    onClick={async (e) => { e.stopPropagation(); await sendFollowRequest(u._id); }}
                  >Follow</button>
                )}
              </div>
            ))}
            </div>
          )}
        </div>
      )}
      {showSuggestions && !searching && suggestions.length === 0 && input.trim() && (
        <div className="px-4 py-3 text-sm opacity-70 border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>
          No users found
        </div>
      )}

      {/* User List (only mutual followers) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 space-y-2">
          {sortedUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const unseenCount = unseenMessages[user._id];
            const isSelected = selectedUser?._id === user._id;

            return (
              <div
                key={user._id}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  isSelected 
                    ? 'glass-morphism-strong border-2' 
                    : 'glass-morphism hover:glass-morphism-strong'
                }`}
                style={{
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'
                }}
                onClick={() => {
                  setSelectedUser(user);
                  if (unseenCount > 0) {
                    setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }));
                  }
                  setShowRequestsPanel(false);
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src={user.profilePic || assets.avatar_icon}
                      alt=""
                    />
                    {/* Online Indicator */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${
                      isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} style={{ borderColor: 'var(--bg-primary)' }}></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {user.fullName}
                      </p>
                      {unseenCount > 0 && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                             style={{ background: 'var(--accent-primary)' }}>
                          {unseenCount}
                        </div>
                      )}
                    </div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-muted)' }}>
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                  {/* CTA area removed: entire card is clickable; follow actions handled in search suggestions */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
