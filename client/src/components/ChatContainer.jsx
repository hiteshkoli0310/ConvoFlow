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

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    deleteMessage,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  
  const scrollEnd = useRef();
  const messagesContainerRef = useRef();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

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
    
    await sendMessage({ text: input.trim() });
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
  };

  const handleConfirmDelete = async () => {
    if (messageToDelete) {
      await deleteMessage(messageToDelete._id);
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  useEffect(() => {
    if (selectedUser) {
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
            <div className="flex items-center gap-3">
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
        
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
        style={{ display: "flex", flexDirection: "column-reverse" }}
      >
        {messages.map((msg, index) => {
          const isSender = msg.senderId === authUser._id;
          const isDeleted = msg.text === "This message was deleted";

          return (
            <div
              key={index}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  isSender
                    ? `text-white rounded-br-none`
                    : `rounded-bl-none glass-morphism`
                } ${isDeleted ? "opacity-60 italic" : ""}`}
                style={{
                  background: isSender 
                    ? `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))` 
                    : 'var(--bg-secondary)',
                  color: isSender ? '#ffffff' : 'var(--text-primary)'
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (!isDeleted && isSender) {
                    setShowDropdown(showDropdown === msg._id ? null : msg._id);
                  }
                }}
              >
                {msg.image ? (
                  <img
                    className="w-full rounded-lg mb-2"
                    src={msg.image}
                    alt=""
                  />
                ) : (
                  <p className="break-words">{msg.text}</p>
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

                {/* Message Options */}
                {showDropdown === msg._id && (
                  <div className="absolute top-0 right-0 mt-2 mr-2">
                    <div className="glass-morphism-strong rounded-lg shadow-xl p-1">
                      <button
                        onClick={() => handleDeleteClick(msg)}
                        className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-all duration-200"
                      >
                        <FaTrashAlt className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 w-12 h-12 rounded-full glass-morphism-strong shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-200"
        >
          <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Message Input */}
      <div className="p-4 border-t glass-morphism-subtle">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          {/* Image Upload */}
          <label className="cursor-pointer p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all duration-200">
            <input
              type="file"
              accept="image/*"
              onChange={handleSendImage}
              className="hidden"
            />
            <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </label>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border-2 input-glow transition-all duration-300 placeholder:text-[var(--text-muted)]"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
              placeholder="Type a message..."
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: input.trim() 
                ? `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))` 
                : 'var(--bg-secondary)'
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-morphism-strong rounded-2xl p-6 max-w-sm mx-4 border" style={{ borderColor: 'var(--border-subtle)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Delete Message
            </h3>
            <p className="mb-6 opacity-80" style={{ color: 'var(--text-muted)' }}>
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
};

export default ChatContainer;
