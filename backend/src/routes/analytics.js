import express from "express";
import { db } from "../db/index.js";
import { student_applications, posts } from "../db/schema/index.js";
import { eq, gte, and, count, avg, isNotNull, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// Helper function to extract highest package from positions array
function getHighestPackage(positions) {
  if (!positions || !Array.isArray(positions) || positions.length === 0) {
    return null;
  }

  const packages = positions
    .map((pos) => parseFloat(pos.package_offered))
    .filter((pkg) => !isNaN(pkg) && pkg > 0);

  return packages.length > 0 ? Math.max(...packages) : null;
}

// Get overview stats
router.get("/overview", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = "6" } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(timeRange));

    // Total applications
    const totalApps = await db
      .select({ value: count() })
      .from(student_applications)
      .where(
        and(
          eq(student_applications.student_id, userId),
          gte(student_applications.applied_at, startDate)
        )
      );

    // Applications with interviews scheduled or completed
    const interviewedApps = await db
      .select({ value: count() })
      .from(student_applications)
      .where(
        and(
          eq(student_applications.student_id, userId),
          gte(student_applications.applied_at, startDate),
          sql`${student_applications.application_status} IN ('interview_scheduled', 'interview-scheduled', 'interviewed')`
        )
      );

    // Applications with offers (offer-pending, offer-approved)
    const offersReceived = await db
      .select({ value: count() })
      .from(student_applications)
      .where(
        and(
          eq(student_applications.student_id, userId),
          gte(student_applications.applied_at, startDate),
          sql`${student_applications.application_status} IN ('offer-pending', 'offer_pending', 'offer-approved', 'offer_approved', 'offered')`
        )
      );

    // FIXED: Average package from posts where student got offers
    // Now handles positions array
    const offeredApplications = await db
      .select({
        positions: posts.positions, // NEW: Get positions array
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .where(
        and(
          eq(student_applications.student_id, userId),
          sql`${student_applications.application_status} IN ('offer-approved', 'offer_approved', 'offered')`,
          isNotNull(posts.positions)
        )
      );

    const total = parseInt(totalApps[0]?.value || 0);
    const interviewed = parseInt(interviewedApps[0]?.value || 0);
    const offers = parseInt(offersReceived[0]?.value || 0);

    // FIXED: Calculate average package from positions array
    let avgPkg = 0;
    if (offeredApplications.length > 0) {
      const packages = offeredApplications
        .map((app) => getHighestPackage(app.positions))
        .filter((pkg) => pkg !== null);

      if (packages.length > 0) {
        const sum = packages.reduce((acc, pkg) => acc + pkg, 0);
        avgPkg = sum / packages.length;
      }
    }

    res.json({
      ok: true,
      stats: {
        totalApplications: total,
        interviewRate:
          total > 0 ? ((interviewed / total) * 100).toFixed(1) : "0.0",
        offerRate: total > 0 ? ((offers / total) * 100).toFixed(1) : "0.0",
        avgPackage: avgPkg.toFixed(2),
      },
    });
  } catch (e) {
    console.error("Error fetching overview:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get timeline data
router.get("/timeline", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = "6" } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(timeRange));

    // Fetch all applications in range
    const apps = await db
      .select()
      .from(student_applications)
      .where(
        and(
          eq(student_applications.student_id, userId),
          gte(student_applications.applied_at, startDate)
        )
      );

    // Group by month manually
    const monthlyData = {};
    apps.forEach((app) => {
      const date = new Date(app.applied_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          applications: 0,
          interviews: 0,
          offers: 0,
        };
      }

      monthlyData[monthKey].applications++;

      if (
        app.application_status === "interview_scheduled" ||
        app.application_status === "interview-scheduled" ||
        app.application_status === "interviewed"
      ) {
        monthlyData[monthKey].interviews++;
      }

      if (
        app.application_status === "offer-pending" ||
        app.application_status === "offer_pending" ||
        app.application_status === "offer-approved" ||
        app.application_status === "offer_approved" ||
        app.application_status === "offered"
      ) {
        monthlyData[monthKey].offers++;
      }
    });

    // Convert to array and sort
    const timeline = Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    res.json({
      ok: true,
      timeline,
    });
  } catch (e) {
    console.error("Error fetching timeline:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get industry distribution
router.get("/industry-focus", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all applications with post industry info
    const apps = await db
      .select({
        industry: posts.industry,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(student_applications.student_id, userId));

    // Group by industry manually
    const industryCount = {};
    let total = 0;
    apps.forEach((app) => {
      const industry = app.industry || "Other";
      industryCount[industry] = (industryCount[industry] || 0) + 1;
      total++;
    });

    // Convert to array with percentages
    const industries = Object.entries(industryCount)
      .map(([industry, count]) => ({
        industry,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0",
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      ok: true,
      industries,
    });
  } catch (e) {
    console.error("Error fetching industry focus:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get all applications
router.get("/applications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50 } = req.query;

    const conditions = [eq(student_applications.student_id, userId)];

    if (status) {
      conditions.push(eq(student_applications.application_status, status));
    }

    const apps = await db
      .select({
        application: student_applications,
        post: posts,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .where(and(...conditions))
      .orderBy(desc(student_applications.applied_at))
      .limit(parseInt(limit));

    res.json({ ok: true, applications: apps });
  } catch (e) {
    console.error("Error fetching applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Update application status
router.put("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert date strings to Date objects if present
    if (updateData.interview_date) {
      updateData.interview_date = new Date(updateData.interview_date);
    }

    updateData.updated_at = new Date();

    const updated = await db
      .update(student_applications)
      .set(updateData)
      .where(
        and(
          eq(student_applications.id, id),
          eq(student_applications.student_id, userId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Application not found" });
    }

    res.json({ ok: true, application: updated[0] });
  } catch (e) {
    console.error("Error updating application:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Delete application
router.delete("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db
      .delete(student_applications)
      .where(
        and(
          eq(student_applications.id, id),
          eq(student_applications.student_id, userId)
        )
      );

    res.json({ ok: true });
  } catch (e) {
    console.error("Error deleting application:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
