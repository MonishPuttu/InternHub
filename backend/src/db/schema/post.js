import { pgTable, text, timestamp, uuid, decimal, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./user.js";

// ✅ Define an enum for allowed department branches
export const departmentEnum = pgEnum("department_branch", [
  "ECE",
  "CSE",
  "EEE",
  "MECH",
  "CIVIL",
  "IT",
  "MBA",
  "AIML",
  "MCA"
]);

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
  application_deadline: timestamp("application_deadline"), // deadline date for auto deletion
  status: text("status").notNull().default("applied"),
  package_offered: decimal("package_offered", { precision: 10, scale: 2 }),
  notes: text("notes"),
  media: text("media"),
  approval_status: text("approval_status").default("pending"), // pending, approved, disapproved
  rejection_reason: text("rejection_reason"),

  // ✅ Restrict target departments to predefined enum values
  target_departments: departmentEnum("target_departments").array(), 

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export default posts;
