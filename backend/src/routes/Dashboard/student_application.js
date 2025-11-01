import express from "express";
import { db } from "../../db/index.js";
import {
  student_applications,
  posts,
  student_profile,
  user,
} from "../../db/schema/index.js";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../../middleware/authmiddleware.js";

const router = express.Router();

// Student applies to a post
router.post("/apply/:postId", requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { postId } = req.params;
    const { cover_letter, resume_link } = req.body;

    // Check if student role
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ ok: false, error: "Only students can apply" });
    }

    // Check if post exists and is approved
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }

    if (post[0].approval_status !== "approved") {
      return res
        .status(403)
        .json({ ok: false, error: "Post is not approved yet" });
    }

    // Check if already applied
    const existingApplication = await db
      .select()
      .from(student_applications)
      .where(
        and(
          eq(student_applications.post_id, postId),
          eq(student_applications.student_id, studentId)
        )
      )
      .limit(1);

    if (existingApplication.length > 0) {
      return res
        .status(400)
        .json({ ok: false, error: "Already applied to this post" });
    }

    // Get student profile data
    const profile = await db
      .select()
      .from(student_profile)
      .where(eq(student_profile.user_id, studentId))
      .limit(1);

    if (profile.length === 0) {
      return res
        .status(400)
        .json({ ok: false, error: "Please complete your profile first" });
    }

    const studentData = profile[0];
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, studentId))
      .limit(1);

    // Create application
    const newApplication = await db
      .insert(student_applications)
      .values({
        post_id: postId,
        student_id: studentId,
        full_name: studentData.full_name,
        email: userData[0].email,
        roll_number: studentData.roll_number,
        branch: studentData.branch,
        current_semester: studentData.current_semester,
        cgpa: studentData.cgpa,
        tenth_score: studentData.tenth_score,
        twelfth_score: studentData.twelfth_score,
        contact_number: studentData.contact_number,
        resume_link: resume_link || null,
        cover_letter: cover_letter || null,
        application_status: "pending",
      })
      .returning();

    res.status(201).json({ ok: true, application: newApplication[0] });
  } catch (e) {
    console.error("Error applying to post:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get all applications for a post (placement cell only)
router.get("/post/:postId/applications", requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    // Only placement cell can view applications
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const applications = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.post_id, postId))
      .orderBy(desc(student_applications.applied_at));

    res.json({ ok: true, applications });
  } catch (e) {
    console.error("Error fetching applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get all applications with post details (placement cell dashboard)
router.get("/all-applications", requireAuth, async (req, res) => {
  try {
    // Only placement cell
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const applicationsWithPosts = await db
      .select({
        application: student_applications,
        post: posts,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .orderBy(desc(student_applications.applied_at));

    res.json({ ok: true, applications: applicationsWithPosts });
  } catch (e) {
    console.error("Error fetching all applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Update application status (placement cell only)
router.put(
  "/application/:applicationId/status",
  requireAuth,
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { application_status, placement_notes } = req.body;

      if (req.user.role !== "placement") {
        return res.status(403).json({ ok: false, error: "Forbidden" });
      }

      const updated = await db
        .update(student_applications)
        .set({
          application_status,
          placement_notes: placement_notes || null,
          updated_at: new Date(),
        })
        .where(eq(student_applications.id, applicationId))
        .returning();

      res.json({ ok: true, application: updated[0] });
    } catch (e) {
      console.error("Error updating application status:", e);
      res.status(500).json({ ok: false, error: String(e) });
    }
  }
);

// Get student's own applications
router.get("/my-applications", requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;

    if (req.user.role !== "student") {
      return res.status(403).json({
        ok: false,
        error: "Only students can view their applications",
      });
    }

    const applications = await db
      .select({
        application: student_applications,
        post: posts,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(student_applications.student_id, studentId))
      .orderBy(desc(student_applications.applied_at));

    res.json({ ok: true, applications });
  } catch (e) {
    console.error("Error fetching student applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Check if student has applied to a post
router.get("/check-applied/:postId", requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const studentId = req.user.id;

    if (req.user.role !== "student") {
      return res.json({ ok: true, hasApplied: false });
    }

    const application = await db
      .select()
      .from(student_applications)
      .where(
        and(
          eq(student_applications.post_id, postId),
          eq(student_applications.student_id, studentId)
        )
      )
      .limit(1);

    res.json({ ok: true, hasApplied: application.length > 0 });
  } catch (e) {
    console.error("Error checking application:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Bulk import applications from CSV (placement cell only)
router.post("/bulk-import", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { applications, postId } = req.body;

    if (!applications || !Array.isArray(applications) || applications.length === 0) {
      return res.status(400).json({ ok: false, error: "No applications provided" });
    }

    if (!postId) {
      return res.status(400).json({ ok: false, error: "Post ID is required" });
    }

    // Verify post exists and is approved
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }

    if (post[0].approval_status !== "approved") {
      return res.status(403).json({ ok: false, error: "Post is not approved" });
    }

    const importedApplications = [];
    const errors = [];

    for (const app of applications) {
      try {
        // Check if student already exists or create a placeholder user
        let studentUser = await db
          .select()
          .from(user)
          .where(eq(user.email, app.email || `${app.roll_number}@placeholder.com`))
          .limit(1);

        let studentId;
        if (studentUser.length === 0) {
          // Create a placeholder user for external students
          const newUser = await db
            .insert(user)
            .values({
              email: app.email || `${app.roll_number}@placeholder.com`,
              password: "placeholder", // This should be handled differently in production
              role: "student",
              is_verified: false,
            })
            .returning();
          studentId = newUser[0].id;

          // Create student profile
          await db.insert(student_profile).values({
            user_id: studentId,
            full_name: app.full_name,
            roll_number: app.roll_number,
            branch: app.branch,
            current_semester: app.current_semester,
            cgpa: app.cgpa,
            tenth_score: app.tenth_score,
            twelfth_score: app.twelfth_score,
            contact_number: app.contact_number || null,
          });
        } else {
          studentId = studentUser[0].id;
        }

        // Check if already applied
        const existingApplication = await db
          .select()
          .from(student_applications)
          .where(
            and(
              eq(student_applications.post_id, postId),
              eq(student_applications.student_id, studentId)
            )
          )
          .limit(1);

        if (existingApplication.length > 0) {
          errors.push(`Student ${app.full_name} (${app.roll_number}) already applied`);
          continue;
        }

        // Create application
        const newApplication = await db
          .insert(student_applications)
          .values({
            post_id: postId,
            student_id: studentId,
            full_name: app.full_name,
            email: app.email || `${app.roll_number}@placeholder.com`,
            roll_number: app.roll_number,
            branch: app.branch,
            current_semester: app.current_semester,
            cgpa: app.cgpa,
            tenth_score: app.tenth_score,
            twelfth_score: app.twelfth_score,
            contact_number: app.contact_number || null,
            resume_link: app.resume_link || null,
            cover_letter: app.cover_letter || null,
            application_status: app.application_status || "applied",
            applied_at: app.applied_at ? new Date(app.applied_at) : new Date(),
          })
          .returning();

        importedApplications.push(newApplication[0]);
      } catch (error) {
        console.error("Error importing application:", error);
        errors.push(`Failed to import ${app.full_name}: ${error.message}`);
      }
    }

    res.json({
      ok: true,
      imported: importedApplications.length,
      errors: errors.length > 0 ? errors : undefined,
      applications: importedApplications,
    });
  } catch (e) {
    console.error("Error bulk importing applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
