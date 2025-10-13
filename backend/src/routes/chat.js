import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

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

    socket.on("join_room", async (roomId) => {
      try {
        await socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        // Notify others in the room that someone joined
        socket
          .to(roomId)
          .emit("user_joined_room", { roomId, socketId: socket.id });
      } catch (e) {
        console.error(`Failed to join room ${roomId}:`, e);
      }
    });

    socket.on("leave_room", async (roomId) => {
      try {
        await socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
        // Notify others in the room that someone left
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
            roomId: null, // Direct message
            createdAt: new Date(),
          })
          .returning();

        console.log(`Sending message from ${senderId} to ${receiverId}`);
        io.to(receiverId).emit("receive_message", saved);

        // Also send to sender to confirm delivery
        io.to(senderId).emit("message_sent", saved);
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

        const msgWithTimestamp = {
          ...saved,
          timestamp: saved.createdAt,
        };

        console.log(`Sending room message from ${senderId} to room ${roomId}`);
        io.to(roomId).emit("receive_room_message", msgWithTimestamp);

        socket.emit("message_sent", msgWithTimestamp);
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
