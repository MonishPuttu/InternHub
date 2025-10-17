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
        io.to(roomId).emit("receive_room_message", msgWithDetails);
        socket.emit("message_sent", msgWithDetails);
      } catch (e) {
        console.error("Error sending room message:", e);
        socket.emit("message_error", { error: "Failed to send room message" });
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
