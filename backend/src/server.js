import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
<<<<<<< HEAD
import dotenv from "dotenv";
=======
>>>>>>> 240f552f0455cf4374ced2c58daf63175894c7da
import authRoutes from "./routes/auth.js"; // User login/signup routes
import chatSocket from "./routes/chat.js"; // Websocket chat logic
import chatRoutes from "./routes/chatRooms.js"; // Rooms logic
const app = express();

<<<<<<< HEAD
dotenv.config();

const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
=======
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
>>>>>>> 240f552f0455cf4374ced2c58daf63175894c7da
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

chatSocket(io);

const port = process.env.PORT || 4000;
<<<<<<< HEAD

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
=======
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
>>>>>>> 240f552f0455cf4374ced2c58daf63175894c7da
});
