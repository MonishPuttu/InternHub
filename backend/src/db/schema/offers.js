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

  application_id: uuid("application_id").references(
    () => student_applications.id,
    { onDelete: "cascade" }
  ),

  student_id: uuid("student_id")
    .notNull()
    .references(() => user.id),

  post_id: uuid("post_id").references(() => posts.id),

  recruiter_id: uuid("recruiter_id").references(() => user.id),

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
  offer_letter_url: text("offer_letter_url"),
  file_name: varchar("file_name", { length: 255 }),
  file_type: varchar("file_type", { length: 100 }),
  status: varchar("status", { length: 50 })
    .default("pending_placement_approval")
    .notNull(),

  approved_by: uuid("approved_by").references(() => user.id),
  approved_at: timestamp("approved_at"),
  placement_notes: text("placement_notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
