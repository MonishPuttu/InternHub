import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js"; // User login/signup routes
import chatSocket from "./routes/chat.js"; // Websocket chat logic
import chatRoutes from "./routes/chatRooms.js"; // Rooms logic
import calendarRoutes from "./routes/calendar.js"; // calendar
import analyticsRoutes from "./routes/analytics.js"; // Stats logic
import profileRoutes from "./routes/profile.js"; // Profile Page
import dashboardRoutes from "./routes/Dashboard/Dashboard.js"; // Dashobard page
import studentApplicationsRoutes from "./routes/Dashboard/student_application.js"; // Dashobard page [placementcell]
import postsRoutes from "./routes/posts.js"; // Post management routes
import trainingRoutes from "./routes/training.js"; // Training part routes
import placementAnalyticsRoutes from "./routes/placement_analytics.js";
import timelineRoutes from "./routes/timeline.js";
// import { startTimelineUpdater } from "./jobs/timeline-updater.js";

const app = express();

import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/student-applications", studentApplicationsRoutes);
app.use("/api", calendarRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/timeline", timelineRoutes);

app.use("/api/placement-analytics", placementAnalyticsRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.set("trust proxy", 1);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

chatSocket(io);

// startTimelineUpdater();

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
