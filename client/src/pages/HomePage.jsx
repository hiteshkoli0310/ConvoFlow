import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import ThemeToggle from "../components/ThemeToggle";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5 float-animation"
             style={{ background: 'var(--accent-primary)' }}></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-5 float-animation"
             style={{ background: 'var(--accent-secondary)', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-3 float-animation"
             style={{ background: 'var(--accent-primary)', animationDelay: '2s' }}></div>
      </div>

      

      {/* Main Chat Interface with Visual Separation */}
      <div className="flex h-screen relative z-10 component-separator">
        {/* Left Sidebar - User List */}
        <div className="w-80 sidebar-panel">
          <Sidebar />
        </div>

        {/* Separator Line */}
        <div className="w-px bg-gradient-to-b from-transparent via-[var(--accent-primary)] to-transparent opacity-30"></div>

        {/* Main Chat Area */}
        <div className="flex-1 flex chat-panel">
          {/* Chat Container */}
          <div className={`flex-1 ${selectedUser ? 'block' : 'flex items-center justify-center'}`} 
               style={{ background: 'var(--bg-primary)' }}>
            {selectedUser ? (
              <ChatContainer />
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full glass-morphism-strong flex items-center justify-center">
                  <svg className="w-16 h-16 opacity-60" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                  Welcome to ConvoFlow
                </h3>
                <p className="opacity-80 mb-6" style={{ color: 'var(--text-muted)' }}>
                  Select a conversation to start chatting
                </p>
                <div className="text-sm opacity-60" style={{ color: 'var(--text-muted)' }}>
                  Chat anytime, anywhere
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - User Info */}
          {selectedUser && (
            <>
              {/* Separator Line */}
              <div className="w-px bg-gradient-to-b from-transparent via-[var(--accent-primary)] to-transparent opacity-30"></div>
              
              <div className="w-80 right-sidebar-panel">
                <RightSidebar />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
