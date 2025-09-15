import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen sm:p-4">
      <div
        className={`
          backdrop-blur-xl 
          dark:bg-dark-secondary bg-light-secondary
          dark:border-dark-border border-light-border border
          rounded-2xl overflow-hidden h-full grid grid-cols-1 relative
          transition-all duration-300 ease-in-out
          ${
            selectedUser
              ? "fixed inset-0 sm:static sm:rounded-2xl sm:h-full"
              : "h-full"
          }
          ${
            selectedUser
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : "md:grid-cols-2"
          }
        `}
      >
        {/* Left Sidebar */}
        <div
          className={`
            ${selectedUser ? "hidden sm:block" : "block"}
            h-full overflow-hidden 
            dark:border-dark-border border-light-border border-r
            dark:bg-dark-bg bg-light-bg
          `}
        >
          <Sidebar />
        </div>

        {/* Chat Container */}
        <div className="h-full overflow-hidden dark:bg-dark-secondary bg-light-secondary">
          <ChatContainer />
        </div>

        {/* Right Sidebar */}
        <div
          className={`
            ${selectedUser ? "hidden sm:block" : "block"}
            h-full overflow-hidden
            dark:border-dark-border border-light-border border-l
            dark:bg-dark-bg bg-light-bg
          `}
        >
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default HomePage;