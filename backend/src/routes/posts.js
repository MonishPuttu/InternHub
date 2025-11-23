import express from "express";
import { db } from "../db/index.js";
import { posts } from "../db/schema/post.js";
import {
  placement_profile,
  student_profile,
  user,
  recruiter_profile,
} from "../db/schema/user.js";
import {
  eq,
  desc,
  and,
  or,
  isNull,
  gt,
  arrayContains,
  inArray,
} from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";
import { sendNotificationEmail } from "../lib/emailService.js";

const router = express.Router();

// ✅ Allowed departments
const ALLOWED_DEPARTMENTS = [
  "ECE",
  "CSE",
  "EEE",
  "MECH",
  "CIVIL",
  "IT",
  "MBA",
  "AIML",
  "MCA",
];

router.get("/applications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, industry, limit = 50 } = req.query;
    let conditions = [];

    if (userRole === "placement") {
      const placementProfile = await db
        .select()
        .from(placement_profile)
        .where(eq(placement_profile.user_id, userId))
        .limit(1);

      if (placementProfile.length > 0) {
        const officerDepartment = placementProfile[0].department_branch;
        conditions.push(
          or(
            isNull(posts.target_departments),
            arrayContains(posts.target_departments, [officerDepartment])
          )
        );
      }
    } else {
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

router.post("/applications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // UPDATED: Allow both recruiters AND placement officers to create posts
    if (userRole !== "recruiter" && userRole !== "placement") {
      return res.status(403).json({
        ok: false,
        error: "Only recruiters and placement officers can create posts",
      });
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
      application_deadline,
      target_departments,
    } = req.body;

    if (!company_name || !position || !industry) {
      return res.status(400).json({
        ok: false,
        error: "Company name, position and industry are required",
      });
    }

    // ✅ Validate departments
    let validatedDepartments = [];
    if (Array.isArray(target_departments) && target_departments.length > 0) {
      validatedDepartments = target_departments.map((d) => d);
      const invalid = validatedDepartments.filter(
        (d) => !ALLOWED_DEPARTMENTS.includes(d)
      );
      if (invalid.length > 0) {
        return res.status(400).json({
          ok: false,
          error: `Invalid departments: ${invalid.join(", ")}`,
        });
      }
    }

    // UPDATED: For placement officers, auto-approve their own posts
    const approvalStatus = userRole === "placement" ? "approved" : "pending";

    const newPost = await db
      .insert(posts)
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
        media: media || null,
        application_deadline: application_deadline
          ? new Date(application_deadline)
          : null,
        target_departments: validatedDepartments,
        approval_status: approvalStatus, // UPDATED
      })
      .returning();

    // --- Email Notification Logic (only for recruiter posts) ---
    if (
      userRole === "recruiter" &&
      newPost.length > 0 &&
      validatedDepartments.length > 0
    ) {
      const createdPost = newPost[0];

      // Fetch recruiter details
      const recruiter = await db
        .select({
          email: user.email,
          fullName: recruiter_profile.full_name,
          companyName: recruiter_profile.company_name,
        })
        .from(user)
        .leftJoin(recruiter_profile, eq(user.id, recruiter_profile.user_id))
        .where(eq(user.id, userId))
        .limit(1);

      const recruiterInfo = recruiter[0] || {
        email: "N/A",
        fullName: "N/A",
        companyName: "N/A",
      };

      const placementOfficers = await db
        .select({ email: user.email })
        .from(user)
        .leftJoin(placement_profile, eq(user.id, placement_profile.user_id))
        .where(
          and(
            eq(user.role, "placement"),
            inArray(placement_profile.department_branch, validatedDepartments)
          )
        );

      console.log("Validated Departments:", validatedDepartments);
      const recipientEmails = placementOfficers.map((po) => po.email);
      console.log("Recipient Emails for notification:", recipientEmails);

      if (recipientEmails.length > 0) {
        const subject = `New Job Post from ${recruiterInfo.companyName} - ${createdPost.position}`;
        const htmlContent = `
Dear Placement Officer,

A new job post has been created by a recruiter. Please find the details below:

Company: ${createdPost.company_name}
Position: ${createdPost.position}
Industry: ${createdPost.industry}
Package: ${
          createdPost.package_offered
            ? `₹${createdPost.package_offered}L`
            : "N/A"
        }

Please review the post and take necessary action.

Regards,
InternHub Team
        `;

        try {
          await sendNotificationEmail(recipientEmails, subject, htmlContent);
          console.log("✅ Email notifications sent successfully");
        } catch (emailError) {
          console.error("❌ Failed to send email notifications:", emailError);
        }
      }
    }

    res.json({
      ok: true,
      message: "Post created successfully",
      post: newPost[0],
    });
  } catch (e) {
    console.error("Error creating post:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.put("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.target_departments) {
      updateData.target_departments = updateData.target_departments.map(
        (d) => d
      );
      const invalid = updateData.target_departments.filter(
        (d) => !ALLOWED_DEPARTMENTS.includes(d)
      );
      if (invalid.length > 0) {
        return res.status(400).json({
          ok: false,
          error: `Invalid departments: ${invalid.join(", ")}`,
        });
      }
    }

    const nullableFields = ["package_offered", "notes", "media"];
    nullableFields.forEach((f) => {
      if (updateData[f] === "") updateData[f] = null;
    });

    updateData.updated_at = new Date();

    let conditions = [eq(posts.id, id)];
    if (userRole === "placement") {
      const placementProfile = await db
        .select()
        .from(placement_profile)
        .where(eq(placement_profile.user_id, userId))
        .limit(1);

      if (placementProfile.length > 0) {
        const officerDepartment = placementProfile[0].department_branch;
        conditions.push(
          or(
            isNull(posts.target_departments),
            arrayContains(posts.target_departments, [officerDepartment])
          )
        );
      }
    } else if (userRole !== "admin") {
      conditions.push(eq(posts.user_id, userId));
    }

    const updated = await db
      .update(posts)
      .set(updateData)
      .where(and(...conditions))
      .returning();

    if (updated.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Post not found or unauthorized" });
    }

    res.json({ ok: true, application: updated[0] });
  } catch (e) {
    console.error("Error updating post:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.delete("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;

    if (userRole === "placement") {
      const placementProfile = await db
        .select()
        .from(placement_profile)
        .where(eq(placement_profile.user_id, userId))
        .limit(1);

      if (placementProfile.length > 0) {
        const officerDepartment = placementProfile[0].department_branch;
        await db
          .delete(posts)
          .where(
            and(
              eq(posts.id, id),
              or(
                isNull(posts.target_departments),
                arrayContains(posts.target_departments, officerDepartment)
              )
            )
          );
      }
    } else {
      await db
        .delete(posts)
        .where(and(eq(posts.id, id), eq(posts.user_id, userId)));
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("Error deleting post:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/my-posts", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const myPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.user_id, req.user.id))
      .orderBy(desc(posts.application_date));

    res.json({ ok: true, posts: myPosts });
  } catch (e) {
    console.error("Error fetching recruiter posts:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/approved-posts", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student" && req.user.role !== "placement")
      return res.status(403).json({ ok: false, error: "Forbidden" });

    const { limit = 200 } = req.query;
    const currentDate = new Date();

    let conditions = [
      eq(posts.approval_status, "approved"),
      or(
        isNull(posts.application_deadline),
        gt(posts.application_deadline, currentDate)
      ),
    ];

    if (req.user.role === "student") {
      const studentProfile = await db
        .select()
        .from(student_profile)
        .where(eq(student_profile.user_id, req.user.id))
        .limit(1);

      if (studentProfile.length === 0 || !studentProfile[0].branch) {
        return res.status(400).json({
          ok: false,
          error: "Student profile not found or branch not set",
        });
      }

      const studentBranch = studentProfile[0].branch;
      conditions.push(
        or(
          isNull(posts.target_departments),
          arrayContains(posts.target_departments, [studentBranch])
        )
      );
    } else if (req.user.role === "placement") {
      const placementProfile = await db
        .select()
        .from(placement_profile)
        .where(eq(placement_profile.user_id, req.user.id))
        .limit(1);

      if (placementProfile.length > 0) {
        const officerDepartment = placementProfile[0].department_branch;

        // FIXED: Only filter if department_branch exists
        if (officerDepartment) {
          conditions.push(
            or(
              isNull(posts.target_departments),
              arrayContains(posts.target_departments, [officerDepartment])
            )
          );
        }
        // If no department_branch, show all approved posts (no additional filter)
      }
    }

    const approvedPosts = await db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.application_date))
      .limit(parseInt(limit));

    console.log("Approved posts query result:", approvedPosts.length);
    res.json({ ok: true, posts: approvedPosts });
  } catch (e) {
    console.error("Error fetching approved posts:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/applications/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

    if (post.length === 0) {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }

    const p = post[0];
    const isOwner = p.user_id === req.user.id;
    const isPlacement = req.user.role === "placement";
    const isStudentApproved =
      req.user.role === "student" && p.approval_status === "approved";

    if (!isOwner && !isPlacement && !isStudentApproved) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    res.json({ ok: true, application: p });
  } catch (e) {
    console.error("Error fetching post by ID:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
