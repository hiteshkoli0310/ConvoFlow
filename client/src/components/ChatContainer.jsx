import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { formatMessageTime } from "../../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { FaTrashAlt, FaEllipsisV } from "react-icons/fa";
import RightSidebar from "./RightSidebar";
import LanguageSelector from "./LanguageSelector";
import { getLanguageName } from "../../lib/languages";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    deleteMessage,
    translateMessage,
    autoTranslateEnabled,
    autoTranslateLanguage,
    toggleAutoTranslate,
    updateAutoTranslateLanguage,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const { users, sendFollowRequest } = useContext(ChatContext);
  const locked = selectedUser && users.find(u => u._id === selectedUser._id)?.mutualFollow === false;
  
  const scrollEnd = useRef();
  const messagesContainerRef = useRef();
  const dropdownRef = useRef();
  const modalRef = useRef();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [messageToTranslate, setMessageToTranslate] = useState(null);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [showAutoTranslateLanguageSelector, setShowAutoTranslateLanguageSelector] = useState(false);
  const [isAutoTranslateMode, setIsAutoTranslateMode] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      setShowScrollButton(scrollTop > 100);
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    try {
      await sendMessage({ text: input.trim() });
    } catch (err) {
      // sendMessage already toasts on HTTP errors; ensure UI doesn't crash
      return;
    }
    setInput("");
    scrollToBottom();
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteClick = (msg) => {
    setMessageToDelete(msg);
    setShowDeleteModal(true);
    setShowDropdown(null); // Close the dropdown when opening delete modal
  };

  const handleConfirmDelete = async () => {
    if (messageToDelete) {
      await deleteMessage(messageToDelete._id);
      setShowDeleteModal(false);
      setMessageToDelete(null);
      setShowDropdown(null); // Ensure dropdown is closed after deletion
    }
  };

  const handleTranslateClick = (msg) => {
    setMessageToTranslate(msg);
    setShowLanguageSelector(true);
    setShowDropdown(null);
  };

  const handleLanguageSelect = async (targetLang) => {
    if (!messageToTranslate) return;

    try {
      const result = await translateMessage(messageToTranslate._id, targetLang);
      
      if (result) {
        // Store translation in local state
        setTranslatedMessages((prev) => ({
          ...prev,
          [messageToTranslate._id]: result,
        }));
        toast.success(`Translated to ${getLanguageName(targetLang)}`);
      }
    } catch (error) {
      // Error already toasted in translateMessage
    }
  };

  const handleShowOriginal = (messageId) => {
    setTranslatedMessages((prev) => {
      const updated = { ...prev };
      delete updated[messageId];
      return updated;
    });
  };

  const handleAutoTranslateToggle = () => {
    if (!selectedUser) return;
    
    const userId = selectedUser._id;
    const currentlyEnabled = autoTranslateEnabled[userId];
    
    if (!currentlyEnabled) {
      // Enabling - show language selector
      setIsAutoTranslateMode(true);
      setShowAutoTranslateLanguageSelector(true);
    } else {
      // Disabling
      toggleAutoTranslate(userId, false);
      setTranslatedMessages({});
      toast.success('Auto-translate disabled');
    }
  };

  const handleAutoTranslateLanguageSelect = async (targetLang) => {
    if (!selectedUser) return;
    
    const userId = selectedUser._id;
    toggleAutoTranslate(userId, true, targetLang);
    toast.success(`Auto-translate enabled: ${getLanguageName(targetLang)}`);
    
    // Auto-translate all existing messages from this user
    const messagesToTranslate = messages.filter(
      (msg) => String(msg.sender) === String(userId) && msg.text && !msg.deleted
    );
    
    for (const msg of messagesToTranslate) {
      try {
        const result = await translateMessage(msg._id, targetLang);
        if (result) {
          setTranslatedMessages((prev) => ({
            ...prev,
            [msg._id]: result,
          }));
        }
      } catch (error) {
        console.error('Auto-translate error:', error);
      }
    }
  };

  // Handle click outside to close dropdowns and modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
      // Close delete modal if clicked outside
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setMessageToDelete(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      setIsLoading(true);
      getMessages(selectedUser._id).finally(() => {
        setTimeout(() => {
          setIsLoading(false);
          scrollToBottom();
        }, 50);
      });
    }
  }, [selectedUser, getMessages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-translate new messages when auto-translate is enabled
  useEffect(() => {
    if (!selectedUser) return;
    
    const userId = selectedUser._id;
    const isEnabled = autoTranslateEnabled[userId];
    const targetLang = autoTranslateLanguage[userId];
    
    if (isEnabled && targetLang) {
      // Find messages from selected user that aren't translated yet
      const newMessages = messages.filter(
        (msg) =>
          String(msg.sender) === String(userId) &&
          msg.text &&
          !msg.deleted &&
          !translatedMessages[msg._id]
      );
      
      // Translate new messages
      newMessages.forEach(async (msg) => {
        try {
          const result = await translateMessage(msg._id, targetLang);
          if (result) {
            setTranslatedMessages((prev) => ({
              ...prev,
              [msg._id]: result,
            }));
          }
        } catch (error) {
          console.error('Auto-translate error:', error);
        }
      });
    }
  }, [messages, selectedUser, autoTranslateEnabled, autoTranslateLanguage, translateMessage, translatedMessages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Chat Header */}
      <div className="p-4 border-b glass-morphism-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Button (Mobile) */}
            <button
              onClick={() => setSelectedUser(null)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-all duration-200"
            >
              <svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            {/* User Info */}
            <div
              className="flex items-center gap-3 md:cursor-default cursor-pointer"
              onClick={() => setShowDetails(true)}
              title="View details"
            >
              <div className="relative">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={selectedUser.profilePic || assets.avatar_icon}
                  alt=""
                />
                {onlineUsers.includes(selectedUser._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2" style={{ borderColor: 'var(--bg-primary)' }}></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedUser.fullName}
                </h3>
                <p className="text-sm opacity-70" style={{ color: 'var(--text-muted)' }}>
                  {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>
        
          <div className="flex items-center gap-2 ml-auto">
            {/* Auto-Translate Toggle Button */}
            {!locked && (
              <button
                onClick={handleAutoTranslateToggle}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  autoTranslateEnabled[selectedUser._id]
                    ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white'
                    : 'hover:bg-[var(--bg-secondary)]'
                }`}
                title={autoTranslateEnabled[selectedUser._id] 
                  ? `Auto-translate ON: ${getLanguageName(autoTranslateLanguage[selectedUser._id])}` 
                  : 'Enable auto-translate'}
                style={{ 
                  color: autoTranslateEnabled[selectedUser._id] ? '#ffffff' : 'var(--text-primary)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </button>
            )}

            {locked && (
              <button
                onClick={() => sendFollowRequest(selectedUser._id)}
                className="px-3 py-2 rounded-lg text-white text-sm"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
              >
                Send Follow Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-thin"
          style={{ 
            display: "flex", 
            flexDirection: "column-reverse", 
            padding: '16px',
            paddingBottom: '32px' // Extra bottom padding
          }}
        >
          {messages.map((msg, index) => {
            const isSender = String(msg.sender) === String(authUser._id);
            const isDeleted = msg.text === "This message was deleted";

            return (
              <div
                key={msg._id || index} // ✅ Use msg._id instead of index
                className={`flex ${isSender ? "justify-end" : "justify-start"} animate-slide-up-fade`}
                style={{
                  marginBottom: '20px', // ✅ Consistent spacing for all messages
                  width: '100%',
                  animationDelay: '0.1s'
                }}
              >
                <div
                  className={`relative max-w-xs lg:max-w-md px-4 py-3 shadow-md transition-all duration-300 hover:shadow-lg ${
                    isSender
                      ? `text-white rounded-2xl rounded-br-none`
                      : `rounded-2xl rounded-bl-none glass-morphism`
                  } ${isDeleted ? "opacity-60 italic" : ""}`}
                  style={{
                    background: isSender 
                      ? `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))` 
                      : 'var(--bg-secondary)',
                    color: isSender ? '#ffffff' : 'var(--text-primary)'
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isDeleted) {
                      setShowDropdown(showDropdown === msg._id ? null : msg._id);
                    }
                  }}
                >
                  {/* Translation Badge */}
                  {translatedMessages[msg._id] && (
                    <div className="mb-2 pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                      <span className="text-xs opacity-75">
                        Translated from {getLanguageName(translatedMessages[msg._id].detectedSourceLang)}
                      </span>
                    </div>
                  )}

                  {msg.image ? (
                    <img
                      className="w-full rounded-lg mb-2"
                      src={msg.image}
                      alt=""
                    />
                  ) : (
                    <p className="break-words">
                      {translatedMessages[msg._id]?.translatedText || msg.text}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                    {isSender && (
                      <span className="text-xs opacity-70">
                        {msg.seen ? "Seen" : "Sent"}
                      </span>
                    )}
                  </div>

                  {/* Show Original Button */}
                  {translatedMessages[msg._id] && !msg.deleted && (
                    <button
                      onClick={() => handleShowOriginal(msg._id)}
                      className="mt-2 text-xs underline opacity-75 hover:opacity-100 transition-opacity"
                    >
                      Show original
                    </button>
                  )}

                  {/* Message Options - Updated with Translate */}
                  {showDropdown === msg._id && !msg.deleted && (
                    <div 
                      ref={dropdownRef}
                      className="absolute top-0 right-0 mt-2 mr-2 z-50">
                      <div className="glass-morphism-strong rounded-lg shadow-xl p-1">
                        {/* Translate Option - Show for all messages with text */}
                        {msg.text && (
                          <button
                            onClick={() => {
                              handleTranslateClick(msg);
                            }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-500/10 rounded-lg text-sm transition-all duration-200 w-full"
                            style={{ color: isSender ? '#ffffff' : 'var(--accent-primary)' }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            Translate
                          </button>
                        )}
                        
                        {/* Delete Option - Only for sender */}
                        {isSender && (
                          <button
                            onClick={() => {
                              handleDeleteClick(msg);
                              setShowDropdown(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-all duration-200 w-full"
                          >
                            <FaTrashAlt className="w-3 h-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* ✅ Move scrollEnd to not interfere with spacing */}
          <div ref={scrollEnd} style={{ height: '1px', margin: '0' }}></div>
        </div>


      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 w-12 h-12 rounded-full glass-morphism-strong shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 animate-fade-in-scale z-20"
        >
          <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Message Input */}
      <div className="p-4 border-t glass-morphism-subtle">
          {locked && (
            <div className="flex-1 text-sm opacity-80 mb-2 text-center" style={{ color: 'var(--text-muted)' }}>
              Chat is locked until both of you follow each other.
            </div>
          )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          {/* Image Upload */}
          <label className="cursor-pointer p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all duration-200 group">
            <input
              type="file"
              accept="image/*"
              onChange={handleSendImage}
              className="hidden"
            />
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </label>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full input-polished pr-12 placeholder:text-[var(--text-muted)]"
              placeholder="Type a message..."
              disabled={locked}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || locked}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group overflow-hidden ${
              input.trim()
                ? 'shadow-[0_0_20px_rgba(0,220,130,0.6)] hover:shadow-[0_0_30px_rgba(0,220,130,0.8)] hover:scale-105 active:scale-95'
                : 'opacity-50 cursor-not-allowed border border-[var(--border-subtle)]'
            }`}
            style={{
              background: input.trim() ? '#000000' : 'transparent',
            }}
          >
            {/* Liquid Fill Effect (Only visible when active) */}
            {input.trim() && (
              <>
                {/* The Liquid Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#00DC82] via-[#00DC82] to-transparent opacity-90" style={{ top: '40%' }}></div>
                
                {/* Glossy Shine */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"></div>
                
                {/* Internal Glow */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_-5px_10px_rgba(0,220,130,0.5)]"></div>
              </>
            )}

            {/* Icon */}
            <svg 
              className={`w-5 h-5 relative z-10 ${input.trim() ? 'text-white' : 'text-[var(--text-muted)]'}`} 
              style={{ transform: 'rotate(45deg)' }}
              fill={input.trim() ? "currentColor" : "none"} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      {/* Mobile slide-over: RightSidebar details */}
      {showDetails && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDetails(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm glass-morphism-strong border-l"
               style={{ borderColor: 'var(--border-subtle)' }}>
            {/* Close */}
            <div className="p-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]"
                onClick={() => setShowDetails(false)}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-52px)]">
              <RightSidebar />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="glass-morphism-strong rounded-2xl p-6 max-w-sm mx-4 border"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Delete Message
            </h3>
            <p className="mb-6 opacity-80" style={{ color: 'var(--text-muted)' }}>
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMessageToDelete(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200 hover:bg-[var(--bg-secondary)]"
                style={{ 
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <LanguageSelector
          onSelect={handleLanguageSelect}
          onClose={() => {
            setShowLanguageSelector(false);
            setMessageToTranslate(null);
          }}
        />
      )}

      {/* Auto-Translate Language Selector Modal */}
      {showAutoTranslateLanguageSelector && (
        <LanguageSelector
          onSelect={handleAutoTranslateLanguageSelect}
          onClose={() => {
            setShowAutoTranslateLanguageSelector(false);
            setIsAutoTranslateMode(false);
          }}
          currentLang={autoTranslateLanguage[selectedUser?._id] || 'en'}
        />
      )}
    </div>
  );
};

export default ChatContainer;
