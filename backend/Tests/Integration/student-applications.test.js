import request from "supertest";
import { app } from "../../src/server.js";
import { getDb, cleanDatabase } from "../helpers/db-helper.js";
import {
  user,
  posts,
  student_applications,
  student_profile,
  recruiter_profile,
  placement_profile,
} from "../../src/db/schema/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../helpers/auth-helpers.js";

describe("Student Applications API", () => {
  let db;
  let studentToken;
  let recruiterToken;
  let placementToken;
  let studentId;
  let recruiterId;
  let placementId;
  let postId;
  let applicationId;

  beforeAll(() => {
    db = getDb();
  });

  beforeEach(async () => {
    await cleanDatabase();

    const hashedPassword = await bcrypt.hash("testpass123", 10);

    // Create Student
    const [student] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        email: "student@test.com",
        password: hashedPassword,
        role: "student",
        email_verified: new Date(),
        created_at: new Date(),
      })
      .returning();
    studentId = student.id;

    await db.insert(student_profile).values({
      id: crypto.randomUUID(),
      user_id: studentId,
      full_name: "Amit Patel",
      roll_number: "CS21001",
      branch: "CSE",
      current_semester: "07",
      cgpa: "8.5",
      tenth_score: "90",
      twelfth_score: "85",
      contact_number: "+91-9876543210",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create Recruiter
    const [recruiter] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        email: "recruiter@test.com",
        password: hashedPassword,
        role: "recruiter",
        email_verified: new Date(),
        created_at: new Date(),
      })
      .returning();
    recruiterId = recruiter.id;

    await db.insert(recruiter_profile).values({
      id: crypto.randomUUID(),
      user_id: recruiterId,
      full_name: "Sneha Reddy",
      company_name: "Infosys",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create Placement Officer
    const [placement] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        email: "placement@test.com",
        password: hashedPassword,
        role: "placement",
        email_verified: new Date(),
        created_at: new Date(),
      })
      .returning();
    placementId = placement.id;

    await db.insert(placement_profile).values({
      id: crypto.randomUUID(),
      user_id: placementId,
      name: "Dr. Suresh Kumar",
      department_branch: "CSE",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create approved post
    const [post] = await db
      .insert(posts)
      .values({
        id: crypto.randomUUID(),
        user_id: recruiterId,
        company_name: "TCS",
        position: "Software Engineer",
        industry: "IT Services",
        application_date: new Date(),
        application_deadline: new Date("2026-12-31"),
        approval_status: "approved",
        status: "active",
        target_departments: ["CSE", "IT"],
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();
    postId = post.id;

    // Generate tokens
    studentToken = await generateToken(studentId, "student");
    recruiterToken = await generateToken(recruiterId, "recruiter");
    placementToken = await generateToken(placementId, "placement");
  });

  // ==================== POST /api/applications/apply/:postId ====================
  describe("POST /api/applications/apply/:postId", () => {
    it("should allow student to apply to approved post", async () => {
      const response = await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          cover_letter: "I am interested in this position",
          resume_link: "https://example.com/resume.pdf",
        });

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.application).toHaveProperty("id");
      expect(response.body.application.post_id).toBe(postId);
      expect(response.body.application.student_id).toBe(studentId);
      applicationId = response.body.application.id;
    });

    it("should reject application by non-students", async () => {
      const response = await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("Only students");
    });

    it("should reject duplicate application", async () => {
      // Apply first time
      await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});

      // Try to apply again
      const response = await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("Already applied");
    });

    it("should return 404 for non-existent post", async () => {
      const response = await request(app)
        .post(`/api/applications/apply/${crypto.randomUUID()}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("Post not found");
    });
  });

  // ==================== GET /api/applications/my-applications ====================
  describe("GET /api/applications/my-applications", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});
    });

    it("should return student's applications", async () => {
      const response = await request(app)
        .get("/api/applications/my-applications")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.applications)).toBe(true);
      expect(response.body.applications.length).toBeGreaterThan(0);
      expect(response.body.applications[0].application.student_id).toBe(
        studentId
      );
    });

    it("should reject access by non-students", async () => {
      const response = await request(app)
        .get("/api/applications/my-applications")
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== GET /api/applications/check-applied/:postId ====================
  describe("GET /api/applications/check-applied/:postId", () => {
    it("should return false when student has not applied", async () => {
      const response = await request(app)
        .get(`/api/applications/check-applied/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.hasApplied).toBe(false);
    });

    it("should return true when student has applied", async () => {
      // Apply first
      await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});

      // Check if applied
      const response = await request(app)
        .get(`/api/applications/check-applied/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.hasApplied).toBe(true);
    });
  });

  // ==================== GET /api/applications/all-applications ====================
  describe("GET /api/applications/all-applications", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});
    });

    it("should return all applications for placement officer", async () => {
      const response = await request(app)
        .get("/api/applications/all-applications")
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.applications)).toBe(true);
      expect(response.body.applications.length).toBeGreaterThan(0);
    });

    it("should reject access by non-placement users", async () => {
      const response = await request(app)
        .get("/api/applications/all-applications")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== PUT /api/applications/application/:applicationId/status ====================
  describe("PUT /api/applications/application/:applicationId/status", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});
      applicationId = response.body.application.id;
    });

    it("should update application status as placement officer", async () => {
      const response = await request(app)
        .put(`/api/applications/application/${applicationId}/status`)
        .set("Authorization", `Bearer ${placementToken}`)
        .send({
          application_status: "shortlisted",
          placement_notes: "Good candidate",
        });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.application.application_status).toBe("shortlisted");
    });

    it("should reject status update by non-placement users", async () => {
      const response = await request(app)
        .put(`/api/applications/application/${applicationId}/status`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ application_status: "shortlisted" });

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== GET /api/applications/post/:postId/applications ====================
  describe("GET /api/applications/post/:postId/applications", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});
    });

    it("should return applications for a post (placement officer)", async () => {
      const response = await request(app)
        .get(`/api/applications/post/${postId}/applications`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.applications)).toBe(true);
    });

    it("should return empty array for non-placement users", async () => {
      const response = await request(app)
        .get(`/api/applications/post/${postId}/applications`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.applications).toEqual([]);
    });
  });

  // ==================== GET /api/applications/recruiter/applications ====================
  describe("GET /api/applications/recruiter/applications", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});
    });

    it("should return recruiter's applications", async () => {
      const response = await request(app)
        .get("/api/applications/recruiter/applications")
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.applications)).toBe(true);
    });

    it("should reject access by non-recruiters", async () => {
      const response = await request(app)
        .get("/api/applications/recruiter/applications")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== GET /api/applications/global-stats ====================
  describe("GET /api/applications/global-stats", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});
    });

    it("should return global statistics for placement officer", async () => {
      const response = await request(app)
        .get("/api/applications/global-stats")
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.stats).toHaveProperty("totalPosts");
      expect(response.body.stats).toHaveProperty("totalAppliedStudents");
      expect(response.body.stats).toHaveProperty("totalApplications");
    });

    it("should reject access by non-placement users", async () => {
      const response = await request(app)
        .get("/api/applications/global-stats")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== DELETE /api/applications/application/:applicationId ====================
  describe("DELETE /api/applications/application/:applicationId", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post(`/api/applications/apply/${postId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({});
      applicationId = response.body.application.id;
    });

    it("should delete application as placement officer", async () => {
      const response = await request(app)
        .delete(`/api/applications/application/${applicationId}`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain("deleted successfully");
    });

    it("should return 404 for non-existent application", async () => {
      const response = await request(app)
        .delete(`/api/applications/application/${crypto.randomUUID()}`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it("should reject deletion by non-placement users", async () => {
      const response = await request(app)
        .delete(`/api/applications/application/${applicationId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });
});
