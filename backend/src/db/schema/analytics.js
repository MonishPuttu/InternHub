import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { user } from "./user.js";

// Application tracking table
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  company_name: text("company_name").notNull(),
  position: text("position").notNull(),
  industry: text("industry").notNull(), // Technology, Finance, Healthcare, Consulting, Other
  application_date: timestamp("application_date").notNull(),
  status: text("status").notNull().default("applied"), // applied, interview_scheduled, interviewed, offer, rejected
  package_offered: decimal("package_offered", { precision: 10, scale: 2 }), // in lakhs
  interview_date: timestamp("interview_date"),
  offer_date: timestamp("offer_date"),
  rejection_date: timestamp("rejection_date"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Skills assessment table
export const skill_assessments = pgTable("skill_assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  skill_name: text("skill_name").notNull(),
  category: text("category").notNull(),
  proficiency_level: integer("proficiency_level").notNull(), // 1-10
  assessed_date: timestamp("assessed_date").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Interview feedback table
export const interview_feedback = pgTable("interview_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  application_id: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  interviewer_name: text("interviewer_name"),
  round_number: integer("round_number").notNull(),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5
  conducted_date: timestamp("conducted_date").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});
