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
    const formattedApplications = results.map((row) => {
      let positionTitle = "Unknown Position";
      let jobType = "N/A";
      let packageOffered = null;

      try {
        const positionsArray = row.posts?.positions || [];



        if (Array.isArray(positionsArray) && positionsArray.length > 0) {
          positionTitle = positionsArray[0]?.title || "Unknown Position";
          jobType = positionsArray[0]?.job_type || "N/A";
          packageOffered = positionsArray[0]?.package_offered;


        }
      } catch (error) {
        console.error("Error parsing positions:", error);
        positionTitle = "Unknown Position";
        jobType = "N/A";
      }

      return {
        id: row.student_applications?.id,
        company_name: row.posts?.company_name || "Unknown Company",
        position: positionTitle,
        job_type: jobType,
        industry: row.posts?.industry || "Technology",
        status: row.student_applications?.application_status || "applied",
        application_date: row.student_applications?.applied_at,
        package_offered: packageOffered,
        notes: row.posts
          ? `Applied for ${positionTitle} at ${row.posts.company_name}`
          : "Application details",
      };
    });



    res.json({ ok: true, applications: formattedApplications });
  } catch (e) {
    console.error("Error fetching recent applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;