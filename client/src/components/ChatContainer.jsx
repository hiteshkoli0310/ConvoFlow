import React from 'react'
import assets, { messagesDummyData } from '../assets/assets'

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  return selectedUser ? (
    <div className="h-full flex flex-col backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 py-3 px-4 border-b border-stone-500">
        {/* Profile Info */}
        <div className="flex items-center gap-3">
          <img
            src={selectedUser?.profilePic || assets.profile_martin}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <p className="text-white font-medium text-sm">{selectedUser?.fullName || 'Martin Johnson'}</p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-300">Online</span>
            </div>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="back"
            className="md:hidden w-6 cursor-pointer"
          />
          <img
            src={assets.help_icon}
            alt="help"
            className="hidden md:block w-5 cursor-pointer"
          />
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-scroll p-4 text-white">
        {messagesDummyData.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId!== '680f50ef10f3cd28382ecf9' && ''}`}>
              {msg.image?(
                <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'/>
              ):(
                <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId==='680f50ef10f3cd28382ecf9' ? 'rounded-br-none': 'rounded-bl-none'}`}>{msg.text}</p>
              )}
              <div className='text-center text-xs'>
                <img src={msg.senderId==='680f50ef10f3cd28382ecf9'?assets.avatar_icon:assets.profile_martin} alt="" className='w-7 rounded-full'/>
                <p className='text-grey-500'>{msg.createdAt}</p>
              </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center text-white">
      <img src={assets.logo_icon} className="w-16 mb-3" alt="logo" />
      <p className="text-lg font-medium">Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
