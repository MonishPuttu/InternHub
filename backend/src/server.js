import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db/index.js";
import { session, user } from "./db/schema.js";
import { eq, asc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import http from "http";
import { Server } from "socket.io";
import * as schema from "./db/schema.js";
import { requireAuth } from "../src/middleware/authmiddleware.js";
import crypto from "crypto"; // <--- added import

const app = express();
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Registeration
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        ok: false,
        error: "Email, password, and name are required",
      });
    }

    // Check existing user
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUsers = await db
      .insert(user)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning();

    const newUser = newUsers[0];

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(session).values({
      token,
      userId: newUser.id,
      expiresAt,
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    res.status(201).json({
      ok: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// User Login
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: "Email and password are required",
      });
    }

    // Find user
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (users.length === 0) {
      return res.status(401).json({
        ok: false,
        error: "Invalid credentials",
      });
    }

    const foundUser = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, foundUser.password);

    if (!isValidPassword) {
      return res.status(401).json({
        ok: false,
        error: "Invalid credentials",
      });
    }

    // Create session
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(session).values({
      id: crypto.randomUUID(),
      token,
      userId: foundUser.id,
      expiresAt,
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    res.json({
      ok: true,
      user: { id: foundUser.id, email: foundUser.email, name: foundUser.name },
      token,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// User Logout
app.post("/api/auth/signout", requireAuth, async (req, res) => {
  try {
    const token = req.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ ok: false, error: "Missing token" });
    }

    await db.delete(session).where(eq(session.token, token));

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Store a session after login
app.post("/api/sessions", async (req, res) => {
  try {
    const { id, token, userId, expiresAt } = req.body ?? {};
    const ipAddress = req.ip ?? null;
    const userAgent = req.get("user-agent") ?? null;

    await db.insert(session).values({
      id,
      token,
      userId,
      expiresAt: new Date(expiresAt),
      ipAddress,
      userAgent,
    });

    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e) });
  }
});

// Get current user by Bearer token
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const token = req.get("authorization")?.replace("Bearer ", "");

    if (!token)
      return res.status(401).json({ ok: false, error: "missing token" });

    const rows = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    const s = rows[0];

    if (!s) return res.status(401).json({ ok: false, error: "invalid token" });

    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, s.userId))
      .limit(1);
    const u = users[0];

    if (!u) return res.status(404).json({ ok: false, error: "user not found" });

    res.json({ ok: true, user: u });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e) });
  }
});

// ---- SOCKET.IO CHAT LOGIC ----
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:3000"], methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // Join private room (by user ID)
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  // Join a group/room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Handle sending direct messages
  socket.on("send_message", async (data) => {
    const { senderId, receiverId, message } = data;
    const [saved] = await db
      .insert(schema.messages)
      .values({ senderId, receiverId, message })
      .returning();

    // Emit to receiver’s room (private)
    io.to(receiverId).emit("receive_message", saved);
  });

  // Handle sending room messages (broadcast to room)
  socket.on("send_room_message", async (data) => {
    const { senderId, roomId, message } = data;

    // Reuse messages table: store with receiverId = roomId (roomId must be unique id)
    const [saved] = await db
      .insert(schema.messages)
      .values({ senderId, receiverId: roomId, message })
      .returning();

    // Broadcast to all sockets in the room (including sender)
    io.to(roomId).emit("receive_room_message", saved);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

// ---- REST: Rooms and room messages ----
app.post("/api/rooms", requireAuth, async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!name)
      return res.status(400).json({ ok: false, error: "name required" });

    const id = crypto.randomUUID();
    await db.insert(schema.rooms).values({
      id,
      name,
      createdAt: new Date(),
    });

    res.status(201).json({ ok: true, room: { id, name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/api/rooms", requireAuth, async (_req, res) => {
  try {
    const rooms = await db.select().from(schema.rooms).all();
    res.json(rooms);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/api/rooms/:roomId/messages", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;

    const msgs = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.receiverId, roomId))
      .orderBy(asc(schema.messages.createdAt));

    console.log(
      `Fetched ${
        Array.isArray(msgs) ? msgs.length : 0
      } messages for room ${roomId}`
    );

    const normalized = (msgs ?? []).map((m) => ({
      id: m.id,
      senderId: m.senderId,
      receiverId: m.receiverId,
      message: m.message,
      createdAt: m.createdAt,
    }));

    res.json({ ok: true, messages: normalized });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(
    `🚀 Server (API + Socket.IO) running on http://localhost:${port}`
  );
});
