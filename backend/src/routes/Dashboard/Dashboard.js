import express from "express";
import { db } from "../../db/index.js";
import { student_applications } from "../../db/schema/Dashboard/student_applications.js";
import { posts } from "../../db/schema/post.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middleware/authmiddleware.js";

const router = express.Router();

router.get("/recent-applications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch recent applications with post details
    const results = await db
      .select()
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(student_applications.student_id, userId))
      .orderBy(desc(student_applications.applied_at))
      .limit(3);

    // Transform the data to flat structure
    const formattedApplications = results.map((row) => ({
      id: row.student_applications?.id,
      company_name: row.posts?.company_name || "Unknown Company",
      position: row.posts?.position || "Unknown Position",
      industry: row.posts?.industry || "Technology",
      status: row.student_applications?.application_status || "applied",
      application_date: row.student_applications?.applied_at,
      package_offered: row.posts?.package_offered || null,
      notes: row.posts
        ? `Applied for ${row.posts.position} at ${row.posts.company_name}`
        : "Application details",
    }));

    res.json({ ok: true, applications: formattedApplications });
  } catch (e) {
    console.error("Error fetching recent applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
