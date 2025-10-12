import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import assets from "../assets/assets";

const RequestsPanel = ({ hideHeader = false }) => {
  const { incomingRequests, acceptRequest, rejectRequest } = useContext(ChatContext);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {!hideHeader && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Follow Requests</h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {incomingRequests.map((req) => (
          <div key={req._id} className="flex items-center gap-3 p-3 rounded-xl glass-morphism">
            <img src={req.from?.profilePic || assets.avatar_icon} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{req.from?.fullName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => acceptRequest(req._id)}
                className="px-3 py-2 rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
              >
                Accept
              </button>
              <button
                onClick={() => rejectRequest(req._id)}
                className="px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {incomingRequests.length === 0 && (
          <div className="text-center opacity-70" style={{ color: 'var(--text-muted)' }}>No pending requests</div>
        )}
      </div>
    </div>
  );
};

export default RequestsPanel;
