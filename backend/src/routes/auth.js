import express from "express";
import { db } from "../db/index.js";
import { user, session } from "../db/schema.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

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
        phone,
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

router.post("/signin", async (req, res) => {
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

router.post("/signout", requireAuth, async (req, res) => {
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

router.post("/sessions", async (req, res) => {
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

router.get("/me", requireAuth, async (req, res) => {
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

export default router;
