// src/routes/timeline.js
import express from "express";
import { db } from "../db/index.js";
import {
  application_timeline,
  student_applications,
  posts,
} from "../db/schema/index.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// ✅ Status flow definition
const STATUS_FLOW = {
  applied: {
    order: 1,
    title: "Application Submitted",
    description: "Successfully applied for the position",
    icon: "applied",
  },
  interview_scheduled: {
    order: 2,
    title: "Interview Scheduled",
    description: "Interview has been scheduled",
    icon: "interview_scheduled",
  },
  interviewed: {
    order: 3,
    title: "Interview Completed",
    description: "Interview completed successfully",
    icon: "interviewed",
  },
  offered: {
    order: 4,
    title: "Offer Received",
    description: "Congratulations! You have received an offer",
    icon: "offered",
  },
  rejected: {
    order: 4,
    title: "Not Selected",
    description: "Unfortunately, you were not selected for this position",
    icon: "rejected",
  },
};

// ✅ Build complete timeline based on current status
function buildCompleteTimeline(dbEvents, currentStatus, appliedDate) {
  // ✅ If status is "applied", only return actual DB events (no auto-generation)
  if (currentStatus === "applied") {
    return dbEvents;
  }

  const currentStatusOrder = STATUS_FLOW[currentStatus]?.order || 1;
  const completeTimeline = [];

  // Get all statuses up to current status
  const requiredStatuses = Object.entries(STATUS_FLOW)
    .filter(([status, config]) => {
      // Include all statuses up to current order
      if (currentStatus === "rejected" || currentStatus === "offered") {
        // For terminal states, include all previous steps + final step
        return (
          config.order < STATUS_FLOW[currentStatus].order ||
          status === currentStatus
        );
      } else {
        return config.order <= currentStatusOrder;
      }
    })
    .sort((a, b) => a[1].order - b[1].order);

  // Build timeline
  requiredStatuses.forEach(([status, config]) => {
    // Check if event exists in DB
    const existingEvent = dbEvents.find((e) => e.event_type === status);

    if (existingEvent) {
      // Use actual event from DB
      completeTimeline.push(existingEvent);
    } else {
      // Auto-generate missing intermediate steps
      completeTimeline.push({
        id: `generated-${status}`,
        application_id: null,
        event_type: status,
        title: config.title,
        description: config.description,
        event_date: appliedDate, // Use applied date as fallback
        metadata: null,
        visibility: "student",
        created_at: appliedDate,
        isGenerated: true, // Mark as auto-generated
      });
    }
  });

  return completeTimeline;
}

// ✅ Get student's applied posts (list view)
router.get("/my-applications", requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;

    if (req.user.role !== "student") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
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

    res.json({ ok: true, applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch applications" });
  }
});

// ✅ Get timeline for specific application (with smart timeline building)
router.get(
  "/application/:applicationId/timeline",
  requireAuth,
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const studentId = req.user.id;

      // Verify application belongs to student
      const [application] = await db
        .select({
          application: student_applications,
          post: posts,
        })
        .from(student_applications)
        .leftJoin(posts, eq(student_applications.post_id, posts.id))
        .where(eq(student_applications.id, applicationId))
        .limit(1);

      if (!application) {
        return res
          .status(404)
          .json({ ok: false, error: "Application not found" });
      }

      if (application.application.student_id !== studentId) {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      // ✅ Simply get timeline events - NO auto-creation
      const dbTimelineEvents = await db
        .select()
        .from(application_timeline)
        .where(eq(application_timeline.application_id, applicationId))
        .orderBy(application_timeline.event_date);

      // ✅ Build complete timeline with auto-generated events
      const completeTimeline = buildCompleteTimeline(
        dbTimelineEvents,
        application.application.application_status,
        application.application.applied_at
      );

      res.json({
        ok: true,
        data: {
          application: application.application,
          post: application.post,
          timeline: completeTimeline,
          currentStatus: application.application.application_status,
        },
      });
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ ok: false, error: "Failed to fetch timeline" });
    }
  }
);

// ✅ Student confirms interview attendance
router.post(
  "/application/:applicationId/confirm-interview",
  requireAuth,
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { attended } = req.body;
      const studentId = req.user.id;

      // Verify application belongs to student
      const [application] = await db
        .select()
        .from(student_applications)
        .where(eq(student_applications.id, applicationId))
        .limit(1);

      if (!application || application.student_id !== studentId) {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      if (attended) {
        // Student attended interview
        await db
          .update(student_applications)
          .set({
            application_status: "interviewed",
            interview_confirmed: true,
            updated_at: new Date(),
          })
          .where(eq(student_applications.id, applicationId));

        // Add timeline event
        await db.insert(application_timeline).values({
          application_id: applicationId,
          event_type: "interviewed",
          title: "Interview Completed",
          description:
            "Interview attended successfully. Awaiting feedback from recruiter.",
          event_date: new Date(),
          visibility: "student",
        });

        res.json({ ok: true, message: "Interview attendance confirmed" });
      } else {
        // Student did not attend
        await db
          .update(student_applications)
          .set({
            interview_confirmed: true,
            updated_at: new Date(),
          })
          .where(eq(student_applications.id, applicationId));

        res.json({ ok: true, message: "Response recorded" });
      }
    } catch (error) {
      console.error("Error confirming interview:", error);
      res.status(500).json({ ok: false, error: "Failed to confirm interview" });
    }
  }
);

export default router;
