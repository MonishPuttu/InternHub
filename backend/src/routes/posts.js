import express from "express";
import { db } from "../db/index.js";
import { posts } from "../db/schema/post.js"; // Use the new posts table
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// Get all posts (for the authenticated user)
// Get all posts (for the authenticated user OR all posts for placement)
router.get("/applications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, industry, limit = 50 } = req.query;

    let conditions = [];

    // Placement officers see ALL posts, others see only their own
    if (userRole !== "placement") {
      conditions.push(eq(posts.user_id, userId));
    }

    if (status) conditions.push(eq(posts.status, status));
    if (industry) conditions.push(eq(posts.industry, industry));

    const query = conditions.length > 0 ? and(...conditions) : undefined;

    const postsList = await db
      .select()
      .from(posts)
      .where(query)
      .orderBy(desc(posts.application_date))
      .limit(parseInt(limit));

    res.json({ ok: true, applications: postsList });
  } catch (e) {
    console.error("Error fetching posts:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Create a new post (recruiter-only)
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

    const newPost = await db
      .insert(posts)
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
        approval_status: "pending", // Default to pending
      })
      .returning();

    res.status(201).json({ ok: true, application: newPost[0] });
  } catch (e) {
    console.error("Error creating post:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Update post (only owner can update)
router.put("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert dates
    if (updateData.application_date) updateData.application_date = new Date(updateData.application_date);
    if (updateData.interview_date) updateData.interview_date = new Date(updateData.interview_date);
    if (updateData.offer_date) updateData.offer_date = new Date(updateData.offer_date);
    if (updateData.rejection_date) updateData.rejection_date = new Date(updateData.rejection_date);
    updateData.updated_at = new Date();

    // Allow placement officers to update any post (for approval)
    // Allow owners to update their own posts
    let conditions = [eq(posts.id, id)];
    if (userRole !== "placement") {
      conditions.push(eq(posts.user_id, userId));
    }

    const updated = await db
      .update(posts)
      .set(updateData)
      .where(and(...conditions))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ ok: false, error: "Post not found or unauthorized" });
    }

    res.json({ ok: true, application: updated[0] });
  } catch (e) {
    console.error("Error updating post:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Delete post (owner or placement officers)
router.delete("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;

    if (userRole === "placement") {
      // placement officers may delete any post
      await db.delete(posts).where(eq(posts.id, id));
    } else {
      // others may only delete their own posts
      await db.delete(posts).where(and(eq(posts.id, id), eq(posts.user_id, userId)));
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("Error deleting post:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get approved posts (for students)
router.get("/approved-posts", requireAuth, async (req, res) => {
  try {
    // Only students should fetch approved posts
    if (req.user.role !== "student") return res.status(403).json({ ok: false, error: "Forbidden" });

    const approvedPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.approval_status, "approved"))
      .orderBy(desc(posts.application_date))
      .limit(200);

    res.json({ ok: true, posts: approvedPosts });
  } catch (e) {
    console.error("Error fetching approved posts:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;