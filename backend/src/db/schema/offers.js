import {
  pgTable,
  serial,
  uuid,
  varchar,
  decimal,
  timestamp,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { student_applications } from "./Dashboard/student_applications.js";
import { posts } from "./post.js";
import { user } from "./user.js";

export const offer_letters = pgTable("offer_letters", {
  id: serial("id").primaryKey(),

  // All foreign keys must be UUID to match your existing tables
  application_id: uuid("application_id")
    .notNull()
    .references(() => student_applications.id, { onDelete: "cascade" }),

  student_id: uuid("student_id") // Changed from integer to uuid
    .notNull()
    .references(() => user.id),

  post_id: uuid("post_id") // Changed from integer to uuid
    .notNull()
    .references(() => posts.id),

  recruiter_id: uuid("recruiter_id") // Changed from integer to uuid
    .notNull()
    .references(() => user.id),

  company_name: varchar("company_name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }).notNull(),
  salary_package: decimal("salary_package", {
    precision: 10,
    scale: 2,
  }).notNull(),
  joining_date: timestamp("joining_date").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  bond_period: integer("bond_period").default(0),
  other_terms: text("other_terms"),
  offer_letter_url: varchar("offer_letter_url", { length: 500 }),
  status: varchar("status", { length: 50 })
    .default("pending_placement_approval")
    .notNull(),

  approved_by: uuid("approved_by").references(() => user.id), // Changed from integer to uuid
  approved_at: timestamp("approved_at"),
  placement_notes: text("placement_notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
