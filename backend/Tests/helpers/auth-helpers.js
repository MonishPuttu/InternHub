// Tests/helpers/auth-helpers.js
import crypto from "crypto";
import { getDb } from "./db-helper.js";
import { session } from "../../src/db/schema/index.js";

// Generate and save session tokens to database
export async function generateToken(userId, role) {
  const token = crypto.randomBytes(32).toString("hex");
  const db = getDb();

  // Session expiry times
  const SESSION_DURATIONS = {
    student: 7 * 24 * 60 * 60 * 1000, // 7 days
    placement: 3 * 24 * 60 * 60 * 1000, // 3 days
    recruiter: 1 * 24 * 60 * 60 * 1000, // 1 day
  };

  const expiresAt = new Date(Date.now() + SESSION_DURATIONS[role]);

  // Insert session into database
  await db.insert(session).values({
    id: crypto.randomUUID(),
    userId: userId,
    token: token,
    expiresAt: expiresAt,
    createdAt: new Date(),
  });

  return token;
}

export async function generateStudentToken() {
  const { FIXED_IDS } = await import("../setup/seed-test-data.js");
  return generateToken(FIXED_IDS.users.student, "student");
}

export async function generateRecruiterToken() {
  const { FIXED_IDS } = await import("../setup/seed-test-data.js");
  return generateToken(FIXED_IDS.users.recruiter, "recruiter");
}

export async function generatePlacementToken() {
  const { FIXED_IDS } = await import("../setup/seed-test-data.js");
  return generateToken(FIXED_IDS.users.placement, "placement");
}

export function decodeToken() {
  throw new Error("decodeToken() is not needed for session-based auth");
}
