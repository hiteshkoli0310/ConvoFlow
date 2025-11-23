/**
 * Example: How to Display Translated Messages in ChatContainer.jsx
 * 
 * This file shows how to modify your existing message display
 * to show translated text when available.
 */

// Add this helper function at the top of ChatContainer.jsx
const getDisplayText = (message) => {
  // If there's a translated text and it's different from original, show it
  if (message.translatedText && message.translatedText !== message.text) {
    return {
      text: message.translatedText,
      isTranslated: true,
      originalText: message.originalText || message.text,
      sourceLang: message.detectedLanguage,
      targetLang: message.targetLanguage,
    };
  }
  
  // Otherwise show the original text
  return {
    text: message.text,
    isTranslated: false,
    originalText: null,
    sourceLang: null,
    targetLang: null,
  };
};

// Add this state for showing original text
const [showOriginal, setShowOriginal] = useState({});

// Modify your message rendering section like this:
{messages
  ?.filter((msg) => !msg.deleted)
  .map((message) => {
    const isMyMessage = message.sender === authUser?._id;
    const { text, isTranslated, originalText, sourceLang, targetLang } = getDisplayText(message);
    
    return (
      <div
        key={message._id}
        ref={scrollEnd}
        className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}
      >
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img
              alt="avatar"
              src={
                isMyMessage
                  ? authUser?.profilePic || assets.avatar_icon
                  : selectedUser?.profilePic || assets.avatar_icon
              }
            />
          </div>
        </div>

        <div className="relative group">
          {/* Message Bubble */}
          <div
            className={`chat-bubble flex flex-col max-w-xs md:max-w-md ${
              isMyMessage ? "chat-bubble-primary" : ""
            }`}
          >
            {/* Image if present */}
            {message.image && (
              <img
                src={message.image}
                alt="attachment"
                className="w-full rounded-lg mb-2"
              />
            )}

            {/* Message Text */}
            {text && (
              <div>
                {/* Main text (translated or original) */}
                <p className="text-sm md:text-base">
                  {showOriginal[message._id] ? originalText : text}
                </p>

                {/* Translation indicator & toggle */}
                {isTranslated && !showOriginal[message._id] && (
                  <button
                    onClick={() => setShowOriginal({ ...showOriginal, [message._id]: true })}
                    className="text-xs mt-1 opacity-70 hover:opacity-100 flex items-center gap-1"
                  >
                    🌐 Translated from {sourceLang?.toUpperCase()}
                    <span className="underline">See original</span>
                  </button>
                )}

                {/* Show original button */}
                {isTranslated && showOriginal[message._id] && (
                  <button
                    onClick={() => setShowOriginal({ ...showOriginal, [message._id]: false })}
                    className="text-xs mt-1 opacity-70 hover:opacity-100 underline"
                  >
                    Show translation
                  </button>
                )}
              </div>
            )}

            {/* Timestamp */}
            <time className="text-xs opacity-50 mt-1 self-end">
              {formatMessageTime(message.createdAt)}
            </time>
          </div>

          {/* Delete button for own messages */}
          {isMyMessage && (
            <button
              onClick={() => {
                setMessageToDelete(message);
                setShowDeleteModal(true);
              }}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete message"
            >
              <FaTrashAlt className="w-4 h-4 text-red-500 hover:text-red-700" />
            </button>
          )}
        </div>
      </div>
    );
  })}

/**
 * Alternative: Simpler version without toggle
 * Just shows translated text with a small indicator
 */

// Simple version (replace the text section with this):
{text && (
  <div>
    <p className="text-sm md:text-base">{text}</p>
    
    {/* Small translation badge */}
    {isTranslated && (
      <span 
        className="text-xs opacity-60 mt-1 inline-block"
        title={`Original (${sourceLang}): ${originalText}`}
      >
        🌐 Translated
      </span>
    )}
  </div>
)}

/**
 * Alternative: Tooltip on hover
 * Shows original text when hovering over translated message
 */

// CSS to add to index.css:
/*
.message-tooltip {
  position: relative;
}

.message-tooltip:hover::after {
  content: attr(data-original);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: pre-wrap;
  max-width: 200px;
  z-index: 10;
  margin-bottom: 0.5rem;
}

.message-tooltip:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}
*/

// JSX with tooltip:
{text && (
  <p 
    className={`text-sm md:text-base ${isTranslated ? 'message-tooltip' : ''}`}
    data-original={isTranslated ? `Original: ${originalText}` : ''}
  >
    {text}
    {isTranslated && <span className="ml-1 text-xs opacity-60">🌐</span>}
  </p>
)}

/**
 * Instructions:
 * 
 * 1. Choose one of the display methods above
 * 2. Copy the helper function `getDisplayText` to the top of ChatContainer.jsx
 * 3. Replace your existing message rendering with the chosen version
 * 4. Add CSS if using the tooltip version
 * 5. Test by setting different languages for users
 * 
 * The translated text will automatically appear when:
 * - Sender's detected language differs from receiver's preferred language
 * - Translation was successful
 * - Backend has processed the message
 */
