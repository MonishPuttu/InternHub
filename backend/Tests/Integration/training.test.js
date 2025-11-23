import request from "supertest";
import { app } from "../../src/server.js";
import { getDb, cleanDatabase } from "../helpers/db-helper.js";
import {
  user,
  assessments,
  questions,
  student_attempts,
  student_profile,
  placement_profile,
} from "../../src/db/schema/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../helpers/auth-helpers.js";

describe("Training/Assessments API", () => {
  let db;
  let studentToken;
  let placementToken;
  let studentId;
  let placementId;
  let assessmentId;
  let attemptId;

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
      full_name: "Vikram Singh",
      roll_number: "CS21002",
      branch: "CSE",
      current_semester: "07",
      cgpa: "8.0",
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
      name: "Dr. Meera Iyer",
      department_branch: "CSE",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Generate tokens
    studentToken = await generateToken(studentId, "student");
    placementToken = await generateToken(placementId, "placement");
  });

  // ==================== POST /api/training/assessments ====================
  describe("POST /api/training/assessments", () => {
    const validAssessmentData = {
      title: "JavaScript Basics",
      description: "Test your JavaScript knowledge",
      type: "quiz",
      duration: 30,
      totalMarks: 100,
      passingMarks: 60,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      allowedBranches: ["CSE", "IT"],
      questions: [
        {
          questionText: "What is JavaScript?",
          questionType: "mcq",
          options: [
            { id: 1, text: "A programming language" },
            { id: 2, text: "A markup language" },
          ],
          correctAnswer: [1],
          marks: 10,
          difficulty: "easy",
          tags: ["javascript"],
        },
      ],
    };

    it("should create assessment as placement officer", async () => {
      const response = await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`)
        .send(validAssessmentData);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain("created successfully");
      expect(response.body.data).toHaveProperty("id");
      assessmentId = response.body.data.id;
    });

    it("should reject creation by non-placement users", async () => {
      const response = await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(validAssessmentData);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("Access denied");
    });

    it("should reject assessment with missing required fields", async () => {
      const response = await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`)
        .send({ title: "Test" });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("required");
    });

    it("should reject assessment without departments", async () => {
      const response = await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`)
        .send({
          ...validAssessmentData,
          allowedBranches: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("department");
    });

    it("should reject assessment without questions", async () => {
      const response = await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`)
        .send({
          ...validAssessmentData,
          questions: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain("question");
    });
  });

  // ==================== GET /api/training/assessments ====================
  describe("GET /api/training/assessments", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`)
        .send({
          title: "Python Test",
          description: "Python assessment",
          type: "quiz",
          duration: 45,
          totalMarks: 50,
          passingMarks: 30,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          allowedBranches: ["CSE"],
          questions: [
            {
              questionText: "What is Python?",
              questionType: "mcq",
              options: [{ id: 1, text: "A language" }],
              correctAnswer: [1],
              marks: 5,
              difficulty: "easy",
              tags: ["python"],
            },
          ],
        });
      assessmentId = response.body.data.id;
    });

    it("should return all assessments for placement officer", async () => {
      const response = await request(app)
        .get("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("all");
      expect(response.body.data).toHaveProperty("recentlyCreated");
      expect(response.body.data).toHaveProperty("ongoing");
      expect(response.body.data).toHaveProperty("completed");
    });

    it("should reject access by non-placement users", async () => {
      const response = await request(app)
        .get("/api/training/assessments")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== GET /api/training/assessments/:assessmentId ====================
  describe("GET /api/training/assessments/:assessmentId", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`)
        .send({
          title: "Java Assessment",
          description: "Java quiz",
          type: "quiz",
          duration: 60,
          totalMarks: 100,
          passingMarks: 60,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          allowedBranches: ["CSE"],
          questions: [
            {
              questionText: "What is Java?",
              questionType: "mcq",
              options: [
                { id: 1, text: "A language", isCorrect: true },
                { id: 2, text: "A drink", isCorrect: false },
              ],
              correctAnswer: [1],
              marks: 10,
              difficulty: "easy",
              tags: ["java"],
            },
          ],
        });
      assessmentId = response.body.data.id;
    });

    it("should return assessment details with questions", async () => {
      const response = await request(app)
        .get(`/api/training/assessments/${assessmentId}`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.assessment).toHaveProperty("id");
      expect(response.body.data.assessment.title).toBe("Java Assessment");
      expect(Array.isArray(response.body.data.questions)).toBe(true);
      expect(response.body.data.questions.length).toBeGreaterThan(0);
    });

    it("should return 404 for non-existent assessment", async () => {
      const response = await request(app)
        .get(`/api/training/assessments/${crypto.randomUUID()}`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== GET /api/training/student/assessments ====================
  describe("GET /api/training/student/assessments", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`)
        .send({
          title: "Student Test",
          description: "Available test",
          type: "quiz",
          duration: 30,
          totalMarks: 50,
          passingMarks: 30,
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          allowedBranches: ["CSE"],
          questions: [
            {
              questionText: "Q1",
              questionType: "mcq",
              options: [{ id: 1, text: "A1" }],
              correctAnswer: [1],
              marks: 5,
              difficulty: "easy",
              tags: ["test"],
            },
          ],
        });
    });

    it("should return available assessments for student", async () => {
      const response = await request(app)
        .get("/api/training/student/assessments")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should reject access by non-students", async () => {
      const response = await request(app)
        .get("/api/training/student/assessments")
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== POST /api/training/student/assessments/:assessmentId/start ====================
  describe("POST /api/training/student/assessments/:assessmentId/start", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`)
        .send({
          title: "Active Assessment",
          description: "Test to start",
          type: "quiz",
          duration: 20,
          totalMarks: 20,
          passingMarks: 12,
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          allowedBranches: ["CSE"],
          questions: [
            {
              questionText: "Sample Question",
              questionType: "mcq",
              options: [
                { id: 1, text: "Option A" },
                { id: 2, text: "Option B" },
              ],
              correctAnswer: [1],
              marks: 10,
              difficulty: "medium",
              tags: ["general"],
            },
          ],
        });
      assessmentId = response.body.data.id;
    });

    it("should start assessment for student", async () => {
      const response = await request(app)
        .post(`/api/training/student/assessments/${assessmentId}/start`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.attempt).toHaveProperty("id");
      expect(response.body.data.attempt.status).toBe("in_progress");
      expect(Array.isArray(response.body.data.questions)).toBe(true);
      attemptId = response.body.data.attempt.id;
    });

    it("should reject start by non-students", async () => {
      const response = await request(app)
        .post(`/api/training/student/assessments/${assessmentId}/start`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });

    it("should return 404 for non-existent assessment", async () => {
      const response = await request(app)
        .post(`/api/training/student/assessments/${crypto.randomUUID()}/start`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  // ==================== DELETE /api/training/assessments/:assessmentId ====================
  describe("DELETE /api/training/assessments/:assessmentId", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/training/assessments")
        .set("Authorization", `Bearer ${placementToken}`)
        .send({
          title: "To Delete",
          description: "Will be deleted",
          type: "quiz",
          duration: 15,
          totalMarks: 10,
          passingMarks: 5,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          allowedBranches: ["CSE"],
          questions: [
            {
              questionText: "Q",
              questionType: "mcq",
              options: [{ id: 1, text: "A" }],
              correctAnswer: [1],
              marks: 5,
              difficulty: "easy",
              tags: ["test"],
            },
          ],
        });
      assessmentId = response.body.data.id;
    });

    it("should delete assessment as placement officer", async () => {
      const response = await request(app)
        .delete(`/api/training/assessments/${assessmentId}`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain("deleted successfully");
    });

    it("should return 404 for non-existent assessment", async () => {
      const response = await request(app)
        .delete(`/api/training/assessments/${crypto.randomUUID()}`)
        .set("Authorization", `Bearer ${placementToken}`);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it("should reject deletion by non-placement users", async () => {
      const response = await request(app)
        .delete(`/api/training/assessments/${assessmentId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });
});
