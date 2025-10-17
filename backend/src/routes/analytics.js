import express from "express";
import { db } from "../db/index.js";
import { applications } from "../db/schema/index.js";
import { eq, gte, and, count, avg, isNotNull, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

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
      .from(applications)
      .where(
        and(
          eq(applications.user_id, userId),
          gte(applications.application_date, startDate)
        )
      );

    // Applications with interviews
    const interviewedApps = await db
      .select({ value: count() })
      .from(applications)
      .where(
        and(
          eq(applications.user_id, userId),
          gte(applications.application_date, startDate),
          isNotNull(applications.interview_date)
        )
      );

    // Applications with offers
    const offersReceived = await db
      .select({ value: count() })
      .from(applications)
      .where(
        and(
          eq(applications.user_id, userId),
          gte(applications.application_date, startDate),
          eq(applications.status, "offer")
        )
      );

    // Average package
    const avgPackageResult = await db
      .select({ value: avg(applications.package_offered) })
      .from(applications)
      .where(
        and(
          eq(applications.user_id, userId),
          eq(applications.status, "offer"),
          isNotNull(applications.package_offered)
        )
      );

    const total = parseInt(totalApps[0]?.value || 0);
    const interviewed = parseInt(interviewedApps[0]?.value || 0);
    const offers = parseInt(offersReceived[0]?.value || 0);
    const avgPkg = parseFloat(avgPackageResult[0]?.value || 0);

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

// Get timeline data - Using Drizzle ORM grouping
router.get("/timeline", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = "6" } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(timeRange));

    // Fetch all applications in range
    const apps = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.user_id, userId),
          gte(applications.application_date, startDate)
        )
      );

    // Group by month manually
    const monthlyData = {};

    apps.forEach((app) => {
      const date = new Date(app.application_date);
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
      if (app.interview_date) monthlyData[monthKey].interviews++;
      if (app.status === "offer") monthlyData[monthKey].offers++;
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

    // Fetch all applications for user
    const apps = await db
      .select()
      .from(applications)
      .where(eq(applications.user_id, userId));

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
    console.error("Error fetching applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

//adeded media
router.post("/applications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      company_name,
      position,
      industry,
      application_date,
      status,
      package_offered,
      notes,
      media, // ← NOW RECEIVING MEDIA
    } = req.body;

    if (!company_name || !position || !industry) {
      return res.status(400).json({
        ok: false,
        error: "Company name, position, and industry are required",
      });
    }

    const newApp = await db
      .insert(applications)
      .values({
        user_id: userId,
        company_name,
        position,
        industry,
        application_date: application_date
          ? new Date(application_date)
          : new Date(),
        status: status || "applied",
        package_offered: package_offered || null,
        notes: notes || null,
        media: media || null, // ← NOW SAVING MEDIA TO DATABASE
      })
      .returning();

    res.status(201).json({ ok: true, application: newApp[0] });
  } catch (e) {
    console.error("Error creating application:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Update application
router.put("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert date strings to Date objects
    if (updateData.application_date) {
      updateData.application_date = new Date(updateData.application_date);
    }
    if (updateData.interview_date) {
      updateData.interview_date = new Date(updateData.interview_date);
    }
    if (updateData.offer_date) {
      updateData.offer_date = new Date(updateData.offer_date);
    }
    if (updateData.rejection_date) {
      updateData.rejection_date = new Date(updateData.rejection_date);
    }

    updateData.updated_at = new Date();

    const updated = await db
      .update(applications)
      .set(updateData)
      .where(and(eq(applications.id, id), eq(applications.user_id, userId)))
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
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.user_id, userId)));

    res.json({ ok: true });
  } catch (e) {
    console.error("Error deleting application:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;