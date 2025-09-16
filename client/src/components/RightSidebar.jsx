import React, { useContext, useEffect, useState } from "react";
import assets, { imagesDummyData } from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(
      messages.filter((msg) => msg.image).map((msg) => msg.image)
    );
  }, [messages]);

  return (
    selectedUser && (
      <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
        {/* User Profile Section */}
        <div className="p-6 text-center border-b glass-morphism-subtle">
          <div className="relative inline-block mb-4">
            <img
              className="w-24 h-24 rounded-full object-cover mx-auto shadow-lg"
              src={selectedUser.profilePic || assets.avatar_icon}
              alt=""
            />
            {onlineUsers.includes(selectedUser._id) && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4" style={{ borderColor: 'var(--bg-primary)' }}></div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {selectedUser.fullName}
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${
              onlineUsers.includes(selectedUser._id) ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm opacity-80" style={{ color: 'var(--text-muted)' }}>
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </span>
          </div>

          {selectedUser.bio && (
            <div className="glass-morphism rounded-xl p-4">
              <p className="text-sm opacity-90 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {selectedUser.bio}
              </p>
            </div>
          )}
        </div>

        {/* Shared Media Section */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Shared Media
          </h3>
          
          {msgImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {msgImages.slice(0, 9).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden glass-morphism hover:glass-morphism-strong transition-all duration-200 cursor-pointer group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    src={image}
                    alt=""
                    onClick={() => window.open(image, '_blank')}
                  />
                </div>
              ))}
              {msgImages.length > 9 && (
                <div className="aspect-square rounded-lg glass-morphism flex items-center justify-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    +{msgImages.length - 9}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm opacity-60" style={{ color: 'var(--text-muted)' }}>
                No shared media yet
              </p>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default RightSidebar;
