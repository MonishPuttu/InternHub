import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user.js";

// EDUCATION (For Profile)
export const education = pgTable("education", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  degree: text("degree").notNull(),
  institution: text("institution").notNull(),
  field_of_study: text("field_of_study"),
  start_date: text("start_date").notNull(),
  end_date: text("end_date"),
  grade: text("grade"),
  coursework: text("coursework"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// PROJECTS (For Profile)
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Project Info
  title: text("title").notNull(),
  description: text("description"),
  technologies: text("technologies"),
  project_url: text("project_url"),
  start_date: text("start_date"),
  end_date: text("end_date"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// SOCIAL LINKS (For Profile)
export const social_links = pgTable("social_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  portfolio_website: text("portfolio_website"),
  linkedin_profile: text("linkedin_profile"),
  github_profile: text("github_profile"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
