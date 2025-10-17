import { pgTable, serial, text, timestamp, uuid, date, time } from "drizzle-orm/pg-core";

// Events Table schema

export const calevents = pgTable("calevents", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    eventDate: date("event_date").notNull(),
    eventTime: time("event_time").notNull(),
    endTime: time("end_time"),
    eventType: text("event_type").notNull().default("oncampus"),
    location: text("location"),
    eligibleStudents: text("eligible_students"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
