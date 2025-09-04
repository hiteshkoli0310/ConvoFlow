import React from 'react'
import assets, { imagesDummyData } from '../assets/assets'

const RightSidebar = ({ selectedUser }) => {
  return (
    selectedUser && (
      <div
        className={`bg-[#0D1F1B] text-white w-full h-full overflow-y-auto ${selectedUser ? "max-md:hidden" : ""}`}
      >
        {/* Profile Section */}
        <div className="pt-8 flex flex-col items-center gap-3 text-center border-b border-green-900/50 pb-6">
          {/* Profile Picture */}
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-green-600"
          />

          {/* Name + Online status */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-green-300">{selectedUser.fullName}</h1>
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
          </div>

          {/* Bio */}
          <p className="px-6 text-sm text-green-200/80 italic">
            {selectedUser.bio || "Hey there! I'm using QuickChat"}
          </p>
        </div>

        {/* Media Section */}
        <div className="p-4 border-b border-green-900/50">
          <h2 className="text-sm font-semibold text-green-300 mb-2">Media</h2>
          <div className="grid grid-cols-3 gap-2">
            {imagesDummyData.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url, '_blank')}
                className="cursor-pointer rounded overflow-hidden"
              >
                <img
                  src={url}
                  alt={`media-${index}`}
                  className="h-20 w-full object-cover rounded-md hover:scale-105 transition"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button (Right Below Media Section) */}
        <div className="p-4">
          <button className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white text-sm font-medium py-2 rounded-full shadow-md hover:from-emerald-500 hover:to-green-600 transition">
            Logout
          </button>
        </div>
      </div>
    )
  )
}

export default RightSidebar
