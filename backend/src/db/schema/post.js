import { pgTable, text, timestamp, uuid, decimal } from "drizzle-orm/pg-core";
import { user } from "./user.js";

// Dedicated posts table for recruiter opportunities
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  company_name: text("company_name").notNull(),
  position: text("position").notNull(),
  industry: text("industry").notNull(),
  application_date: timestamp("application_date").notNull(),
  application_deadline: timestamp("application_deadline"),// deadline date for auto deletion
  status: text("status").notNull().default("applied"),
  package_offered: decimal("package_offered", { precision: 10, scale: 2 }),
  notes: text("notes"),
  media: text("media"),
  approval_status: text("approval_status").default("pending"), // pending, approved, disapproved
  rejection_reason: text("rejection_reason"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export default posts;