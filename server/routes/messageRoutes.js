import express from "express";
import {
  getUsersForSidebar,
  getMessages,
  markMessagesAsSeen,
  sendMessage,
} from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const MessageRouter = express.Router();

MessageRouter.get("/users", protectRoute, getUsersForSidebar);
MessageRouter.get("/:id", protectRoute, getMessages);
MessageRouter.put("/mark/:id", protectRoute, markMessagesAsSeen);
MessageRouter.post("/send/:id", protectRoute, sendMessage);

export default MessageRouter;
