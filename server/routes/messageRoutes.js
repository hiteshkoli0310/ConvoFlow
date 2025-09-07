import express from "express";
import {
  getUsersForSidebar,
  getMessages,
  markMessagesAsSeen,
} from "../controllers/messageController.js";
import { protect as protectRoute } from "../middleware/auth.js";

const MessageRouter = express.Router();

MessageRouter.get("/users", protectRoute, getUsersForSidebar);
MessageRouter.get("/:id", protectRoute, getMessages);
MessageRouter.put("/mark/:id", protectRoute, markMessagesAsSeen);
MessageRouter.post("/send/:id",protectRoute, sendMessage);

export default MessageRouter;
