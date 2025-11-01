// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import chatSocket from "./routes/chat.js";
import chatRoutes from "./routes/chatRooms.js";
import calendarRoutes from "./routes/calendar.js";
import analyticsRoutes from "./routes/analytics.js";
import profileRoutes from "./routes/profile.js";
import dashboardRoutes from "./routes/Dashboard/Dashboard.js";
import studentApplicationsRoutes from "./routes/Dashboard/student_application.js";
import postsRoutes from "./routes/posts.js";
import placementAnalyticsRoutes from "./routes/placement_analytics.js";
import studentBulkRouter from "./routes/studentBulk.js";

const app = express();

// Allowed origins
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/student-applications", studentApplicationsRoutes);
app.use("/api", calendarRoutes);
app.use("/api/placement-analytics", placementAnalyticsRoutes);
app.use("/api/bulk-upload", studentBulkRouter);

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

chatSocket(io);

// Start server
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
