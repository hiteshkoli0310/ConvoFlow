import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connect } from "http2";
import { connectDB } from "./lib/db.js";
import {server} from "socket.io";

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

//Initialize Socket.io server
export const io = new server.Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
});

//Store online users
export const userSocketMap = {}; // userId -> socketId

//Socket.io connection handling
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("New client connected with ID:", userId);
  
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  //emit online users to all connected clients
  io.emit("online-users", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("Client disconnected with ID:", userId);  
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("online-users", Object.keys(userSocketMap));
  });
  
}

// Middleware setup
app.use(cors());
app.use(express.json({ limit: "4mb" }));

//Route setup
app.use("/api/status", (req, res) => {
  res.send("Server is running");
});
app.use("/api/auth", UserRouter);
app.use("/api/messages", MessageRouter);

await connectDB();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
