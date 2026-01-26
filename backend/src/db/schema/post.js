import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { user } from "./user.js";

export const departmentEnum = pgEnum("department_branch", [
  "ECE",
  "CSE",
  "EEE",
  "MECH",
  "CIVIL",
  "IT",
  "MBA",
  "AIML",
  "MCA",
]);

// Dedicated posts table for recruiter opportunities
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  company_name: text("company_name").notNull(),

  positions: jsonb("positions").notNull(),
  // Stages for the application process (array of { name, order_index, status, completed_at })
  stages: jsonb("stages").default('[]'),

  industry: text("industry").notNull(),
  application_date: timestamp("application_date").notNull(),
  application_deadline: timestamp("application_deadline"),
  status: text("status").notNull().default("applied"),
  notes: text("notes"),
  media: text("media"),
  approval_status: text("approval_status").default("pending"),
  rejection_reason: text("rejection_reason"),

  target_departments: departmentEnum("target_departments").array(),

  interview_date: timestamp("interview_date"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export default posts;
