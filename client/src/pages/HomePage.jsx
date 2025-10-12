import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import RequestsPanel from "../components/RequestsPanel";
import ThemeToggle from "../components/ThemeToggle";
import InteractiveShowcase from "../components/InteractiveShowcase";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser, showRequestsPanel, setShowRequestsPanel } = useContext(ChatContext);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Themed mesh background */}
      <div className="absolute inset-0 home-mesh-bg" />

      {/* Background Globe echoing signup vibe, aligned right for contrast */}
      <InteractiveShowcase asBackground globeAlign="right" />

      {/* Subtle overlays: frosted glass plate + soft noise for glassmorphism */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Only show large glass plate on medium screens and up */}
        <div className="hidden md:block absolute inset-4 md:inset-6 rounded-3xl home-glass-plate" />
        <div className="absolute inset-0 home-noise" />
      </div>

      {/* Main Chat Interface with Visual Separation */}
      {/* Desktop/Tablet layout */}
      <div className="hidden md:flex h-screen relative z-10 component-separator">
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
               style={{ background: 'transparent' }}>
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

          {/* Right Sidebar - User Info (desktop only) */}
          {selectedUser && !showRequestsPanel && (
            <>
              {/* Separator Line */}
              <div className="w-px bg-gradient-to-b from-transparent via-[var(--accent-primary)] to-transparent opacity-30"></div>
              
              <div className="w-80 right-sidebar-panel hidden lg:block">
                <RightSidebar />
              </div>
            </>
          )}
          {showRequestsPanel && (
            <>
              <div className="w-px bg-gradient-to-b from-transparent via-[var(--accent-primary)] to-transparent opacity-30"></div>
              <div className="w-96 right-sidebar-panel hidden lg:block">
                <RequestsPanel />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden relative z-10 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {selectedUser ? (
          <div className="min-h-screen">
            <ChatContainer />
          </div>
        ) : (
          <div className="min-h-screen">
            <Sidebar />
          </div>
        )}
        {showRequestsPanel && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowRequestsPanel(false)} />
            <div className="absolute inset-x-0 bottom-0 h-[70%] rounded-t-2xl glass-morphism-strong border-t"
                 style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="font-semibold">Follow Requests</span>
                <button className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]" onClick={() => setShowRequestsPanel(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="h-[calc(100%-52px)]">
                <RequestsPanel hideHeader />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
