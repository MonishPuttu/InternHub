// src/routes/timeline.js
import express from "express";
import { db } from "../db/index.js";
import {
  application_timeline,
  student_applications,
  posts,
  offer_letters,
} from "../db/schema/index.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// ✅ Fixed: Use single version of each status (no duplicates)
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
  offer_pending: {
    order: 4,
    title: "Offer Letter Received",
    description:
      "Offer letter received from recruiter, pending placement approval",
    icon: "offered",
  },
  offer_approved: {
    order: 5,
    title: "Offer Approved",
    description:
      "Congratulations! Your offer has been approved by placement cell",
    icon: "offered",
  },
  rejected: {
    order: 99,
    title: "Not Selected",
    description: "Unfortunately, you were not selected for this position",
    icon: "rejected",
  },
  rejected_by_placement: {
    order: 99,
    title: "Rejected by Placement",
    description: "Offer rejected by placement cell",
    icon: "rejected",
  },
};

// ✅ Status mapping for variations (hyphenated to underscored)
const STATUS_MAPPING = {
  "interview-scheduled": "interview_scheduled",
  "offer-pending": "offer_pending",
  "offer-approved": "offer_approved",
  "rejected-by-placement": "rejected_by_placement",
};

// ✅ Normalize status (convert hyphenated to underscored)
function normalizeStatus(status) {
  return STATUS_MAPPING[status] || status;
}

// ✅ Fixed: Build timeline with no duplicates
function buildCompleteTimeline(dbEvents, currentStatus, appliedDate) {
  // Normalize current status
  const normalizedStatus = normalizeStatus(currentStatus);

  // If status is "applied", only return actual DB events
  if (normalizedStatus === "applied") {
    return dbEvents;
  }

  const currentStatusConfig = STATUS_FLOW[normalizedStatus];
  if (!currentStatusConfig) {
    console.warn(`Unknown status: ${normalizedStatus}`);
    return dbEvents;
  }

  const currentStatusOrder = currentStatusConfig.order;
  const completeTimeline = [];

  // ✅ Define the progression path based on current status
  let progressionPath = [];

  if (
    normalizedStatus === "rejected" ||
    normalizedStatus === "rejected_by_placement"
  ) {
    // Rejection path: show all steps up to rejection
    progressionPath = [
      "applied",
      "interview_scheduled",
      "interviewed",
      normalizedStatus,
    ];
  } else {
    // Success path: show all steps up to current status
    progressionPath = Object.keys(STATUS_FLOW)
      .filter((status) => {
        const config = STATUS_FLOW[status];
        return config.order <= currentStatusOrder && config.order < 99;
      })
      .sort((a, b) => STATUS_FLOW[a].order - STATUS_FLOW[b].order);
  }

  // Build timeline based on progression path
  progressionPath.forEach((status) => {
    const config = STATUS_FLOW[status];

    // Check if event exists in DB (check both normal and hyphenated versions)
    const existingEvent = dbEvents.find((e) => {
      const normalizedEventType = normalizeStatus(e.event_type);
      return normalizedEventType === status;
    });

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
        event_date: appliedDate,
        metadata: null,
        visibility: "student",
        created_at: appliedDate,
        isGenerated: true,
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

// ✅ Get timeline for specific application
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

      // Get timeline events from DB
      const dbTimelineEvents = await db
        .select()
        .from(application_timeline)
        .where(eq(application_timeline.application_id, applicationId))
        .orderBy(application_timeline.event_date);

      // If offer status, fetch offer details
      let offerDetails = null;
      const normalizedStatus = normalizeStatus(
        application.application.application_status
      );

      if (
        normalizedStatus === "offer_pending" ||
        normalizedStatus === "offer_approved"
      ) {
        const [offer] = await db
          .select()
          .from(offer_letters)
          .where(eq(offer_letters.application_id, applicationId))
          .limit(1);

        if (offer) {
          offerDetails = {
            company_name: offer.company_name,
            position: offer.position,
            salary_package: offer.salary_package,
            joining_date: offer.joining_date,
            location: offer.location,
            status: offer.status,
          };
        }
      }

      // Build complete timeline
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
          offerDetails,
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
