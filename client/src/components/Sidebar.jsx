import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

import ThemeToggle from "./ThemeToggle";
import AccountMenuInline from "./AccountMenuInline";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  // const [showDropdown, setShowDropdown] = useState(false); // removed in favor of AccountBadge menu
  const navigate = useNavigate();

  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

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
    <div className="min-h-screen md:h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="p-6 border-b glass-morphism-subtle">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="neon-avatar w-9 h-9 grid place-items-center rounded-xl">
              <img src={assets.logo_icon} alt="ConvoFlow" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-extrabold neon-text text-base">ConvoFlow</span>
          </div>

          {/* Right side (mobile only): account menu then theme toggle */}
          <div className="md:hidden ml-3 flex items-center gap-2 shrink-0">
            <AccountMenuInline />
            <ThemeToggle />
          </div>
          {/* 3-dot menu removed; AccountBadge now hosts profile/logout actions */}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="w-full px-4 py-3 pl-11 rounded-xl border-2 input-glow transition-all duration-300 placeholder:text-[var(--text-muted)]"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
            placeholder="Search users..."
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 space-y-2">
          {sortedUsers.map((user, index) => {
            const isOnline = onlineUsers.includes(user._id);
            const unseenCount = unseenMessages[user._id];
            const isSelected = selectedUser?._id === user._id;

            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedUser(user);
                  if (unseenCount > 0) {
                    setUnseenMessages(prev => ({
                      ...prev,
                      [user._id]: 0
                    }));
                  }
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  isSelected 
                    ? 'glass-morphism-strong border-2' 
                    : 'glass-morphism hover:glass-morphism-strong'
                }`}
                style={{
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'
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
