import dotenv from "dotenv";
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

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
import trainingRoutes from "./routes/training.js";
import placementAnalyticsRoutes from "./routes/placement_analytics.js";
import timelineRoutes from "./routes/timeline.js";
import studentDataRoutes from "./routes/studentdata.js";
// import { startTimelineUpdater } from "./jobs/timeline-updater.js";
import offerRoutes from "./routes/offers.js";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL ||
    "http://localhost:3000" ||
    "https://internhub-git-dev2-monishs-projects-002a95eb.vercel.app",
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/student-applications", studentApplicationsRoutes);
app.use("/api/applications", studentApplicationsRoutes); // for testing purpose
app.use("/api", calendarRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/studentdata", studentDataRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/placement-analytics", placementAnalyticsRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.set("trust proxy", 1);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

chatSocket(io);

const port = process.env.PORT || 4000;

export { app, server, io };

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}
