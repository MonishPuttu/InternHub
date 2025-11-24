import request from "supertest";
import { app } from "../../src/server.js";
import { getDb, cleanDatabase } from "../helpers/db-helper.js";
import {
  user,
  posts,
  placement_profile,
  student_profile,
  recruiter_profile,
} from "../../src/db/schema/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../helpers/auth-helpers.js";
import { eq } from "drizzle-orm";

describe("Posts API", () => {
  let db;
  let studentToken;
  let recruiterToken;
  let placementToken;
  let studentId;
  let recruiterId;
  let placementId;
  let postId;

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
      full_name: "Rajesh Kumar",
      branch: "CSE",
      current_semester: "07",
      cgpa: "8.5",
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
      full_name: "Priya Sharma",
      company_name: "TCS",
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
      name: "Dr. Anil Verma",
      department_branch: "CSE",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Generate tokens
    studentToken = await generateToken(studentId, "student");
    recruiterToken = await generateToken(recruiterId, "recruiter");
    placementToken = await generateToken(placementId, "placement");
  });

  // ==================== POST /api/posts/applications ====================
  describe("POST /api/posts/applications", () => {
    const validPostData = {
      company_name: "Google India",
      position: "SDE Intern",
      industry: "Technology",
      application_deadline: "2026-12-31",
      package_offered: "45.00",
      target_departments: ["CSE", "IT"],
    };

    it("should create post as recruiter", async () => {
      const response = await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send(validPostData);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.application).toHaveProperty("id");
      expect(response.body.application.company_name).toBe("Google India");
      expect(response.body.application.approval_status).toBe("pending");
      postId = response.body.application.id;
    });

    it("should reject post creation by non-recruiter", async () => {
      const response = await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(validPostData);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("Only recruiters");
    });

    it("should reject post with missing required fields", async () => {
      const response = await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({ company_name: "Google" });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("required");
    });

    it("should reject post with invalid departments", async () => {
      const response = await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          ...validPostData,
          target_departments: ["INVALID_DEPT"],
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("Invalid departments");
    });
  });

  // ==================== GET /api/posts/applications ====================
  describe("GET /api/posts/applications", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          company_name: "Infosys",
          position: "Software Engineer",
          industry: "IT Services",
          target_departments: ["CSE"],
        });
    });

    it("should get posts for recruiter", async () => {
      const response = await request(app)
        .get("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.applications)).toBe(true);
      expect(response.body.applications.length).toBeGreaterThan(0);
    });

    it("should filter posts by status", async () => {
      const response = await request(app)
        .get("/api/posts/applications?status=applied")
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });

    it("should get posts for placement officer filtered by department", async () => {
      const response = await request(app)
        .get("/api/posts/applications")
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.applications)).toBe(true);
    });
  });

  // ==================== GET /api/posts/approved-posts ====================
  describe("GET /api/posts/approved-posts", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          company_name: "Wipro",
          position: "Developer",
          industry: "Technology",
          target_departments: ["CSE"],
        });

      postId = response.body.application.id;

      // Approve the post
      await db
        .update(posts)
        .set({ approval_status: "approved" })
        .where(eq(posts.id, postId));
    });

    it("should return approved posts for students", async () => {
      const response = await request(app)
        .get("/api/posts/approved-posts")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.posts.length).toBeGreaterThan(0);
    });

    it("should filter approved posts by student branch", async () => {
      const response = await request(app)
        .get("/api/posts/approved-posts")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      // All posts should match student's branch (CSE)
      response.body.posts.forEach((post) => {
        if (post.target_departments) {
          expect(post.target_departments).toContain("CSE");
        }
      });
    });

    it("should reject access by non-student and non-placement users", async () => {
      const response = await request(app)
        .get("/api/posts/approved-posts")
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== GET /api/posts/my-posts ====================
  describe("GET /api/posts/my-posts", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          company_name: "Amazon",
          position: "SDE",
          industry: "E-commerce",
          target_departments: ["CSE"],
        });
    });

    it("should return recruiter's own posts", async () => {
      const response = await request(app)
        .get("/api/posts/my-posts")
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.posts.length).toBeGreaterThan(0);
      expect(response.body.posts[0].company_name).toBe("Amazon");
    });

    it("should reject access by non-recruiters", async () => {
      const response = await request(app)
        .get("/api/posts/my-posts")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== PUT /api/posts/applications/:id ====================
  describe("PUT /api/posts/applications/:id", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          company_name: "Microsoft",
          position: "Intern",
          industry: "Software",
          target_departments: ["CSE"],
        });
      postId = response.body.application.id;
    });

    it("should update post as owner", async () => {
      const response = await request(app)
        .put(`/api/posts/applications/${postId}`)
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          position: "Senior Developer",
          package_offered: "50.00",
        });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.application.position).toBe("Senior Developer");
    });

    it("should return 404 for non-existent post", async () => {
      const response = await request(app)
        .put(`/api/posts/applications/${crypto.randomUUID()}`)
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({ position: "Updated" });

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it("should reject update with invalid departments", async () => {
      const response = await request(app)
        .put(`/api/posts/applications/${postId}`)
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          target_departments: ["FAKE_DEPT"],
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("Invalid departments");
    });
  });

  // ==================== DELETE /api/posts/applications/:id ====================
  describe("DELETE /api/posts/applications/:id", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          company_name: "Oracle",
          position: "Developer",
          industry: "Database",
          target_departments: ["CSE"],
        });
      postId = response.body.application.id;
    });

    it("should delete post as owner", async () => {
      const response = await request(app)
        .delete(`/api/posts/applications/${postId}`)
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });

    it("should allow placement officer to delete posts", async () => {
      const response = await request(app)
        .delete(`/api/posts/applications/${postId}`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
  });

  // ==================== GET /api/posts/applications/:id ====================
  describe("GET /api/posts/applications/:id", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/posts/applications")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          company_name: "Cognizant",
          position: "Analyst",
          industry: "Consulting",
          target_departments: ["CSE"],
        });
      postId = response.body.application.id;
    });

    it("should get post details as owner", async () => {
      const response = await request(app)
        .get(`/api/posts/applications/${postId}`)
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.application.id).toBe(postId);
      expect(response.body.application.company_name).toBe("Cognizant");
    });

    it("should return 404 for non-existent post", async () => {
      const response = await request(app)
        .get(`/api/posts/applications/${crypto.randomUUID()}`)
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });
});
