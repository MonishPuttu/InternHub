import express from "express";
import { db } from "../db/index.js";
import {
  user,
  session,
  student_profile,
  placement_profile,
  recruiter_profile,
} from "../db/schema/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// Helper function to get user name from profile tables
async function getUserName(userId, role) {
  try {
    if (role === "student") {
      const profile = await db
        .select({ full_name: student_profile.full_name })
        .from(student_profile)
        .where(eq(student_profile.user_id, userId))
        .limit(1);
      return profile[0]?.full_name || "Unknown";
    } else if (role === "placement") {
      const profile = await db
        .select({ name: placement_profile.name })
        .from(placement_profile)
        .where(eq(placement_profile.user_id, userId))
        .limit(1);
      return profile[0]?.name || "Unknown";
    } else if (role === "recruiter") {
      const profile = await db
        .select({ full_name: recruiter_profile.full_name })
        .from(recruiter_profile)
        .where(eq(recruiter_profile.user_id, userId))
        .limit(1);
      return profile[0]?.full_name || "Unknown";
    }
    return "Unknown";
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Unknown";
  }
}

const SESSION_DURATIONS = {
  student: 7 * 24 * 60 * 60 * 1000, // 7 days
  placement: 3 * 24 * 60 * 60 * 1000, // 3 days
  recruiter: 1 * 24 * 60 * 60 * 1000, // 1 day
};

router.post("/signup", async (req, res) => {
  try {
    const { email, password, role, profileData } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        ok: false,
        error: "Email, password, and role are required",
      });
    }

    if (!["student", "placement", "recruiter"].includes(role)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid role. Must be student, placement, or recruiter",
      });
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUsers = await db
      .insert(user)
      .values({
        email,
        password: hashedPassword,
        role,
      })
      .returning();

    const newUser = newUsers[0];

    if (role === "student" && profileData) {
      await db
        .insert(student_profile)
        .values({
          user_id: newUser.id,
          full_name: profileData.full_name || "Unknown",
          roll_number: profileData.roll_number || null,
          student_id: profileData.student_id || null,
          date_of_birth: profileData.date_of_birth
            ? new Date(profileData.date_of_birth)
            : null,
          gender: profileData.gender || null,
          contact_number: profileData.contact_number || null,
          college_name: profileData.college_name || null,
          branch: profileData.branch || null,
          current_semester: profileData.current_semester || null,
          cgpa: profileData.cgpa || null,
          tenth_score: profileData.tenth_score || null,
          twelfth_score: profileData.twelfth_score || null,
          linkedin: profileData.linkedin || null,
          skills: profileData.skills || null,
        })
        .returning();
    } else if (role === "placement" && profileData) {
      await db
        .insert(placement_profile)
        .values({
          user_id: newUser.id,
          name: profileData.name || "Unknown",
          employee_id: profileData.employee_id || null,
          date_of_birth: profileData.date_of_birth
            ? new Date(profileData.date_of_birth)
            : null,
          gender: profileData.gender || null,
          contact_number: profileData.contact_number || null,
          role_designation: profileData.role_designation || null,
          department_branch: profileData.department_branch || null,
          college_name: profileData.college_name || null,
          linkedin: profileData.linkedin || null,
        })
        .returning();
    } else if (role === "recruiter" && profileData) {
      await db
        .insert(recruiter_profile)
        .values({
          user_id: newUser.id,
          full_name: profileData.full_name || "Unknown",
          date_of_birth: profileData.date_of_birth
            ? new Date(profileData.date_of_birth)
            : null,
          gender: profileData.gender || null,
          company_name: profileData.company_name || null,
          role_designation: profileData.role_designation || null,
          industry_sector: profileData.industry_sector || null,
          website: profileData.website || null,
          linkedin: profileData.linkedin || null,
          headquarters_location: profileData.headquarters_location || null,
        })
        .returning();
    }

    const token = crypto.randomUUID();
    const sessionDuration =
      SESSION_DURATIONS[role] || SESSION_DURATIONS.student;
    const expiresAt = new Date(Date.now() + sessionDuration);

    await db.insert(session).values({
      token,
      userId: newUser.id,
      expiresAt,
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    const name = await getUserName(newUser.id, newUser.role);

    res.status(201).json({
      ok: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name,
      },
      token,
      expiresAt: expiresAt.toISOString(), // Send expiry to frontend
    });
  } catch (e) {
    console.error("Signup error:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        ok: false,
        error: "Email, password, and role are required",
      });
    }

    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (users.length === 0) {
      return res.status(401).json({
        ok: false,
        error: "Invalid credentials",
      });
    }

    const foundUser = users[0];

    if (foundUser.role !== role) {
      return res.status(401).json({
        ok: false,
        error: "Invalid credentials or role mismatch",
      });
    }

    const isValidPassword = await bcrypt.compare(password, foundUser.password);

    if (!isValidPassword) {
      return res.status(401).json({
        ok: false,
        error: "Invalid credentials",
      });
    }

    const token = crypto.randomUUID();
    const sessionDuration =
      SESSION_DURATIONS[foundUser.role] || SESSION_DURATIONS.student;
    const expiresAt = new Date(Date.now() + sessionDuration);

    await db.insert(session).values({
      id: crypto.randomUUID(),
      token,
      userId: foundUser.id,
      expiresAt,
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    const name = await getUserName(foundUser.id, foundUser.role);

    res.json({
      ok: true,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        name,
      },
      token,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const token = req.get("authorization")?.replace("Bearer ", "");

    if (!token)
      return res.status(401).json({ ok: false, error: "missing token" });

    const rows = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    const s = rows[0];

    if (!s) return res.status(401).json({ ok: false, error: "invalid token" });

    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, s.userId))
      .limit(1);
    const u = users[0];

    if (!u) return res.status(404).json({ ok: false, error: "user not found" });

    // Fetch role-specific profile and name
    let profile = null;
    let name = "Unknown";

    if (u.role === "student") {
      const profiles = await db
        .select()
        .from(student_profile)
        .where(eq(student_profile.user_id, u.id))
        .limit(1);
      profile = profiles[0];
      name = profile?.full_name || "Unknown";
    } else if (u.role === "placement") {
      const profiles = await db
        .select()
        .from(placement_profile)
        .where(eq(placement_profile.user_id, u.id))
        .limit(1);
      profile = profiles[0];
      name = profile?.name || "Unknown";
    } else if (u.role === "recruiter") {
      const profiles = await db
        .select()
        .from(recruiter_profile)
        .where(eq(recruiter_profile.user_id, u.id))
        .limit(1);
      profile = profiles[0];
      name = profile?.full_name || "Unknown";
    }

    res.json({
      ok: true,
      user: {
        ...u,
        name, // Add name field for backward compatibility
        profile,
      },
    });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e) });
  }
});

router.post("/signout", requireAuth, async (req, res) => {
  try {
    const token = req.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ ok: false, error: "Missing token" });
    }

    await db.delete(session).where(eq(session.token, token));

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const { id, token, userId, expiresAt } = req.body ?? {};
    const ipAddress = req.ip ?? null;
    const userAgent = req.get("user-agent") ?? null;

    await db.insert(session).values({
      id,
      token,
      userId,
      expiresAt: new Date(expiresAt),
      ipAddress,
      userAgent,
    });

    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e) });
  }
});

export default router;
