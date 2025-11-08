import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { student_applications } from "./Dashboard/student_applications.js";

// Timeline events for each application
export const application_timeline = pgTable("application_timeline", {
  id: uuid("id").primaryKey().defaultRandom(),
  application_id: uuid("application_id")
    .notNull()
    .references(() => student_applications.id, { onDelete: "cascade" }),

  event_type: text("event_type").notNull(), // "applied", "interview_scheduled", "interviewed", "offered", "rejected"
  title: text("title").notNull(),
  description: text("description"),
  event_date: timestamp("event_date").notNull(),

  metadata: jsonb("metadata"),
  visibility: text("visibility").default("student"),

  created_at: timestamp("created_at").defaultNow(),
});
