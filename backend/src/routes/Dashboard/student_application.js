import express from "express";
import { db } from "../../db/index.js";
import {
  student_applications,
  posts,
  student_profile,
  user,
  sent_lists,
  application_timeline,
} from "../../db/schema/index.js";
import { eq, desc, and, count, countDistinct } from "drizzle-orm";
import { requireAuth } from "../../middleware/authmiddleware.js";

const router = express.Router();

// Student applies to a post
router.post("/apply/:postId", requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { postId } = req.params;
    const { cover_letter, resume_link } = req.body;

    // Check if student role
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ ok: false, error: "Only students can apply" });
    }

    // Check if post exists and is approved
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }

    if (post[0].approval_status !== "approved") {
      return res
        .status(403)
        .json({ ok: false, error: "Post is not approved yet" });
    }

    // Check if student can apply to this post (department check)
    const studentProfile = await db
      .select()
      .from(student_profile)
      .where(eq(student_profile.user_id, studentId))
      .limit(1);

    if (studentProfile.length === 0) {
      return res
        .status(400)
        .json({ ok: false, error: "Please complete your profile first" });
    }

    const studentBranch = studentProfile[0].branch.toUpperCase(); // Convert to uppercase

    // Check if post targets student's department or has no target departments (legacy posts)
    if (post[0].target_departments && post[0].target_departments.length > 0) {
      if (!post[0].target_departments.includes(studentBranch)) {
        return res.status(403).json({
          ok: false,
          error: "This post is not available for your department",
        });
      }
    }

    // Check if already applied
    const existingApplication = await db
      .select()
      .from(student_applications)
      .where(
        and(
          eq(student_applications.post_id, postId),
          eq(student_applications.student_id, studentId)
        )
      )
      .limit(1);

    if (existingApplication.length > 0) {
      return res
        .status(400)
        .json({ ok: false, error: "Already applied to this post" });
    }

    // Get student profile data
    const profile = await db
      .select()
      .from(student_profile)
      .where(eq(student_profile.user_id, studentId))
      .limit(1);

    if (profile.length === 0) {
      return res
        .status(400)
        .json({ ok: false, error: "Please complete your profile first" });
    }

    const studentData = profile[0];
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, studentId))
      .limit(1);

    // Create application
    const newApplication = await db
      .insert(student_applications)
      .values({
        post_id: postId,
        student_id: studentId,
        full_name: studentData.full_name,
        email: userData[0].email,
        roll_number: studentData.roll_number,
        branch: studentData.branch,
        current_semester: studentData.current_semester,
        cgpa: studentData.cgpa,
        tenth_score: studentData.tenth_score,
        twelfth_score: studentData.twelfth_score,
        contact_number: studentData.contact_number,
        resume_link: resume_link || null,
        cover_letter: cover_letter || null,
        application_status: "applied",
        interview_confirmed: false,
      })
      .returning();

    await db.insert(application_timeline).values({
      application_id: newApplication[0].id,
      event_type: "applied",
      title: "Application Submitted",
      description: `Successfully applied for ${post[0].position} at ${post[0].company_name}`,
      event_date: new Date(),
      visibility: "student",
    });

    res.status(201).json({ ok: true, application: newApplication[0] });
  } catch (e) {
    console.error("Error applying to post:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get all applications for a post (placement cell only)
router.get("/post/:postId/applications", requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userRole = req.user.role;
    const { download } = req.query; // Check if it's a download request

    // Only allow placement cell access
    if (userRole !== "placement") {
      // Return empty applications for non-placement users
      if (download === "true") {
        const csvHeaders = [
          "Student Name",
          "Roll Number",
          "Branch",
          "Semester",
          "CGPA",
          "10th",
          "12th",
          "Company",
          "Position",
          "Status",
          "Applied Date",
        ];
        const csvContent = [csvHeaders]
          .map((row) => row.map((field) => `"${field}"`).join(","))
          .join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="no_applications.csv"`
        );
        return res.send(csvContent);
      } else {
        return res.json({ ok: true, applications: [] });
      }
    }

    // For placement cell, fetch post details for CSV
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    const applications = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.post_id, postId))
      .orderBy(desc(student_applications.applied_at));

    if (download === "true") {
      // Return CSV for download
      const csvHeaders = [
        "Student Name",
        "Roll Number",
        "Branch",
        "Semester",
        "CGPA",
        "10th",
        "12th",
        "Company",
        "Position",
        "Status",
        "Applied Date",
      ];

      const csvRows = applications.map((app) => [
        app.full_name,
        app.roll_number,
        app.branch,
        app.current_semester,
        app.cgpa,
        app.tenth_score,
        app.twelfth_score,
        post[0].company_name,
        post[0].position,
        app.application_status,
        new Date(app.applied_at).toLocaleDateString(),
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const filename =
        post.length > 0
          ? `${post[0].company_name}_${post[0].position}_applications.csv`
          : `post_${postId}_applications.csv`;

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      res.send(csvContent);
    } else {
      // Return JSON for dialog display
      res.json({ ok: true, applications });
    }
  } catch (e) {
    console.error("Error fetching applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get all applications with post details (placement cell dashboard)
router.get("/all-applications", requireAuth, async (req, res) => {
  try {
    // Only placement cell
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const applicationsWithPosts = await db
      .select({
        application: student_applications,
        post: posts,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .orderBy(desc(student_applications.applied_at));

    res.json({ ok: true, applications: applicationsWithPosts });
  } catch (e) {
    console.error("Error fetching all applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Update application status (placement cell only)
router.put(
  "/application/:applicationId/status",
  requireAuth,
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { application_status, placement_notes } = req.body;

      if (req.user.role !== "placement") {
        return res.status(403).json({ ok: false, error: "Forbidden" });
      }

      const updated = await db
        .update(student_applications)
        .set({
          application_status,
          placement_notes: placement_notes || null,
          updated_at: new Date(),
        })
        .where(eq(student_applications.id, applicationId))
        .returning();

      res.json({ ok: true, application: updated[0] });
    } catch (e) {
      console.error("Error updating application status:", e);
      res.status(500).json({ ok: false, error: String(e) });
    }
  }
);

// Get student's own applications
router.get("/my-applications", requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;

    if (req.user.role !== "student") {
      return res.status(403).json({
        ok: false,
        error: "Only students can view their applications",
      });
    }

    const applications = await db
      .select({
        application: student_applications,
        post: posts,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(student_applications.student_id, studentId))
      .orderBy(desc(student_applications.applied_at));

    res.json({ ok: true, applications: applications });
  } catch (e) {
    console.error("Error fetching student applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Check if student has applied to a post
router.get("/check-applied/:postId", requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const studentId = req.user.id;

    if (req.user.role !== "student") {
      return res.json({ ok: true, hasApplied: false });
    }

    const application = await db
      .select()
      .from(student_applications)
      .where(
        and(
          eq(student_applications.post_id, postId),
          eq(student_applications.student_id, studentId)
        )
      )
      .limit(1);

    res.json({ ok: true, hasApplied: application.length > 0 });
  } catch (e) {
    console.error("Error checking application:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get global stats for placement dashboard
router.get("/global-stats", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    // Count total approved posts
    const totalPostsResult = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.approval_status, "approved"));

    // Count unique students who have applied to any post
    const uniqueStudentsResult = await db
      .select({ count: countDistinct(student_applications.student_id) })
      .from(student_applications)
      .innerJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(posts.approval_status, "approved"));

    // Count total interviewed applications
    const interviewedResult = await db
      .select({ count: count() })
      .from(student_applications)
      .innerJoin(posts, eq(student_applications.post_id, posts.id))
      .where(
        and(
          eq(posts.approval_status, "approved"),
          eq(student_applications.application_status, "interviewed")
        )
      );

    // Count total applications
    const totalApplicationsResult = await db
      .select({ count: count() })
      .from(student_applications)
      .innerJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(posts.approval_status, "approved"));

    // Count total applied applications
    const appliedResult = await db
      .select({ count: count() })
      .from(student_applications)
      .innerJoin(posts, eq(student_applications.post_id, posts.id))
      .where(
        and(
          eq(posts.approval_status, "approved"),
          eq(student_applications.application_status, "applied")
        )
      );

    // Count total offers
    const offersResult = await db
      .select({ count: count() })
      .from(student_applications)
      .innerJoin(posts, eq(student_applications.post_id, posts.id))
      .where(
        and(
          eq(posts.approval_status, "approved"),
          eq(student_applications.application_status, "offer")
        )
      );

    const totalPosts = parseInt(totalPostsResult[0]?.count || 0);
    const totalAppliedStudents = parseInt(uniqueStudentsResult[0]?.count || 0);
    const totalApplications = parseInt(totalApplicationsResult[0]?.count || 0);
    const totalApplied = parseInt(appliedResult[0]?.count || 0);
    const totalInterviewed = parseInt(interviewedResult[0]?.count || 0);
    const totalOffers = parseInt(offersResult[0]?.count || 0);

    res.json({
      ok: true,
      stats: {
        totalPosts,
        totalAppliedStudents,
        totalApplications,
        totalApplied,
        totalInterviewed,
        totalOffers,
      },
    });
  } catch (e) {
    console.error("Error fetching global stats:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Delete application (placement cell only)
router.delete("/application/:applicationId", requireAuth, async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const deleted = await db
      .delete(student_applications)
      .where(eq(student_applications.id, applicationId))
      .returning();

    if (deleted.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Application not found" });
    }

    res.json({ ok: true, message: "Application deleted successfully" });
  } catch (e) {
    console.error("Error deleting application:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Bulk import applications from CSV (placement cell only)
router.post("/bulk-import", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { applications, postId } = req.body;

    if (
      !applications ||
      !Array.isArray(applications) ||
      applications.length === 0
    ) {
      return res
        .status(400)
        .json({ ok: false, error: "No applications provided" });
    }

    if (!postId) {
      return res.status(400).json({ ok: false, error: "Post ID is required" });
    }

    // Verify post exists and is approved
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }

    if (post[0].approval_status !== "approved") {
      return res.status(403).json({ ok: false, error: "Post is not approved" });
    }

    const importedApplications = [];
    const errors = [];

    for (const app of applications) {
      try {
        // Check if student already exists or create a placeholder user
        let studentUser = await db
          .select()
          .from(user)
          .where(
            eq(user.email, app.email || `${app.roll_number}@placeholder.com`)
          )
          .limit(1);

        let studentId;
        if (studentUser.length === 0) {
          // Create a placeholder user for external students
          const newUser = await db
            .insert(user)
            .values({
              email: app.email || `${app.roll_number}@placeholder.com`,
              password: "placeholder", // This should be handled differently in production
              role: "student",
              is_verified: false,
            })
            .returning();
          studentId = newUser[0].id;

          // Create student profile
          await db.insert(student_profile).values({
            user_id: studentId,
            full_name: app.full_name,
            roll_number: app.roll_number,
            branch: app.branch,
            current_semester: app.current_semester,
            cgpa: app.cgpa,
            tenth_score: app.tenth_score,
            twelfth_score: app.twelfth_score,
            contact_number: app.contact_number || null,
          });
        } else {
          studentId = studentUser[0].id;
        }

        // Check if already applied
        const existingApplication = await db
          .select()
          .from(student_applications)
          .where(
            and(
              eq(student_applications.post_id, postId),
              eq(student_applications.student_id, studentId)
            )
          )
          .limit(1);

        if (existingApplication.length > 0) {
          errors.push(
            `Student ${app.full_name} (${app.roll_number}) already applied`
          );
          continue;
        }

        // Create application
        const newApplication = await db
          .insert(student_applications)
          .values({
            post_id: postId,
            student_id: studentId,
            full_name: app.full_name,
            email: app.email || `${app.roll_number}@placeholder.com`,
            roll_number: app.roll_number,
            branch: app.branch,
            current_semester: app.current_semester,
            cgpa: app.cgpa,
            tenth_score: app.tenth_score,
            twelfth_score: app.twelfth_score,
            contact_number: app.contact_number || null,
            resume_link: app.resume_link || null,
            cover_letter: app.cover_letter || null,
            application_status: app.application_status || "applied",
            applied_at: app.applied_at ? new Date(app.applied_at) : new Date(),
          })
          .returning();

        importedApplications.push(newApplication[0]);
      } catch (error) {
        console.error("Error importing application:", error);
        errors.push(`Failed to import ${app.full_name}: ${error.message}`);
      }
    }

    res.json({
      ok: true,
      imported: importedApplications.length,
      errors: errors.length > 0 ? errors : undefined,
      applications: importedApplications,
    });
  } catch (e) {
    console.error("Error bulk importing applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Send application list to recruiter (placement cell only)
router.post("/send-list/:postId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { postId } = req.params;
    const { recruiterId } = req.body;

    if (!recruiterId) {
      return res
        .status(400)
        .json({ ok: false, error: "Recruiter ID is required" });
    }

    // Check if list has already been sent for this post
    const existingSentList = await db
      .select()
      .from(sent_lists)
      .where(eq(sent_lists.post_id, postId))
      .limit(1);

    if (existingSentList.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "Application list has already been sent for this post",
      });
    }

    // Verify post exists and belongs to the recruiter
    const post = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.user_id, recruiterId)))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Post not found or doesn't belong to recruiter",
      });
    }

    // Get all applications for this post
    const applications = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.post_id, postId))
      .orderBy(desc(student_applications.applied_at));

    if (applications.length === 0) {
      return res
        .status(400)
        .json({ ok: false, error: "No applications found for this post" });
    }

    // Create sent list record
    const sentList = await db
      .insert(sent_lists)
      .values({
        post_id: postId,
        sent_by: req.user.id,
        sent_to: recruiterId,
        list_data: applications,
      })
      .returning();

    res.json({
      ok: true,
      message: "Application list sent to recruiter successfully",
      sentList: sentList[0],
      applicationsCount: applications.length,
    });
  } catch (e) {
    console.error("Error sending application list:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get received lists for recruiter
router.get("/received-lists", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const receivedLists = await db
      .select({
        sent_list: sent_lists,
        post: posts,
      })
      .from(sent_lists)
      .leftJoin(posts, eq(sent_lists.post_id, posts.id))
      .where(eq(sent_lists.sent_to, req.user.id))
      .orderBy(desc(sent_lists.sent_at));

    res.json({ ok: true, lists: receivedLists });
  } catch (e) {
    console.error("Error fetching received lists:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get specific received list details
router.get("/received-list/:listId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { listId } = req.params;

    const receivedList = await db
      .select({
        sent_list: sent_lists,
        post: posts,
      })
      .from(sent_lists)
      .leftJoin(posts, eq(sent_lists.post_id, posts.id))
      .where(
        and(eq(sent_lists.id, listId), eq(sent_lists.sent_to, req.user.id))
      )
      .limit(1);

    if (receivedList.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Received list not found" });
    }

    res.json({ ok: true, list: receivedList[0] });
  } catch (e) {
    console.error("Error fetching received list details:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get all sent lists for placement cell
router.get("/sent-lists", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const sentLists = await db
      .select({
        sent_list: sent_lists,
        post: posts,
      })
      .from(sent_lists)
      .leftJoin(posts, eq(sent_lists.post_id, posts.id))
      .where(eq(sent_lists.sent_by, req.user.id))
      .orderBy(desc(sent_lists.sent_at));

    res.json({ ok: true, lists: sentLists });
  } catch (e) {
    console.error("Error fetching sent lists:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Download received list as CSV
router.get("/received-list/:listId/download", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { listId } = req.params;

    const receivedList = await db
      .select({
        sent_list: sent_lists,
        post: posts,
      })
      .from(sent_lists)
      .leftJoin(posts, eq(sent_lists.post_id, posts.id))
      .where(
        and(eq(sent_lists.id, listId), eq(sent_lists.sent_to, req.user.id))
      )
      .limit(1);

    if (receivedList.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Received list not found" });
    }

    const listData = receivedList[0];
    const applications = listData.sent_list.list_data;

    // Create CSV content
    const csvHeaders = [
      "Student Name",
      "Roll Number",
      "Branch",
      "Semester",
      "CGPA",
      "10th",
      "12th",
      "Company",
      "Position",
      "Status",
      "Applied Date",
    ];

    const csvRows = applications.map((app) => [
      app.full_name,
      app.roll_number,
      app.branch,
      app.current_semester,
      app.cgpa,
      app.tenth_score,
      app.twelfth_score,
      listData.post.company_name,
      listData.post.position,
      app.application_status,
      new Date(app.applied_at).toLocaleDateString(),
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${listData.post.company_name}_${listData.post.position}_applications.csv"`
    );

    res.send(csvContent);
  } catch (e) {
    console.error("Error downloading received list:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.post("/schedule-interview", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const {
      applicationId,
      interview_type,
      interview_date,
      interview_time,
      location,
      meeting_link,
      notes,
    } = req.body;

    if (!applicationId || !interview_date || !interview_time) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields",
      });
    }

    // Get application
    const application = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.id, applicationId))
      .limit(1);

    if (application.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Application not found",
      });
    }

    // Verify post belongs to recruiter
    const post = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.id, application[0].post_id),
          eq(posts.user_id, req.user.id)
        )
      )
      .limit(1);

    if (post.length === 0) {
      return res.status(403).json({
        ok: false,
        error: "Post doesn't belong to you",
      });
    }

    // Combine date and time
    const interviewDateTime = new Date(`${interview_date}T${interview_time}`);

    // Update application with interview details
    await db
      .update(student_applications)
      .set({
        application_status: "interview_scheduled",
        interview_date: interviewDateTime,
        interview_confirmed: true,
        placement_notes:
          `Interview scheduled for ${
            interview_type === "online" ? "Online" : "Offline"
          }\n` +
          `Date: ${interview_date} at ${interview_time}\n` +
          `${
            interview_type === "online"
              ? `Meeting Link: ${meeting_link}`
              : `Location: ${location}`
          }\n` +
          `${notes ? `Notes: ${notes}` : ""}`,
        updated_at: new Date(),
      })
      .where(eq(student_applications.id, applicationId));

    // Add timeline event
    await db.insert(application_timeline).values({
      application_id: applicationId,
      event_type: "interview_scheduled",
      title: "Interview Scheduled",
      description:
        `Interview scheduled on ${interview_date} at ${interview_time}\n` +
        `${
          interview_type === "online"
            ? `Meeting Link: ${meeting_link}`
            : `Location: ${location}`
        }`,
      event_date: new Date(),
      visibility: "all",
    });

    res.json({
      ok: true,
      message: "Interview scheduled successfully",
    });
  } catch (e) {
    console.error("Error scheduling interview:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Send Feedback (Recruiter only)
router.post("/feedback", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { applicationId, feedback, rating } = req.body;

    if (!applicationId || !feedback || !rating) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields",
      });
    }

    // Get application
    const application = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.id, applicationId))
      .limit(1);

    if (application.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Application not found",
      });
    }

    // Verify post belongs to recruiter
    const post = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.id, application[0].post_id),
          eq(posts.user_id, req.user.id)
        )
      )
      .limit(1);

    if (post.length === 0) {
      return res.status(403).json({
        ok: false,
        error: "Post doesn't belong to you",
      });
    }

    // Update application with feedback
    const existingNotes = application[0].placement_notes || "";
    const feedbackText = `\n\nFeedback from recruiter (Rating: ${rating}/5):\n${feedback}`;

    await db
      .update(student_applications)
      .set({
        application_status: "interviewed",
        placement_notes: existingNotes + feedbackText,
        updated_at: new Date(),
      })
      .where(eq(student_applications.id, applicationId));

    // Add timeline event
    await db.insert(application_timeline).values({
      application_id: applicationId,
      event_type: "feedback_received",
      title: "Interview Feedback Received",
      description: `Recruiter provided feedback with rating: ${rating}/5`,
      event_date: new Date(),
      visibility: "placement",
    });

    res.json({
      ok: true,
      message: "Feedback sent successfully",
    });
  } catch (e) {
    console.error("Error sending feedback:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Reject Application (Recruiter only)
router.put("/reject/:applicationId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { applicationId } = req.params;

    // Get application
    const application = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.id, applicationId))
      .limit(1);

    if (application.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Application not found",
      });
    }

    // Verify post belongs to recruiter
    const post = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.id, application[0].post_id),
          eq(posts.user_id, req.user.id)
        )
      )
      .limit(1);

    if (post.length === 0) {
      return res.status(403).json({
        ok: false,
        error: "Post doesn't belong to you",
      });
    }

    // Update application status
    await db
      .update(student_applications)
      .set({
        application_status: "rejected",
        updated_at: new Date(),
      })
      .where(eq(student_applications.id, applicationId));

    // Add timeline event
    await db.insert(application_timeline).values({
      application_id: applicationId,
      event_type: "rejected",
      title: "Application Rejected",
      description: `Application rejected by ${post[0].company_name}`,
      event_date: new Date(),
      visibility: "all",
    });

    res.json({
      ok: true,
      message: "Application rejected successfully",
    });
  } catch (e) {
    console.error("Error rejecting application:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get recruiter's applications (Recruiter only)
router.get("/recruiter/applications", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    // Get all posts by this recruiter
    const recruiterPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.user_id, req.user.id));

    if (recruiterPosts.length === 0) {
      return res.json({ ok: true, applications: [] });
    }

    const postIds = recruiterPosts.map((p) => p.id);

    // Get all applications for these posts
    const applications = await db
      .select({
        application: student_applications,
        post: posts,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(posts.user_id, req.user.id))
      .orderBy(desc(student_applications.applied_at));

    // Flatten the data
    const flattenedApplications = applications.map((item) => ({
      ...item.application,
      company_name: item.post?.company_name,
      position: item.post?.position,
    }));

    res.json({ ok: true, applications: flattenedApplications });
  } catch (e) {
    console.error("Error fetching recruiter applications:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get single application details (All roles)
router.get("/application/:applicationId", requireAuth, async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.id, applicationId))
      .limit(1);

    if (application.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Application not found",
      });
    }

    res.json({ ok: true, application: application[0] });
  } catch (e) {
    console.error("Error fetching application:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get single post details by ID
router.get("/:postId", requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }

    res.json({ ok: true, post: post[0] });
  } catch (e) {
    console.error("Error fetching post:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// GET single application by ID (for recruiters)
router.get("/:applicationId", requireAuth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const token = getToken();

    const [application] = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.id, applicationId))
      .limit(1);

    if (!application) {
      return res
        .status(404)
        .json({ ok: false, error: "Application not found" });
    }

    res.json({ ok: true, application });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch application" });
  }
});

// GET check if list was sent for a post
router.get("/sent-list/:postId", requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const [sentList] = await db
      .select()
      .from(sent_lists)
      .where(eq(sent_lists.post_id, postId))
      .limit(1);

    if (sentList) {
      return res.json({ ok: true, sentList });
    } else {
      return res.json({ ok: true, sentList: null });
    }
  } catch (error) {
    console.error("Error checking sent list:", error);
    res.status(500).json({ ok: false, error: "Failed to check sent list" });
  }
});

export default router;
