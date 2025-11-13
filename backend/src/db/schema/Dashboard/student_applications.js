import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "../user.js";
import { posts } from "../post.js";

export const student_applications = pgTable("student_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  post_id: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  student_id: uuid("student_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  application_status: text("application_status").default("applied"),
  applied_at: timestamp("applied_at").defaultNow(),

  full_name: text("full_name").notNull(),
  email: text("email").notNull(),
  roll_number: text("roll_number"),
  branch: text("branch"),
  current_semester: text("current_semester"),
  cgpa: text("cgpa"),
  tenth_score: text("tenth_score"),
  twelfth_score: text("twelfth_score"),
  contact_number: text("contact_number"),

  resume_link: text("resume_link"),
  cover_letter: text("cover_letter"),
  placement_notes: text("placement_notes"),

  // for timeline tracking
  interview_date: timestamp("interview_date"),
  interview_confirmed: boolean("interview_confirmed").default(false),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
