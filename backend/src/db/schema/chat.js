import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  json,
} from "drizzle-orm/pg-core";
import { user } from "./user.js";

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  type: text("type").notNull().default("private"),
  description: text("description"),
  avatar: text("avatar"),
  settings: json("settings"),
  createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
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
  role: text("role").default("member"),
  permissions: json("permissions"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: uuid("room_id").references(() => rooms.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  receiverId: uuid("receiver_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  message: text("message").notNull(),
  status: text("status").notNull().default("sent"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  deletedFor: json("deleted_for"),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  originalMessage: text("original_message"),
  replyToId: integer("reply_to_id"),
  isStarred: boolean("is_starred").default(false),
  isPinned: boolean("is_pinned").default(false),
  forwardedFrom: uuid("forwarded_from"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  type: text("type"),
  url: text("url"),
  thumbnail: text("thumbnail"),
  size: integer("size"),
  filename: text("filename"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const user_presence = pgTable("user_presence", {
  userId: uuid("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("offline"),
  lastSeen: timestamp("last_seen"),
});

export const unread_tracking = pgTable("unread_tracking", {
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  unreadCount: integer("unread_count").default(0),
  lastReadMessageId: integer("last_read_message_id").references(() => messages.id),
});

export const message_receipts = pgTable("message_receipts", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("sent"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
