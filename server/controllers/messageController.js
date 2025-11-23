import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import { translateText } from "../lib/translator.js";

//Get all user except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );
    //Count the number of messages not seen
    const unseenMessages = {};
    // Store last message time for each user
    const userLastMessageMap = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        sender: user._id,
        receiver: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
      // Find the latest message exchanged with this user
      const lastMsg = await Message.findOne({
        $or: [
          { sender: userId, receiver: user._id },
          { sender: user._id, receiver: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .select("createdAt");
      userLastMessageMap[user._id] = lastMsg ? lastMsg.createdAt : null;
    });
    await Promise.all(promises);
    // Determine mutual follow status
    const me = await User.findById(userId).select("following followers");
    const usersWithLastMsg = filteredUsers.map((user) => {
      const u = user.toObject();
      u.lastMessageAt = userLastMessageMap[user._id] || null;
      const meFollows = me.following?.some(
        (id) => id.toString() === user._id.toString()
      );
      const theyFollow = user.following?.some(
        (id) => id.toString() === userId.toString()
      );
      u.mutualFollow = Boolean(meFollows && theyFollow);
      return u;
    });
    res.json({
      success: true,
      users: usersWithLastMsg,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Get all messages for selected user

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    // Enforce mutual follow
    const [me, other] = await Promise.all([
      User.findById(myId).select("following"),
      User.findById(selectedUserId).select("following"),
    ]);
    const meFollows = me?.following?.some(
      (id) => id.toString() === selectedUserId
    );
    const theyFollow = other?.following?.some(
      (id) => id.toString() === myId.toString()
    );
    if (!(meFollows && theyFollow)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Chat locked until both users follow each other",
        });
    }
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: selectedUserId },
        { sender: selectedUserId, receiver: myId },
      ],
    });
    await Message.updateMany(
      { sender: selectedUserId, receiver: myId },
      { seen: true }
    );
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({
      success: true,
      message: "Message marked as seen",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const sender = req.user._id;
    const receiver = req.params.id;

    const { text, image } = req.body;

    if (!receiver) {
      return res.status(400).json({ message: "Receiver is required." });
    }

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    // Enforce mutual follow
    const [me, other] = await Promise.all([
      User.findById(sender).select("following"),
      User.findById(receiver).select("following"),
    ]);
    const meFollows = me?.following?.some((id) => id.toString() === receiver);
    const theyFollow = other?.following?.some(
      (id) => id.toString() === sender.toString()
    );
    if (!(meFollows && theyFollow)) {
      return res
        .status(403)
        .json({ message: "Chat locked until both users follow each other" });
    }

    const newMessage = new Message({
      sender,
      receiver,
      text,
      image,
    });

    // Emit the new message to the receiver's socket immediately
    const receiverSocketId = userSocketMap[receiver];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Save to database after emitting
    await newMessage.save();

    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if the user is authorized to delete the message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    // Soft delete the message
    message.deleted = true;
    message.text = "This message was deleted";
    message.image = "";
    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
    // Emit update to both sender and receiver
    const senderSocketId = userSocketMap[message.sender];
    const receiverSocketId = userSocketMap[message.receiver];
    if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", message);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("messageDeleted", message);
    res.json({ success: true, message: "Message deleted", data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const translateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { targetLanguage, sourceLanguage } = req.body;

    // Validate inputs
    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Target language is required",
      });
    }

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user has access to this message (sender or receiver)
    const userId = req.user._id.toString();
    const isSender = message.sender.toString() === userId;
    const isReceiver = message.receiver.toString() === userId;

    if (!isSender && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to translate this message",
      });
    }

    // Don't translate if message has no text or is deleted
    if (!message.text || message.deleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot translate this message",
      });
    }

    // Perform translation
    const translationResult = await translateText(
      message.text,
      targetLanguage,
      sourceLanguage || 'auto'
    );

    if (!translationResult.success) {
      return res.status(500).json({
        success: false,
        message: translationResult.error || "Translation failed",
      });
    }

    // Return translation result
    res.status(200).json({
      success: true,
      data: {
        messageId: message._id,
        originalText: message.text,
        translatedText: translationResult.translatedText,
        detectedSourceLang: translationResult.detectedSourceLang,
        targetLang: translationResult.targetLang,
      },
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
