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
import placementAnalyticsRoutes from './routes/placement_analytics.js';// Placement Analytics routes
import studentBulkRouter from "./routes/studentBulk.js";// Student bulk upload routes

const app = express();

app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json());

import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/student-applications", studentApplicationsRoutes);
app.use("/api", calendarRoutes);


app.use('/api/placement-analytics', placementAnalyticsRoutes);
app.use("/api/bulk-upload", studentBulkRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

chatSocket(io);

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
