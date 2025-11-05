import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { user } from "./user.js";

// ASSESSMENTS
export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'daily', 'weekly', 'monthly'
  duration: integer("duration").notNull(), // in minutes
  total_marks: integer("total_marks").notNull(),
  passing_marks: integer("passing_marks").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  is_active: boolean("is_active").default(true),
  allowed_branches: jsonb("allowed_branches"),
  created_by: uuid("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// QUESTIONS
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assessment_id: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  question_text: text("question_text").notNull(),
  question_type: text("question_type").notNull(), // 'mcq', 'multiple_select', 'text'
  options: jsonb("options"), // [{ id: 1, text: "Option A" }]
  correct_answer: jsonb("correct_answer"), // For MCQ: ["1"], for multiple: ["1","2"]
  marks: integer("marks").notNull(),
  difficulty: text("difficulty"), // 'easy', 'medium', 'hard'
  tags: jsonb("tags"), // ['javascript', 'algorithms']
  order_index: integer("order_index").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// STUDENT ATTEMPTS
export const student_attempts = pgTable("student_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  student_id: uuid("student_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  assessment_id: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time"),
  status: text("status").notNull(), // 'in_progress', 'completed', 'timed_out'
  total_score: integer("total_score").default(0),
  percentage_score: integer("percentage_score").default(0),
  time_taken: integer("time_taken"), // in minutes
  is_evaluated: boolean("is_evaluated").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// STUDENT ANSWERS
export const student_answers = pgTable("student_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  attempt_id: uuid("attempt_id")
    .notNull()
    .references(() => student_attempts.id, { onDelete: "cascade" }),
  question_id: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  answer: jsonb("answer").notNull(),
  is_correct: boolean("is_correct"),
  marks_awarded: integer("marks_awarded").default(0),
  time_taken: integer("time_taken"), // seconds spent on question
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// LEADERBOARD
export const leaderboard = pgTable("leaderboard", {
  id: uuid("id").primaryKey().defaultRandom(),
  student_id: uuid("student_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  assessment_id: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  rank: integer("rank"),
  total_score: integer("total_score").notNull(),
  percentage_score: integer("percentage_score").notNull(),
  time_taken: integer("time_taken"),
  attempt_date: timestamp("attempt_date").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// REPORT CARDS
export const report_cards = pgTable("report_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  student_id: uuid("student_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  attempt_id: uuid("attempt_id")
    .notNull()
    .references(() => student_attempts.id, { onDelete: "cascade" }),
  assessment_id: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  overall_score: integer("overall_score").notNull(),
  percentage_score: integer("percentage_score").notNull(),
  grade: text("grade"), // 'A+', 'A', 'B+', etc.
  strengths: jsonb("strengths"), // ['Problem Solving']
  weaknesses: jsonb("weaknesses"), // ['Time Management']
  recommendations: text("recommendations"),
  detailed_analysis: jsonb("detailed_analysis"),
  generated_at: timestamp("generated_at").defaultNow(),
});
