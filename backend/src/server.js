import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js"; // User login/signup routes
import chatSocket from "./routes/chat.js"; // Websocket chat logic
import chatRoutes from "./routes/chatRooms.js"; // Rooms logic
import calendarRoutes from "./routes/calendar.js";// calendar
const app = express();
const router = express.Router();

app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api", calendarRoutes(router));

app.get("/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:3000"], methods: ["GET", "POST"] },
});

chatSocket(io);

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
