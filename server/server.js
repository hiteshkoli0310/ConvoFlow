import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connect } from "http2";
import { connectDB } from "./lib/db.js";

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json({ limit: "4mb" }));

app.use("/api/status", (req, res) => {
  res.send("Server is running");
});

await connectDB();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
