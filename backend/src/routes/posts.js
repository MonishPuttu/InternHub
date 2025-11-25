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

// GET /api/posts/applications - Fetch applications
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

// POST /api/posts/applications - Create new post with multiple positions
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
      positions, // NEW: Array of positions instead of single position
      industry,
      application_date,
      status,
      notes,
      media,
      application_deadline,
      target_departments,
    } = req.body;

    // UPDATED: Validate company_name, positions array, and industry
    if (!company_name || !industry) {
      return res.status(400).json({
        ok: false,
        error: "Company name and industry are required",
      });
    }

    // NEW: Validate positions array
    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "At least one position is required",
      });
    }

    // NEW: Validate each position has required fields
    for (const pos of positions) {
      if (!pos.title || !pos.title.trim()) {
        return res.status(400).json({
          ok: false,
          error: "All positions must have a title",
        });
      }
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
        positions, // NEW: Store positions array as JSONB
        industry,
        application_date: application_date
          ? new Date(application_date)
          : new Date(),
        status: status || "applied",
        notes: notes || null,
        media: media || null,
        application_deadline: application_deadline
          ? new Date(application_deadline)
          : null,
        target_departments: validatedDepartments,
        approval_status: approvalStatus,
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
        // NEW: Build position list for email
        const positionsList = createdPost.positions
          .map((pos, idx) => {
            return `${idx + 1}. ${pos.title}${
              pos.package_offered ? ` - ₹${pos.package_offered}L` : ""
            }${pos.vacancies ? ` (${pos.vacancies} positions)` : ""}`;
          })
          .join("\n");

        const subject = `New Job Post from ${recruiterInfo.companyName} - Multiple Positions`;
        const htmlContent = `
Dear Placement Officer,

A new job post has been created by a recruiter. Please find the details below:

Company: ${createdPost.company_name}
Industry: ${createdPost.industry}

Positions:
${positionsList}

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

// PUT /api/posts/applications/:id - Update post
router.put("/applications/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;

    const updateData = { ...req.body };

    // NEW: Validate positions if being updated
    if (updateData.positions) {
      if (
        !Array.isArray(updateData.positions) ||
        updateData.positions.length === 0
      ) {
        return res.status(400).json({
          ok: false,
          error: "At least one position is required",
        });
      }

      for (const pos of updateData.positions) {
        if (!pos.title || !pos.title.trim()) {
          return res.status(400).json({
            ok: false,
            error: "All positions must have a title",
          });
        }
      }
    }

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

    const nullableFields = ["notes", "media"];
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

// DELETE /api/posts/applications/:id - Delete post
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

// GET /api/posts/my-posts - Get recruiter's own posts
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

// GET /api/posts/approved-posts - Get approved posts for students
router.get("/approved-posts", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student" && req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

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
        if (officerDepartment) {
          conditions.push(
            or(
              isNull(posts.target_departments),
              arrayContains(posts.target_departments, [officerDepartment])
            )
          );
        }
      }
    }

    const approvedPosts = await db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.application_date))
      .limit(parseInt(limit));

    res.json({ ok: true, posts: approvedPosts });
  } catch (e) {
    console.error("Error fetching approved posts:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// GET /api/posts/applications/:id - Get specific post
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

    // Fetch the creator's role from user table
    const creatorUser = await db
      .select()
      .from(user)
      .where(eq(user.id, p.user_id))
      .limit(1);

    let creatorRole = null;
    if (creatorUser.length > 0) {
      creatorRole = creatorUser[0].role || null;
    }

    res.json({ ok: true, application: p, creator_role: creatorRole });
  } catch (e) {
    console.error("Error fetching post by ID:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
