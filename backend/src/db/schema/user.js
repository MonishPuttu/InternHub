import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  email_verified: timestamp("email_verified"),
  image: text("image"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const student_profile = pgTable("student_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  full_name: text("full_name").notNull(),
  roll_number: text("roll_number").unique(),
  student_id: text("student_id").unique(),
  date_of_birth: timestamp("date_of_birth"),
  gender: text("gender"),
  contact_number: text("contact_number"),
  permanent_address: text("permanent_address"),
  current_address: text("current_address"),
  college_name: text("college_name"),
  profile_picture: text("profile_picture"),
  // Academic info
  website: text("website"),
  linkedin: text("linkedin"),
  branch: text("branch"),
  current_semester: text("current_semester"),
  cgpa: text("cgpa"),
  tenth_score: text("tenth_score"),
  twelfth_score: text("twelfth_score"),
  courses_certifications: text("courses_certifications"),
  emis: text("emis"),
  skills: text("skills"),
  extra_activities: text("extra_activities"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const placement_profile = pgTable("placement_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  employee_id: text("employee_id").unique(),
  date_of_birth: timestamp("date_of_birth"),
  gender: text("gender"),
  contact_number: text("contact_number"),
  role_designation: text("role_designation"),
  department_branch: text("department_branch"),
  college_name: text("college_name"),
  profile_picture: text("profile_picture"),
  headquarters_location: text("headquarters_location"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const recruiter_profile = pgTable("recruiter_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  full_name: text("full_name").notNull(),
  profile_picture: text("profile_picture"),
  date_of_birth: timestamp("date_of_birth"),
  gender: text("gender"),
  company_name: text("company_name"),
  role_designation: text("role_designation"),
  industry_sector: text("industry_sector"),
  headquarters_location: text("headquarters_location"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const session = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});
