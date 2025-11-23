import express from "express";
import { db } from "../db/index.js";
import {
  student_profile,
  student_applications,
  posts,
  education,
  projects,
  social_links,
} from "../db/schema/index.js";
import { eq, desc, count, and, or, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/overview", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let profile = null;

    if (role === "student") {
      const profiles = await db
        .select()
        .from(student_profile)
        .where(eq(student_profile.user_id, userId))
        .limit(1);
      profile = profiles[0];
    }

    const socialLinks = await db
      .select()
      .from(social_links)
      .where(eq(social_links.user_id, userId))
      .limit(1);

    // Get recent experience from approved offers
    const recentExperience = await db
      .select({
        application: student_applications,
        post: posts,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .where(
        and(
          eq(student_applications.student_id, userId),
          sql`${student_applications.application_status} IN ('offer-approved', 'offer_approved', 'offered')`
        )
      )
      .orderBy(desc(student_applications.applied_at))
      .limit(2);

    const educationCount = await db
      .select({ value: count() })
      .from(education)
      .where(eq(education.user_id, userId));

    const experienceCount = await db
      .select({ value: count() })
      .from(student_applications)
      .where(
        and(
          eq(student_applications.student_id, userId),
          sql`${student_applications.application_status} IN ('offer-approved', 'offer_approved', 'offered')`
        )
      );

    const projectsCount = await db
      .select({ value: count() })
      .from(projects)
      .where(eq(projects.user_id, userId));

    const completeness = {
      personalInfo: profile ? true : false,
      education: parseInt(educationCount[0]?.value || 0) > 0,
      experience: parseInt(experienceCount[0]?.value || 0) > 0,
      projects: parseInt(projectsCount[0]?.value || 0) > 0,
    };

    const completedSections =
      Object.values(completeness).filter(Boolean).length;
    const completenessPercentage = Math.round((completedSections / 4) * 100);

    res.json({
      ok: true,
      profile: {
        ...profile,
        email: req.user.email,
        role: req.user.role,
      },
      socialLinks: socialLinks[0] || null,
      recentExperience: recentExperience.map((item) => ({
        job_title: item.post?.position || "Position",
        company_name: item.post?.company_name || "Company",
        start_date: item.application?.applied_at,
        end_date: item.application?.updated_at,
      })),
      completeness: {
        ...completeness,
        percentage: completenessPercentage,
      },
    });
  } catch (e) {
    console.error("Error fetching overview:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/personal", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profiles = await db
      .select()
      .from(student_profile)
      .where(eq(student_profile.user_id, userId))
      .limit(1);

    const studentProfile = profiles[0] || {};

    res.json({
      ok: true,
      profile: {
        ...studentProfile,
        email: req.user.email,
        linkedin_profile: studentProfile.linkedin,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.put("/personal", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const updateData = { ...req.body };

    // NEW: Validate professional_email if provided
    if (updateData.professional_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.professional_email)) {
        return res.status(400).json({
          ok: false,
          error: "Invalid professional email format",
        });
      }
    }

    // NEW: Validate higher_studies_info if provided
    if (updateData.higher_studies_info) {
      const hsInfo = updateData.higher_studies_info;
      if (typeof hsInfo !== "object") {
        return res.status(400).json({
          ok: false,
          error: "Higher studies info must be an object",
        });
      }
    }

    let updated;

    if (userRole === "student") {
      updated = await db
        .update(student_profile)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(eq(student_profile.user_id, userId))
        .returning();
    } else if (userRole === "placement") {
      updated = await db
        .update(placement_profile)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(eq(placement_profile.user_id, userId))
        .returning();
    } else if (userRole === "recruiter") {
      updated = await db
        .update(recruiter_profile)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(eq(recruiter_profile.user_id, userId))
        .returning();
    }

    if (!updated || updated.length === 0) {
      return res.status(404).json({ ok: false, error: "Profile not found" });
    }

    res.json({ ok: true, profile: updated[0] });
  } catch (e) {
    console.error("Error updating profile:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/education", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const educationList = await db
      .select()
      .from(education)
      .where(eq(education.user_id, userId))
      .orderBy(desc(education.start_date));

    res.json({ ok: true, education: educationList });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.post("/education", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const newEducation = await db
      .insert(education)
      .values({ user_id: userId, ...req.body })
      .returning();

    res.status(201).json({ ok: true, education: newEducation[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.put("/education/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db
      .update(education)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(education.id, id))
      .returning();

    res.json({ ok: true, education: updated[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.delete("/education/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(education).where(eq(education.id, id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Experience now comes from student_applications with approved offers
router.get("/experience", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const experienceList = await db
      .select({
        application: student_applications,
        post: posts,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .where(
        and(
          eq(student_applications.student_id, userId),
          sql`${student_applications.application_status} IN ('offer-approved', 'offer_approved', 'offered')`
        )
      )
      .orderBy(desc(student_applications.applied_at));

    const formatted = experienceList.map((item) => ({
      id: item.application.id,
      job_title: item.post?.position || "Position",
      company_name: item.post?.company_name || "Company",
      location: item.post?.industry || "N/A",
      start_date: item.application.applied_at,
      end_date: item.application.updated_at,
      description:
        item.application.placement_notes || item.application.cover_letter,
    }));

    res.json({ ok: true, experience: formatted });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/projects", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const projectsList = await db
      .select()
      .from(projects)
      .where(eq(projects.user_id, userId))
      .orderBy(desc(projects.start_date));

    res.json({ ok: true, projects: projectsList });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.post("/projects", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const newProject = await db
      .insert(projects)
      .values({ user_id: userId, ...req.body })
      .returning();

    res.status(201).json({ ok: true, project: newProject[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.put("/projects/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db
      .update(projects)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(projects.id, id))
      .returning();

    res.json({ ok: true, project: updated[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.delete("/projects/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(projects).where(eq(projects.id, id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.put("/social-links", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const existing = await db
      .select()
      .from(social_links)
      .where(eq(social_links.user_id, userId))
      .limit(1);

    let result;
    if (existing.length > 0) {
      result = await db
        .update(social_links)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(social_links.user_id, userId))
        .returning();
    } else {
      result = await db
        .insert(social_links)
        .values({ user_id: userId, ...req.body })
        .returning();
    }

    res.json({ ok: true, socialLinks: result[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
