import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { db } from "../db/index.js";
import { completeSignupSchema, signinSchema } from "../lib/validationSchema.js";
import {
  user,
  session,
  student_profile,
  placement_profile,
  recruiter_profile,
} from "../db/schema/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq, and, ne } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";
import nodemailer from "nodemailer";

const router = express.Router();

// ============= RATE LIMITERS =============

// General auth rate limiter (for signup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: {
    ok: false,
    error: "Too many requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    ok: false,
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Password reset rate limiter
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    ok: false,
    error: "Too many password reset requests. Please try again later.",
  },
});

// ============= VALIDATION MIDDLEWARE =============

const signupValidation = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .trim(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/
    )
    .withMessage(
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  body("role")
    .isIn(["student", "placement", "recruiter"])
    .withMessage("Invalid role"),
];

const signinValidation = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .trim(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .isIn(["student", "placement", "recruiter"])
    .withMessage("Invalid role"),
];

// ============= HELPER FUNCTIONS =============

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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetEmail(email, resetUrl) {
  const mailOptions = {
    from: process.env.SMTP_USER || "noreply@internhub.com",
    to: email,
    subject: "Password Reset Request - InternHub",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your InternHub account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <p>Best regards,<br/>InternHub Team</p>
    `,
  };

  if (process.env.NODE_ENV === "production") {
    await transporter.sendMail(mailOptions);
  } else {
    console.log("📧 Password reset email (DEV MODE):");
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
  }
}

// ============= ROUTES =============

// ========== SIGNUP ==========
router.post("/signup", authLimiter, signupValidation, async (req, res) => {
  try {
    const validationResult = completeSignupSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return res.status(400).json({
        ok: false,
        error: Object.values(errors)[1]?._errors[0] || "Validation failed",
        errors: errors,
      });
    }

    const { email, password, role, profileData } = validationResult.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        email_verified: null,
        created_at: new Date(),
      })
      .returning();

    // Create profile based on role
    if (role === "student" && profileData) {
      await db.insert(student_profile).values({
        id: crypto.randomUUID(),
        user_id: newUser.id,
        full_name: profileData.full_name || "",
        roll_number: profileData.roll_number,
        student_id: profileData.student_id,
        gender: profileData.gender,
        contact_number: profileData.contact_number,
        date_of_birth: profileData.date_of_birth
          ? new Date(profileData.date_of_birth)
          : null,
        college_name: profileData.college_name,
        branch: profileData.branch,
        current_semester: profileData.current_semester,
        cgpa: profileData.cgpa,
        tenth_score: profileData.tenth_score,
        twelfth_score: profileData.twelfth_score,
        diploma_score: profileData.diploma_score, // NEW
        entry_type: profileData.entry_type || "regular", // NEW
        career_path: profileData.career_path || "placement", // NEW
        linkedin: profileData.linkedin,
        skills: profileData.skills,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } else if (role === "placement" && profileData) {
      await db.insert(placement_profile).values({
        id: crypto.randomUUID(),
        user_id: newUser.id,
        name: profileData.name || "",
        employee_id: profileData.employee_id,
        gender: profileData.gender,
        contact_number: profileData.contact_number,
        role_designation: profileData.role_designation,
        department_branch: profileData.department_branch,
        college_name: profileData.college_name,
        linkedin: profileData.linkedin,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } else if (role === "recruiter" && profileData) {
      await db.insert(recruiter_profile).values({
        id: crypto.randomUUID(),
        user_id: newUser.id,
        full_name: profileData.full_name || "",
        company_name: profileData.company_name,
        role_designation: profileData.role_designation,
        gender: profileData.gender,
        industry_sector: profileData.industry_sector,
        website: profileData.website,
        linkedin: profileData.linkedin,
        headquarters_location: profileData.headquarters_location,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Create session
    const sessionDuration = SESSION_DURATIONS[role];
    const [newSession] = await db
      .insert(session)
      .values({
        id: crypto.randomUUID(),
        userId: newUser.id,
        token: crypto.randomBytes(32).toString("hex"),
        expiresAt: new Date(Date.now() + sessionDuration),
        createdAt: new Date(),
      })
      .returning();

    res.status(201).json({
      ok: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      token: newSession.token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      ok: false,
      error: "An error occurred during signup. Please try again.",
    });
  }
});

// ========== SIGNIN ==========
router.post("/signin", loginLimiter, signinValidation, async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        error: errors.array()[0].msg,
      });
    }

    const { email, password, role } = req.body;

    // Find user by email
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    // Generic error message (don't leak whether user exists)
    const genericError = "Invalid email or password";

    if (!existingUser) {
      return res.status(401).json({
        ok: false,
        error: genericError,
      });
    }

    // Verify role matches
    if (existingUser.role !== role) {
      return res.status(401).json({
        ok: false,
        error: genericError,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        error: genericError,
      });
    }

    // Get user name from profile
    const userName = await getUserName(existingUser.id, role);

    // Create new session
    const sessionDuration = SESSION_DURATIONS[role];
    const [newSession] = await db
      .insert(session)
      .values({
        id: crypto.randomUUID(),
        userId: existingUser.id,
        token: crypto.randomBytes(32).toString("hex"),
        expiresAt: new Date(Date.now() + sessionDuration),
        createdAt: new Date(),
      })
      .returning();

    res.status(200).json({
      ok: true,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        name: userName,
      },
      token: newSession.token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      ok: false,
      error: "An error occurred during signin. Please try again.",
    });
  }
});

// ========== GET CURRENT USER ==========
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userName = await getUserName(req.user.id, req.user.role);

    let isHigherEducationOpted = false;
    if (req.user.role === "student") {
      const profile = await db
        .select({ career_path: student_profile.career_path })
        .from(student_profile)
        .where(eq(student_profile.user_id, req.user.id))
        .limit(1);

      isHigherEducationOpted = profile[0]?.career_path === "higher_education";
    }

    res.json({
      ok: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: userName,
        isHigherEducationOpted,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch user information",
    });
  }
});
// ========== LOGOUT ==========
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      await db.delete(session).where(eq(session.token, token));
    }

    res.json({
      ok: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      ok: false,
      error: "Logout failed",
    });
  }
});

// ========== FORGOT PASSWORD ==========
router.post("/forgot-password", resetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        error: "Email is required",
      });
    }

    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    // Always return success (don't leak if email exists)
    if (!existingUser) {
      return res.json({
        ok: true,
        message: "If an account exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db
      .update(user)
      .set({
        reset_token: resetToken,
        reset_token_expiry: resetExpiry,
      })
      .where(eq(user.id, existingUser.id));

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await sendResetEmail(email, resetUrl);

    res.json({
      ok: true,
      message: "If an account exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to process password reset request",
    });
  }
});

// ========== RESET PASSWORD ==========
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        ok: false,
        error: "Token and new password are required",
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        ok: false,
        error: "Password must be at least 8 characters long",
      });
    }

    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.reset_token, token))
      .limit(1);

    if (!existingUser || !existingUser.reset_token_expiry) {
      return res.status(400).json({
        ok: false,
        error: "Invalid or expired reset token",
      });
    }

    if (new Date() > existingUser.reset_token_expiry) {
      return res.status(400).json({
        ok: false,
        error: "Reset token has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db
      .update(user)
      .set({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      })
      .where(eq(user.id, existingUser.id));

    // Invalidate all existing sessions
    await db.delete(session).where(eq(session.userId, existingUser.id));

    res.json({
      ok: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to reset password",
    });
  }
});

// ========== CHANGE PASSWORD (for authenticated users) ==========
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        ok: false,
        error: "Current password and new password are required",
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        ok: false,
        error: "New password must be at least 8 characters long",
      });
    }

    // Check if new password has required complexity
    // const passwordRegex =
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/;
    // if (!passwordRegex.test(newPassword)) {
    //   return res.status(400).json({
    //     ok: false,
    //     error:
    //       "Password must contain uppercase, lowercase, number, and special character",
    //   });
    // }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return res.status(400).json({
        ok: false,
        error: "New password must be different from current password",
      });
    }

    // Get user from database
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, req.user.id))
      .limit(1);

    if (!existingUser) {
      return res.status(404).json({
        ok: false,
        error: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await db
      .update(user)
      .set({
        password: hashedPassword,
      })
      .where(eq(user.id, req.user.id));

    // Optional: Invalidate all other sessions except current
    const currentToken = req.headers.authorization?.split(" ")[1];
    await db
      .delete(session)
      .where(
        and(eq(session.userId, req.user.id), ne(session.token, currentToken))
      );

    res.json({
      ok: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to change password",
    });
  }
});

export default router;
