import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [messageCache, setMessageCache] = useState({});
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const { socket, axios, authUser } = useContext(AuthContext);
  
  const getMessages = useCallback(
    async (userId) => {
      try {
        const user = users.find((u) => u._id === userId);
        if (!user) {
          // users list not ready yet; skip fetch to avoid 403s from gated endpoint
          return;
        }
        if (user && !user.mutualFollow) {
          toast.error("Chat locked until both users follow each other");
          setMessages([]);
          return;
        }
        // Immediately show cached messages if available
        if (messageCache[userId]) {
          setMessages(messageCache[userId]);
          // Update unseen messages count
          setUnseenMessages((prev) => ({
            ...prev,
            [userId]: 0,
          }));
          return;
        }

        // If no cache, show empty array and fetch in background
    setMessages([]);
    const { data } = await axios.get(`/api/messages/${userId}`);
        if (data.success) {
          const sortedMessages = data.messages.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setMessages(sortedMessages);
          setMessageCache((prev) => ({
            ...prev,
            [userId]: sortedMessages,
          }));
          setUnseenMessages((prev) => ({
            ...prev,
            [userId]: 0,
          }));
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    [axios, messageCache]
  );

  // Prefetch messages for all users
  const prefetchMessages = useCallback(
    async (users) => {
      const prefetchPromises = users
        .filter((u) => u.mutualFollow) // only prefetch for unlocked chats
  .map(async (user) => {
  if (!messageCache[user._id]) {
          try {
            const { data } = await axios.get(`/api/messages/${user._id}`);
            if (data.success) {
              const sortedMessages = data.messages.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              setMessageCache((prev) => ({
                ...prev,
                [user._id]: sortedMessages,
              }));
            }
          } catch (error) {
            if (error.response?.status !== 403) {
              console.error(
                `Failed to prefetch messages for user ${user._id}:`,
                error
              );
            }
          }
        }
      });
      await Promise.all(prefetchPromises);
    },
    [axios, messageCache]
  );

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        if (data.unseenMessages) {
          setUnseenMessages(data.unseenMessages);
        }
        // Prefetch messages for all users in the background
        prefetchMessages(data.users);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios, prefetchMessages]);

  // Follow requests APIs
  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/follow/incoming");
      if (data.success) setIncomingRequests(data.requests);
    } catch (e) {
      console.error(e);
    }
  }, [axios]);

  const sendFollowRequest = useCallback(async (userId) => {
    try {
      const { data } = await axios.post(`/api/follow/request/${userId}`);
      if (data.success) toast.success("Follow request sent");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send request");
    }
  }, [axios]);

  const acceptRequest = useCallback(async (requestId) => {
    try {
      const { data } = await axios.post(`/api/follow/accept/${requestId}`);
      if (data.success) {
        toast.success("Request accepted");
        fetchRequests();
        // refresh users to update mutualFollow flags
        getUsers();
      }
    } catch (e) {
      toast.error("Failed to accept request");
    }
  }, [axios, fetchRequests, getUsers]);

  const rejectRequest = useCallback(async (requestId) => {
    try {
      const { data } = await axios.post(`/api/follow/reject/${requestId}`);
      if (data.success) {
        toast.success("Request rejected");
        fetchRequests();
      }
    } catch (e) {
      toast.error("Failed to reject request");
    }
  }, [axios, fetchRequests]);

  const sendMessage = useCallback(
    async (messageData) => {
      try {
        // Optimistically update UI
        const optimisticMessage = {
          _id: Date.now().toString(), // Temporary ID
          sender: authUser._id,
          receiver: selectedUser._id,
          text: messageData.text || "",
          image: messageData.image || "",
          createdAt: new Date().toISOString(),
          seen: false,
          deleted: false,
        };

        setMessages((prevMessages) => [optimisticMessage, ...prevMessages]);
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: [
            optimisticMessage,
            ...(prev[selectedUser._id] || []),
          ],
        }));

        // Send to server
        const { data } = await axios.post(
          `/api/messages/send/${selectedUser._id}`,
          messageData
        );

        // Update with real message data
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === optimisticMessage._id ? data : msg
          )
        );
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: prev[selectedUser._id].map((msg) =>
            msg._id === optimisticMessage._id ? data : msg
          ),
        }));
      } catch (error) {
        // Revert optimistic update on error
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== Date.now().toString())
        );
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: prev[selectedUser._id].filter(
            (msg) => msg._id !== Date.now().toString()
          ),
        }));
        const msg = error.response?.data?.message || "Failed to send message";
        toast.error(msg);
        throw error;
      }
    },
    [axios, selectedUser, authUser]
  );

  const subscribeToMessages = useCallback(() => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.sender === selectedUser._id) {
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
        // Update cache
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: [newMessage, ...(prev[selectedUser._id] || [])],
        }));
        axios.put(`/api/messages/mark/${newMessage._id}`);
        setUnseenMessages((prev) => ({
          ...prev,
          [selectedUser._id]: 0,
        }));
      } else if (
        selectedUser &&
        newMessage.sender === authUser._id &&
        newMessage.receiver === selectedUser._id
      ) {
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
        // Update cache
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: [newMessage, ...(prev[selectedUser._id] || [])],
        }));
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.sender]: (prevUnseenMessages[newMessage.sender] || 0) + 1,
        }));
      }
    });
    socket.on("messageDeleted", (deletedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === deletedMsg._id ? deletedMsg : msg))
      );
      setMessageCache((prev) => {
        const updated = { ...prev };
        if (selectedUser && updated[selectedUser._id]) {
          updated[selectedUser._id] = updated[selectedUser._id].map((msg) =>
            msg._id === deletedMsg._id ? deletedMsg : msg
          );
        }
        return updated;
      });
    });
    // Follow sockets
    socket.on("followRequest", () => {
      fetchRequests();
    });
    socket.on("followAccepted", () => {
      // refresh users to update mutual flags and potentially unlock chat
      getUsers();
    });
  }, [socket, selectedUser, authUser, axios]);

  const unsubscribeFromMessages = useCallback(() => {
    if (socket) socket.off("newMessage");
    if (socket) socket.off("messageDeleted");
    if (socket) socket.off("followRequest");
    if (socket) socket.off("followAccepted");
  }, [socket]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (authUser) fetchRequests();
  }, [authUser, fetchRequests]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
    }
  }, [selectedUser]);

  // When users list updates, refresh selectedUser reference to keep flags (mutualFollow) in sync
  useEffect(() => {
    if (selectedUser && users?.length) {
      const updated = users.find((u) => u._id === selectedUser._id);
      if (updated) setSelectedUser(updated);
    }
  }, [users]);

  const deleteMessage = useCallback(
    async (messageId) => {
      try {
        const originalMessages = [...messages];
        
        // Optimistically update message in state and cache
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  text: "This message was deleted",
                  deleted: true,
                  image: "",
                }
              : msg
          )
        );

        // Update message cache
        if (selectedUser) {
          setMessageCache((prev) => ({
            ...prev,
            [selectedUser._id]: messages.map((msg) =>
              msg._id === messageId
                ? {
                    ...msg,
                    text: "This message was deleted",
                    deleted: true,
                    image: "",
                  }
                : msg
            ),
          }));
        }

        // Make API call to delete message
        const res = await axios.delete(`/api/messages/${messageId}`);

        if (!res.data.success) {
          // Revert the optimistic update if API call fails
          setMessages(originalMessages);
          if (selectedUser) {
            setMessageCache((prev) => ({
              ...prev,
              [selectedUser._id]: originalMessages,
            }));
          }
          toast.error(res.data.message || "Failed to delete message");
        } else {
          toast.success("Message deleted successfully");
          // Notify other users about the message deletion via socket
          if (socket) {
            socket.emit("messageDeleted", {
              messageId,
              receiverId: selectedUser?._id
            });
          }
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        // Revert the optimistic update on error
        setMessages(originalMessages);
        if (selectedUser) {
          setMessageCache((prev) => ({
            ...prev,
            [selectedUser._id]: originalMessages,
          }));
        }
        toast.error("Failed to delete message");
      }
    },
    [messages, selectedUser, axios, socket]
  );

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    deleteMessage,
    incomingRequests,
    fetchRequests,
    sendFollowRequest,
    acceptRequest,
    rejectRequest,
    showRequestsPanel,
    setShowRequestsPanel,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
