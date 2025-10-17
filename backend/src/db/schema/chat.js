import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user.js";

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  type: text("type").notNull().default("private"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const room_members = pgTable("room_members", {
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: uuid("room_id").references(() => rooms.id, { onDelete: "cascade" }), // REMOVED .notNull() - can be null for direct messages
  senderId: uuid("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  receiverId: uuid("receiver_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
