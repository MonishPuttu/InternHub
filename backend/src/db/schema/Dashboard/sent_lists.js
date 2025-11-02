import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { user } from "../user.js";
import { posts } from "../post.js";

export const sent_lists = pgTable("sent_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  post_id: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  sent_by: uuid("sent_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sent_to: uuid("sent_to")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  list_data: jsonb("list_data").notNull(), // Store the application list data
  sent_at: timestamp("sent_at").defaultNow(),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
