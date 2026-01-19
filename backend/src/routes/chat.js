import { db } from "../db/index.js";
import * as schema from "../db/schema/index.js";
import { eq, and } from "drizzle-orm";

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

export default function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    socket.on("join", async (userId) => {
      try {
        await socket.join(userId);
        console.log(`Socket ${socket.id} joined user room ${userId}`);
      } catch (e) {
        console.error(`Failed to join user room ${userId}:`, e);
      }
    });

    socket.on("join_room", async ({ roomId, userId }) => {
      try {
        // Check if user is a member of the room
        const isMember = await isUserInRoom(userId, roomId);

        if (!isMember) {
          socket.emit("error", {
            message: "You are not a member of this room",
          });
          return;
        }

        await socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        socket
          .to(roomId)
          .emit("user_joined_room", { roomId, socketId: socket.id });
      } catch (e) {
        console.error(`Failed to join room ${roomId}:`, e);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("leave_room", async (roomId) => {
      try {
        await socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
        socket
          .to(roomId)
          .emit("user_left_room", { roomId, socketId: socket.id });
      } catch (e) {
        console.error(`Failed to leave room ${roomId}:`, e);
      }
    });

    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, message } = data;
        if (!senderId || !receiverId || !message) {
          console.error("Invalid message data:", data);
          return;
        }

        const [saved] = await db
          .insert(schema.messages)
          .values({
            senderId,
            receiverId,
            message,
            roomId: null,
            createdAt: new Date(),
          })
          .returning();

        const users = await db
          .select()
          .from(schema.user)
          .where(eq(schema.user.id, senderId))
          .limit(1);

        const sender = users[0];
        const senderName = sender
          ? await getUserName(sender.id, sender.role)
          : "Unknown";

        const messageWithSender = {
          ...saved,
          senderName,
          senderEmail: sender?.email,
          senderRole: sender?.role,
        };

        console.log(`Sending message from ${senderId} to ${receiverId}`);
        io.to(receiverId).emit("receive_message", messageWithSender);
        io.to(senderId).emit("message_sent", messageWithSender);
      } catch (e) {
        console.error("Error sending message:", e);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    socket.on("send_room_message", async (data) => {
      try {
        const { senderId, roomId, message } = data;
        if (!senderId || !roomId || !message) {
          console.error("Invalid room message data:", data);
          return;
        }

        // Check if user is a member of the room
        const isMember = await isUserInRoom(senderId, roomId);

        if (!isMember) {
          socket.emit("error", {
            message: "You are not a member of this room",
          });
          return;
        }

        const [saved] = await db
          .insert(schema.messages)
          .values({
            senderId,
            receiverId: null,
            message,
            roomId: roomId,
            createdAt: new Date(),
          })
          .returning();

        const users = await db
          .select()
          .from(schema.user)
          .where(eq(schema.user.id, senderId))
          .limit(1);

        const sender = users[0];
        const senderName = sender
          ? await getUserName(sender.id, sender.role)
          : "Unknown";

        const msgWithDetails = {
          ...saved,
          timestamp: saved.createdAt,
          senderName,
          senderEmail: sender?.email,
          senderRole: sender?.role,
        };
        console.log(`Sending room message from ${senderId} to room ${roomId}`);

        // Create per-user receipts for all recipients (room members except sender)
        const members = await db
          .select()
          .from(schema.room_members)
          .where(eq(schema.room_members.roomId, roomId));

        const recipients = members
          .map((m) => m.userId)
          .filter((uid) => String(uid) !== String(senderId));

        // Insert receipt rows
        if (recipients.length) {
          const receiptRows = recipients.map((uid) => ({
            messageId: saved.id,
            userId: uid,
            status: "sent",
            createdAt: new Date(),
          }));
          await db.insert(schema.message_receipts).values(receiptRows);
        }

        // Attach initial receipts info for client
        msgWithDetails.receipts = recipients.map((uid) => ({ userId: uid, status: "sent" }));

        // Emit message to other sockets in the room (they'll receive and can ack)
        socket.to(roomId).emit("receive_room_message", msgWithDetails);
        // Notify sender that message is saved (include receipts)
        socket.emit("message_sent", msgWithDetails);
      } catch (e) {
        console.error("Error sending room message:", e);
        socket.emit("message_error", { error: "Failed to send room message" });
      }
    });

    // Acknowledgement from recipient that they've received the message (for delivery receipts)
    socket.on("message_received", async ({ messageId, roomId, userId }) => {
      try {
        if (!messageId || !userId) return;
        const now = new Date();

        // Update per-user receipt to delivered
        await db
          .update(schema.message_receipts)
          .set({ deliveredAt: now, status: "delivered" })
          .where(
            and(
              eq(schema.message_receipts.messageId, messageId),
              eq(schema.message_receipts.userId, userId)
            )
          );

        // Notify sender about this recipient delivery
        const [msgRow] = await db
          .select()
          .from(schema.messages)
          .where(eq(schema.messages.id, messageId))
          .limit(1);

        if (msgRow) {
          io.to(msgRow.senderId).emit("message_delivered", {
            messageId,
            userId,
            deliveredAt: now,
            roomId: msgRow.roomId,
          });
        }
      } catch (e) {
        console.error("Error handling message_received:", e);
      }
    });

    // Recipient notifies server that message(s) were read
    socket.on("message_read", async ({ messageId, roomId, userId }) => {
      try {
        if (!messageId || !userId) return;
        const now = new Date();

        // Update per-user receipt to read
        await db
          .update(schema.message_receipts)
          .set({ readAt: now, status: "read" })
          .where(
            and(
              eq(schema.message_receipts.messageId, messageId),
              eq(schema.message_receipts.userId, userId)
            )
          );

        const [msgRow] = await db
          .select()
          .from(schema.messages)
          .where(eq(schema.messages.id, messageId))
          .limit(1);

        if (msgRow) {
          io.to(msgRow.senderId).emit("message_read", {
            messageId,
            userId,
            readAt: now,
            roomId: msgRow.roomId,
          });
        }

        // Update unread_tracking: set lastReadMessageId and reset unreadCount for this user/room
        await db
          .update(schema.unread_tracking)
          .set({ lastReadMessageId: messageId, unreadCount: 0 })
          .where(
            and(
              eq(schema.unread_tracking.userId, userId),
              eq(schema.unread_tracking.roomId, roomId)
            )
          );
      } catch (e) {
        console.error("Error handling message_read:", e);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Disconnected:", socket.id, "Reason:", reason);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
}
