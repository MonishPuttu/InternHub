import express from "express";
import { db } from "../../db/index.js";
import { applications } from "../../db/schema/index.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middleware/authmiddleware.js";

const router = express.Router();

router.get("/recent-applications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const recentApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.user_id, userId))
      .orderBy(desc(applications.application_date))
      .limit(3);

    res.json({ ok: true, applications: recentApplications });
  } catch (e) {
    console.error("Error fetching recent applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
