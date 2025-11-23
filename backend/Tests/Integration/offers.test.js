import request from "supertest";
import { app } from "../../src/server.js";
import { getDb, cleanDatabase } from "../helpers/db-helper.js";
import {
  user,
  posts,
  student_applications,
  offer_letters,
  student_profile,
} from "../../src/db/schema/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../helpers/auth-helpers.js";

describe("Offers API", () => {
  let db;
  let studentToken;
  let recruiterToken;
  let placementToken;
  let studentId;
  let recruiterId;
  let placementId;
  let postId;
  let applicationId;
  let offerId;

  beforeAll(() => {
    db = getDb();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Create test users
    const hashedPassword = await bcrypt.hash("testpass123", 10);

    // Student
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

    // Recruiter
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

    // Placement Officer
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

    // Create student profile
    await db.insert(student_profile).values({
      id: crypto.randomUUID(),
      user_id: studentId,
      full_name: "Test Student",
      branch: "CSE",
      current_semester: "07",
      cgpa: "8.5",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create post
    const [post] = await db
      .insert(posts)
      .values({
        id: crypto.randomUUID(),
        user_id: recruiterId,
        company_name: "Google India",
        position: "SDE Intern",
        industry: "Technology",
        application_date: new Date(),
        application_deadline: new Date("2026-12-31"),
        approval_status: "approved",
        status: "active",
        package_offered: "45.00",
        target_departments: ["CSE", "IT"],
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();
    postId = post.id;

    // Create application
    const [application] = await db
      .insert(student_applications)
      .values({
        id: crypto.randomUUID(),
        post_id: postId,
        student_id: studentId,
        application_status: "interview-scheduled",
        applied_at: new Date(),
        full_name: "Test Student",
        email: "student@test.com",
        roll_number: "CS21001",
        branch: "CSE",
        current_semester: "07",
        cgpa: "8.5",
        contact_number: "+91-9876543210",
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();
    applicationId = application.id;

    // Generate session tokens using the helper
    studentToken = await generateToken(studentId, "student");
    recruiterToken = await generateToken(recruiterId, "recruiter");
    placementToken = await generateToken(placementId, "placement");
  });

  // ==================== POST /api/offers/send ====================
  describe("POST /api/offers/send", () => {
    const validOfferData = {
      student_id: null,
      post_id: null,
      application_id: null,
      company_name: "Google India",
      position: "SDE Intern",
      package_offered: "45.00",
      joining_date: "2026-07-01",
      location: "Bangalore",
      offer_letter_file: "data:application/pdf;base64,JVBERi0xLj...",
      file_name: "offer_letter.pdf",
      file_type: "application/pdf",
      notes: "Congratulations!",
    };

    it("should send offer letter as recruiter", async () => {
      const response = await request(app)
        .post("/api/offers/send")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          ...validOfferData,
          student_id: studentId,
          post_id: postId,
          application_id: applicationId,
        });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.offer).toHaveProperty("id");
      expect(response.body.offer.status).toBe("pending_placement_approval");
      offerId = response.body.offer.id;
    });

    it("should reject offer send by non-recruiter", async () => {
      const response = await request(app)
        .post("/api/offers/send")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          ...validOfferData,
          student_id: studentId,
          post_id: postId,
          application_id: applicationId,
        });

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });

    it("should reject offer with missing fields", async () => {
      const response = await request(app)
        .post("/api/offers/send")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          student_id: studentId,
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });
  });

  // ==================== GET /api/offers/all ====================
  describe("GET /api/offers/all", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/offers/send")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          student_id: studentId,
          post_id: postId,
          application_id: applicationId,
          company_name: "Google India",
          position: "SDE Intern",
          package_offered: "45.00",
          joining_date: "2026-07-01",
          location: "Bangalore",
          offer_letter_file: "data:application/pdf;base64,test",
          file_name: "offer.pdf",
          file_type: "application/pdf",
        });
    });

    it("should return all offers for placement officer", async () => {
      const response = await request(app)
        .get("/api/offers/all")
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.offers)).toBe(true);
      expect(response.body.offers.length).toBeGreaterThan(0);
    });

    it("should reject access by non-placement users", async () => {
      const response = await request(app)
        .get("/api/offers/all")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== PUT /api/offers/approve/:offerId ====================
  describe("PUT /api/offers/approve/:offerId", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/offers/send")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          student_id: studentId,
          post_id: postId,
          application_id: applicationId,
          company_name: "Google India",
          position: "SDE Intern",
          package_offered: "45.00",
          joining_date: "2026-07-01",
          location: "Bangalore",
          offer_letter_file: "data:application/pdf;base64,test",
          file_name: "offer.pdf",
          file_type: "application/pdf",
        });
      offerId = response.body.offer.id;
    });

    it("should approve offer as placement officer", async () => {
      const response = await request(app)
        .put(`/api/offers/approve/${offerId}`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.offer.status).toBe("approved");
      expect(response.body.offer.approved_by).toBe(placementId);
    });

    it("should reject approval by non-placement users", async () => {
      const response = await request(app)
        .put(`/api/offers/approve/${offerId}`)
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(403);
    });

    it("should return 404 for non-existent offer", async () => {
      const response = await request(app)
        .put(`/api/offers/approve/999999`) // Use a non-existent integer ID
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(404);
    });
  });

  // ==================== GET /api/offers/my-offers ====================
  describe("GET /api/offers/my-offers", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/offers/send")
        .set("Authorization", `Bearer ${recruiterToken}`)
        .send({
          student_id: studentId,
          post_id: postId,
          application_id: applicationId,
          company_name: "Google India",
          position: "SDE Intern",
          package_offered: "45.00",
          joining_date: "2026-07-01",
          location: "Bangalore",
          offer_letter_file: "data:application/pdf;base64,test",
          file_name: "offer.pdf",
          file_type: "application/pdf",
        });
    });

    it("should return student's offers", async () => {
      const response = await request(app)
        .get("/api/offers/my-offers")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.offers)).toBe(true);
      expect(response.body.offers.length).toBeGreaterThan(0);
      expect(response.body.offers[0].student_id).toBe(studentId);
    });

    it("should reject access by non-students", async () => {
      const response = await request(app)
        .get("/api/offers/my-offers")
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(response.status).toBe(403);
    });
  });
});
