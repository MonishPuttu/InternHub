import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import crypto from "crypto";
import { asc, eq, or, and } from "drizzle-orm";
import express from "express";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/rooms", requireAuth, async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!name)
      return res.status(400).json({ ok: false, error: "name required" });

    const id = crypto.randomUUID();

    // Create the room
    await db.insert(schema.rooms).values({
      id,
      name,
      createdAt: new Date(),
    });

    // Add the creator as a member of the room
    await db.insert(schema.room_members).values({
      roomId: id,
      userId: req.user.id,
      joinedAt: new Date(),
    });

    res.status(201).json({ ok: true, room: { id, name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/rooms", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get rooms where the user is a member
    const userRooms = await db
      .select({
        id: schema.rooms.id,
        name: schema.rooms.name,
        createdAt: schema.rooms.createdAt,
      })
      .from(schema.rooms)
      .innerJoin(
        schema.room_members,
        eq(schema.rooms.id, schema.room_members.roomId)
      )
      .where(eq(schema.room_members.userId, userId));

    res.json({ ok: true, rooms: userRooms });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/messages", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is sender or receiver
    const msgs = await db
      .select()
      .from(schema.messages)
      .where(
        or(
          eq(schema.messages.senderId, userId),
          eq(schema.messages.receiverId, userId)
        )
      )
      .orderBy(asc(schema.messages.createdAt));

    console.log(`Fetched ${msgs.length} messages for user ${userId}`);
    res.json({ ok: true, messages: msgs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/rooms/:roomId/messages", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;

    const msgs = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.roomId, roomId))
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
      roomId: m.roomId,
      createdAt: m.createdAt,
      timestamp: m.createdAt, // Add timestamp alias for UI compatibility
    }));

    res.json({ ok: true, messages: normalized });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/messages/:userId/:receiverId", requireAuth, async (req, res) => {
  const { userId, receiverId } = req.params;

  try {
    const messages = await db
      .select()
      .from(schema.messages)
      .where(
        or(
          and(
            eq(schema.messages.senderId, userId),
            eq(schema.messages.receiverId, receiverId)
          ),
          and(
            eq(schema.messages.senderId, receiverId),
            eq(schema.messages.receiverId, userId)
          )
        )
      )
      .orderBy(asc(schema.messages.createdAt));

    res.json({ ok: true, messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/rooms/:roomId/users", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;

    const roomMembers = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        joinedAt: schema.room_members.joinedAt,
      })
      .from(schema.room_members)
      .innerJoin(schema.user, eq(schema.room_members.userId, schema.user.id))
      .where(eq(schema.room_members.roomId, roomId));

    res.json({ ok: true, users: roomMembers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.post("/rooms/:roomId/join", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await db
      .select()
      .from(schema.rooms)
      .where(eq(schema.rooms.id, roomId))
      .limit(1);

    if (room.length === 0) {
      return res.status(404).json({ ok: false, error: "Room not found" });
    }

    const existingMember = await db
      .select()
      .from(schema.room_members)
      .where(
        and(
          eq(schema.room_members.roomId, roomId),
          eq(schema.room_members.userId, userId)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return res.json({ ok: true, message: "Already a member" });
    }

    await db.insert(schema.room_members).values({
      roomId,
      userId,
      joinedAt: new Date(),
    });

    res.json({ ok: true, message: "Successfully joined room" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
