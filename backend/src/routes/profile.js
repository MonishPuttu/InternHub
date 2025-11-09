import express from "express";
import { db } from "../db/index.js";
import {
  student_profile,
  applications,
  skill_assessments,
  education,
  projects,
  social_links,
} from "../db/schema/index.js";
import { eq, desc, count, and, or } from "drizzle-orm";
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

    const recentExperience = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.user_id, userId),
          or(
            eq(applications.status, "offer"),
            eq(applications.status, "interviewed")
          )
        )
      )
      .orderBy(desc(applications.application_date))
      .limit(2);

    const educationCount = await db
      .select({ value: count() })
      .from(education)
      .where(eq(education.user_id, userId));

    const experienceCount = await db
      .select({ value: count() })
      .from(applications)
      .where(
        and(
          eq(applications.user_id, userId),
          or(
            eq(applications.status, "offer"),
            eq(applications.status, "interviewed")
          )
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
      recentExperience: recentExperience.map((app) => ({
        job_title: app.position,
        company_name: app.company_name,
        start_date: app.application_date,
        end_date: app.offer_date,
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

    res.json({ ok: true, profile: profiles[0] || null });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.put("/personal", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const excludedFields = [
      "id",
      "user_id",
      "created_at",
      "updated_at",
      "date_of_birth",
    ];

    const bodyData = {};

    for (const [key, value] of Object.entries(req.body)) {
      if (excludedFields.includes(key)) continue;
      if (value === null || value === undefined || value === "") continue;
      bodyData[key] = value;
    }

    let updated;

    if (role === "student") {
      const existing = await db
        .select()
        .from(student_profile)
        .where(eq(student_profile.user_id, userId))
        .limit(1);

      if (existing.length === 0) {
        updated = await db
          .insert(student_profile)
          .values({
            user_id: userId,
            ...bodyData,
          })
          .returning();
      } else {
        updated = await db
          .update(student_profile)
          .set(bodyData)
          .where(eq(student_profile.user_id, userId))
          .returning();
      }
    }

    if (!updated || updated.length === 0) {
      return res.status(404).json({ ok: false, error: "Profile not found" });
    }

    res.json({ ok: true, profile: updated[0] });
  } catch (e) {
    console.error("Error updating personal info:", e);
    res.status(500).json({ ok: false, error: e.message || String(e) });
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

router.get("/experience", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const experienceList = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.user_id, userId),
          or(
            eq(applications.status, "offer"),
            eq(applications.status, "interviewed")
          )
        )
      )
      .orderBy(desc(applications.application_date));

    const formatted = experienceList.map((app) => ({
      id: app.id,
      job_title: app.position,
      company_name: app.company_name,
      location: app.industry,
      start_date: app.application_date,
      end_date: app.offer_date,
      description: app.notes,
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

router.get("/skills", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const skillsList = await db
      .select()
      .from(skill_assessments)
      .where(eq(skill_assessments.user_id, userId));

    res.json({ ok: true, skills: skillsList });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.post("/skills", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const newSkill = await db
      .insert(skill_assessments)
      .values({ user_id: userId, ...req.body })
      .returning();

    res.status(201).json({ ok: true, skill: newSkill[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.delete("/skills/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(skill_assessments).where(eq(skill_assessments.id, id));
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
