import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

// Department strength tracking
export const department_strength = pgTable("department_strength", {
    id: uuid("id").primaryKey().defaultRandom(),
    department: text("department").notNull().unique(),
    total_students: integer("total_students").notNull().default(0),
    year: text("year").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});

// Application analytics by department
export const department_applications = pgTable("department_applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    department: text("department").notNull(),
    post_id: uuid("post_id"),
    total_applied: integer("total_applied").notNull().default(0),
    total_not_applied: integer("total_not_applied").notNull().default(0),
    application_date: timestamp("application_date").defaultNow(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});

// Overall placement statistics
export const placement_statistics = pgTable("placement_statistics", {
    id: uuid("id").primaryKey().defaultRandom(),
    total_students: integer("total_students").notNull().default(0),
    total_placed: integer("total_placed").notNull().default(0),
    total_companies: integer("total_companies").notNull().default(0),
    highest_package: integer("highest_package").notNull().default(0),
    average_package: integer("average_package").notNull().default(0),
    year: text("year").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});