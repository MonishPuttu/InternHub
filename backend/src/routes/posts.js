import express from "express";
import { db } from "../db/index.js";
import { applications } from "../db/schema/index.js";
import { eq, gte, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// Get all applications (for the authenticated user)
router.get("/applications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, industry, limit = 50 } = req.query;

    const conditions = [eq(applications.user_id, userId)];

    if (status) conditions.push(eq(applications.status, status));
    if (industry) conditions.push(eq(applications.industry, industry));

    const apps = await db
      .select()
      .from(applications)
      .where(and(...conditions))
      .orderBy(desc(applications.application_date))
      .limit(parseInt(limit));

    res.json({ ok: true, applications: apps });
  } catch (e) {
    console.error("Error fetching applications (posts):", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Create a new application/post (recruiter-only)
router.post("/applications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden: only recruiters can create posts" });
    }

    const {
      company_name,
      position,
      industry,
      application_date,
      status,
      package_offered,
      notes,
      media,
    } = req.body;

    if (!company_name || !position || !industry) {
      return res.status(400).json({ ok: false, error: "Company name, position and industry are required" });
    }

    const newApp = await db
      .insert(applications)
      .values({
        user_id: userId,
        company_name,
        position,
        industry,
        application_date: application_date ? new Date(application_date) : new Date(),
        status: status || "applied",
        package_offered: package_offered || null,
        notes: notes || null,
        media: media || null,
      })
      .returning();

    res.status(201).json({ ok: true, application: newApp[0] });
  } catch (e) {
    console.error("Error creating application (post):", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Update application (only owner can update)
router.put("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.application_date) updateData.application_date = new Date(updateData.application_date);
    updateData.updated_at = new Date();

    const updated = await db
      .update(applications)
      .set(updateData)
      .where(and(eq(applications.id, id), eq(applications.user_id, userId)))
      .returning();

    if (updated.length === 0) return res.status(404).json({ ok: false, error: "Application not found" });

    res.json({ ok: true, application: updated[0] });
  } catch (e) {
    console.error("Error updating application (post):", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Delete application (only owner)
router.delete("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.delete(applications).where(and(eq(applications.id, id), eq(applications.user_id, userId)));

    res.json({ ok: true });
  } catch (e) {
    console.error("Error deleting application (post):", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Admin: get pending posts (placement only)
router.get("/admin/pending-posts", requireAuth, async (req, res) => {
  try {
    const u = req.user;
    if (u.role !== "placement") return res.status(403).json({ ok: false, error: "Forbidden" });

    const pending = await db.select().from(applications).where(eq(applications.approved, false)).orderBy(desc(applications.application_date)).limit(200);
    res.json({ ok: true, posts: pending });
  } catch (e) {
    console.error("Error fetching pending posts:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Admin: approve/disapprove a post (placement only)
router.put("/admin/posts/:id/approve", requireAuth, async (req, res) => {
  try {
    const u = req.user;
    if (u.role !== "placement") return res.status(403).json({ ok: false, error: "Forbidden" });

    const { id } = req.params;
    const { approve = true } = req.body;

    const updated = await db.update(applications).set({ approved: !!approve, updated_at: new Date() }).where(eq(applications.id, id)).returning();
    if (!updated || updated.length === 0) return res.status(404).json({ ok: false, error: "Post not found" });

    res.json({ ok: true, post: updated[0] });
  } catch (e) {
    console.error("Error updating post approval:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get approved posts (for students)
router.get("/approved-posts", requireAuth, async (req, res) => {
  try {
    // Only students should fetch approved posts
    if (req.user.role !== "student") return res.status(403).json({ ok: false, error: "Forbidden" });

    const posts = await db.select().from(applications).where(eq(applications.approved, true)).orderBy(desc(applications.application_date)).limit(200);
    res.json({ ok: true, posts });
  } catch (e) {
    console.error("Error fetching approved posts:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
