// Tests/setup/seed-test-data.js
import crypto from "crypto";
import { getDb } from "../helpers/db-helper.js";
import {
  user,
  student_profile,
  education,
  projects,
  social_links,
  posts,
  student_applications,
  offer_letters,
  sent_lists,
  application_timeline,
  leaderboard,
  assessments,
  questions,
  student_attempts,
  student_answers,
  report_cards,
  rooms,
  room_members,
  messages,
  calevents,
} from "../../src/db/schema/index.js";
import bcrypt from "bcryptjs";

// Fixed UUIDs for predictable testing
const FIXED_IDS = {
  users: {
    student: "00000000-0000-0000-0000-000000000001",
    recruiter: "00000000-0000-0000-0000-000000000002",
    placement: "00000000-0000-0000-0000-000000000003",
  },
  profiles: {
    student: "00000000-0000-0000-0000-000000000101",
  },
  posts: {
    approved: "00000000-0000-0000-0000-000000000201",
    pending: "00000000-0000-0000-0000-000000000202",
  },
  applications: {
    applied: "00000000-0000-0000-0000-000000000301",
    offered: "00000000-0000-0000-0000-000000000302",
  },
};

export async function seedTestData() {
  const db = getDb();
  const passwordHash = await bcrypt.hash("1234567890", 10);
  const now = new Date();

  // --- USERS ---
  const testUsers = [
    {
      id: FIXED_IDS.users.student,
      email: "student@gmail.com",
      password: passwordHash,
      role: "student",
      email_verified: now,
      created_at: now,
    },
    {
      id: FIXED_IDS.users.recruiter,
      email: "recruiter@gmail.com",
      password: passwordHash,
      role: "recruiter",
      email_verified: now,
      created_at: now,
    },
    {
      id: FIXED_IDS.users.placement,
      email: "placementcell@gmail.com",
      password: passwordHash,
      role: "placement",
      email_verified: now,
      created_at: now,
    },
  ];

  await db.insert(user).values(testUsers);

  // --- STUDENT PROFILE ---
  await db.insert(student_profile).values({
    id: FIXED_IDS.profiles.student,
    user_id: FIXED_IDS.users.student,
    full_name: "Test Student",
    branch: "CSE",
    current_semester: "07",
    cgpa: "8.5",
    tenth_score: "90",
    twelfth_score: "85",
    linkedin: "https://linkedin.com/in/teststudent",
    contact_number: "+91-9876543210",
    career_path: "placement",
    created_at: now,
    updated_at: now,
  });

  // --- EDUCATION ---
  await db.insert(education).values({
    id: crypto.randomUUID(),
    user_id: FIXED_IDS.users.student,
    institution: "IIT Madras",
    degree: "B.Tech",
    field_of_study: "CSE",
    start_date: "2021-08-01",
    end_date: "2025-05-31",
    grade: "8.5",
    created_at: now,
    updated_at: now,
  });

  // --- PROJECTS ---
  await db.insert(projects).values({
    id: crypto.randomUUID(),
    user_id: FIXED_IDS.users.student,
    title: "InternHub Platform",
    description: "Full-stack placement management system",
    technologies: "React, Node.js, PostgreSQL",
    project_url: "https://github.com/teststudent/internhub",
    start_date: "2024-01-01",
    end_date: "2024-06-30",
    created_at: now,
    updated_at: now,
  });

  // --- POSTS ---
  const testPosts = [
    {
      id: FIXED_IDS.posts.approved,
      user_id: FIXED_IDS.users.recruiter,
      company_name: "Google India",
      position: "SDE Intern",
      industry: "Technology",
      application_date: now,
      application_deadline: new Date(2025, 11, 31),
      approval_status: "approved",
      status: "active",
      package_offered: "45.00",
      notes: "Great opportunity for CSE students",
      target_departments: ["CSE", "IT"],
      created_at: now,
      updated_at: now,
    },
    {
      id: FIXED_IDS.posts.pending,
      user_id: FIXED_IDS.users.recruiter,
      company_name: "Microsoft",
      position: "Backend Developer Intern",
      industry: "Technology",
      application_date: now,
      application_deadline: new Date(2025, 11, 31),
      approval_status: "pending",
      status: "active",
      package_offered: "50.00",
      notes: "Pending approval",
      target_departments: ["CSE"],
      created_at: now,
      updated_at: now,
    },
  ];

  await db.insert(posts).values(testPosts);

  // --- APPLICATIONS ---
  const testApplications = [
    {
      id: FIXED_IDS.applications.applied,
      post_id: FIXED_IDS.posts.approved,
      student_id: FIXED_IDS.users.student,
      application_status: "applied",
      applied_at: now,
      full_name: "Test Student",
      email: "student@gmail.com",
      roll_number: "CS21001",
      branch: "CSE",
      current_semester: "07",
      cgpa: "8.5",
      tenth_score: "90",
      twelfth_score: "85",
      contact_number: "+91-9876543210",
      created_at: now,
      updated_at: now,
    },
  ];

  await db.insert(student_applications).values(testApplications);

  // --- TIMELINE ---
  await db.insert(application_timeline).values({
    id: crypto.randomUUID(),
    application_id: FIXED_IDS.applications.applied,
    event_type: "applied",
    title: "Application Submitted",
    description: "Application submitted successfully",
    event_date: now,
    visibility: "student",
    created_at: now,
  });

  // --- CALENDAR EVENTS ---
  await db.insert(calevents).values([
    {
      id: crypto.randomUUID(),
      userId: FIXED_IDS.users.placement,
      title: "Campus Drive",
      description: "Annual placement drive",
      eventDate: "2025-12-01",
      eventTime: "09:00:00",
      endTime: "17:00:00",
      eventType: "interview",
      location: "Main Auditorium",
      createdAt: now,
    },
  ]);

  return FIXED_IDS;
}

export { FIXED_IDS };
