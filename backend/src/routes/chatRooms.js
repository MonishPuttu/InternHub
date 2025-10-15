import { db } from "../db/index.js";
import * as schema from "../db/schema/index.js";
import crypto from "crypto";
import { asc, eq, or, and } from "drizzle-orm";
import express from "express";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// Helper function to get user name from profile tables
async function getUserName(userId, role) {
  try {
    if (role === "student") {
      const profile = await db
        .select({ full_name: schema.student_profile.full_name })
        .from(schema.student_profile)
        .where(eq(schema.student_profile.user_id, userId))
        .limit(1);
      return profile[0]?.full_name || "Unknown";
    } else if (role === "placement") {
      const profile = await db
        .select({ name: schema.placement_profile.name })
        .from(schema.placement_profile)
        .where(eq(schema.placement_profile.user_id, userId))
        .limit(1);
      return profile[0]?.name || "Unknown";
    } else if (role === "recruiter") {
      const profile = await db
        .select({ full_name: schema.recruiter_profile.full_name })
        .from(schema.recruiter_profile)
        .where(eq(schema.recruiter_profile.user_id, userId))
        .limit(1);
      return profile[0]?.full_name || "Unknown";
    }
    return "Unknown";
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Unknown";
  }
}

// Helper function to check if user is member of room
async function isUserInRoom(userId, roomId) {
  const membership = await db
    .select()
    .from(schema.room_members)
    .where(
      and(
        eq(schema.room_members.userId, userId),
        eq(schema.room_members.roomId, roomId)
      )
    )
    .limit(1);

  return membership.length > 0;
}

router.post("/rooms", requireAuth, async (req, res) => {
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

// FIXED: Check room membership before returning messages
router.get("/rooms/:roomId/messages", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Check if user is a member of this room
    const isMember = await isUserInRoom(userId, roomId);

    if (!isMember) {
      return res.status(403).json({
        ok: false,
        error: "You are not a member of this room",
      });
    }

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

    // Get sender details for each message
    const messagesWithSenders = await Promise.all(
      msgs.map(async (m) => {
        const users = await db
          .select()
          .from(schema.user)
          .where(eq(schema.user.id, m.senderId))
          .limit(1);

        const sender = users[0];
        const senderName = sender
          ? await getUserName(sender.id, sender.role)
          : "Unknown";

        return {
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          message: m.message,
          roomId: m.roomId,
          createdAt: m.createdAt,
          timestamp: m.createdAt,
          senderName,
          senderEmail: sender?.email || "unknown",
          senderRole: sender?.role || "unknown",
        };
      })
    );

    res.json({ ok: true, messages: messagesWithSenders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/messages/:userId/:receiverId", requireAuth, async (req, res) => {
  const { userId, receiverId } = req.params;

  try {
    // Verify the requesting user is one of the participants
    if (req.user.id !== userId && req.user.id !== receiverId) {
      return res.status(403).json({
        ok: false,
        error: "You are not authorized to view these messages",
      });
    }

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

// FIXED: Check room membership before returning users
router.get("/rooms/:roomId/users", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Check if user is a member of this room
    const isMember = await isUserInRoom(userId, roomId);

    if (!isMember) {
      return res.status(403).json({
        ok: false,
        error: "You are not a member of this room",
      });
    }

    const roomMembers = await db
      .select({
        id: schema.user.id,
        email: schema.user.email,
        role: schema.user.role,
        joinedAt: schema.room_members.joinedAt,
      })
      .from(schema.room_members)
      .innerJoin(schema.user, eq(schema.room_members.userId, schema.user.id))
      .where(eq(schema.room_members.roomId, roomId));

    const usersWithNames = await Promise.all(
      roomMembers.map(async (member) => {
        const name = await getUserName(member.id, member.role);
        return {
          id: member.id,
          name,
          email: member.email,
          role: member.role,
          joinedAt: member.joinedAt,
        };
      })
    );

    res.json({ ok: true, users: usersWithNames });
  } catch (e) {
    console.error("Error fetching room users:", e);
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
