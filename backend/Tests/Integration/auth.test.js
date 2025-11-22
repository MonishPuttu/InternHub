import request from "supertest";
import { app } from "../../src/server.js";
import {
  setupTestDatabase,
  getDb,
  cleanDatabase,
  closeDatabase,
} from "../helpers/db-helper.js";
import { user, session } from "../../src/db/schema/user.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import crypto from "crypto";

describe("Authentication API", () => {
  let testUserId;
  let db;

  beforeAll(async () => {
    db = getDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /api/auth/signup", () => {
    it("should create new student user", async () => {
      const response = await request(app).post("/api/auth/signup").send({
        email: "testuser@example.com",
        password: "testpass123",
        role: "student",
      });

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.user).toHaveProperty("id");

      testUserId = response.body.user.id;
    });

    it("should reject duplicate email", async () => {
      const hashedPassword = await bcrypt.hash("testpass123", 10);
      const [created] = await db
        .insert(user)
        .values({
          id: crypto.randomUUID(),
          email: "testuser@example.com",
          password: hashedPassword,
          role: "student",
          created_at: new Date(),
        })
        .returning();

      testUserId = created.id;

      const response = await request(app).post("/api/auth/signup").send({
        email: "testuser@example.com",
        password: "testpass123",
        role: "student",
      });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("POST /api/auth/signin", () => {
    it("should login with valid credentials", async () => {
      const signupResponse = await request(app).post("/api/auth/signup").send({
        email: "logintest@example.com",
        password: "testpass123",
        role: "student",
      });

      expect(signupResponse.status).toBe(201);
      testUserId = signupResponse.body.user.id;

      const loginResponse = await request(app).post("/api/auth/signin").send({
        email: "logintest@example.com",
        password: "testpass123",
        role: "student",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.ok).toBe(true);
      expect(loginResponse.body).toHaveProperty("token");
    });

    it("should reject invalid password", async () => {
      const signupResponse = await request(app).post("/api/auth/signup").send({
        email: "testuser@example.com",
        password: "testpass123",
        role: "student",
      });

      expect(signupResponse.status).toBe(201);
      testUserId = signupResponse.body.user.id;

      const response = await request(app).post("/api/auth/signin").send({
        email: "testuser@example.com",
        password: "wrongpassword",
        role: "student",
      });

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    let token;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash("testpass123", 10);
      const [created] = await db
        .insert(user)
        .values({
          id: crypto.randomUUID(),
          email: "testuser@example.com",
          password: hashedPassword,
          role: "student",
          email_verified: new Date(),
          created_at: new Date(),
        })
        .returning();

      testUserId = created.id;

      const [sess] = await db
        .insert(session)
        .values({
          id: crypto.randomUUID(),
          userId: testUserId,
          token: crypto.randomBytes(32).toString("hex"),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        })
        .returning();

      token = sess.token;
    });

    it("should return user info with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe("testuser@example.com");
    });

    it("should reject invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });
  });
});
