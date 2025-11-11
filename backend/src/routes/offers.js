import express from "express";
import { db } from "../db/index.js";
import {
  offer_letters,
  student_applications,
  posts,
  user,
  student_profile,
  application_timeline,
} from "../db/schema/index.js";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// Send offer letter (Recruiter only) - FIXED WITH BASE64 STORAGE
router.post("/send", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const {
      applicationId,
      postId,
      studentId,
      position,
      salary,
      joiningDate,
      location,
      bondPeriod,
      otherTerms,
      offer_letter_base64,
      file_name,
      file_type,
    } = req.body;

    console.log("Received offer data:", {
      applicationId,
      postId,
      studentId,
      position,
      salary,
      joiningDate,
      location,
    });

    // Validate required fields
    if (
      !applicationId ||
      !postId ||
      !studentId ||
      !position ||
      !salary ||
      !joiningDate ||
      !location
    ) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields",
      });
    }

    // Get the application to verify
    const applicationResult = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.id, applicationId))
      .limit(1);

    console.log("Application query result:", applicationResult);

    if (applicationResult.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Application not found",
      });
    }

    const application = applicationResult[0];

    // Verify the post belongs to this recruiter
    const postResult = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.user_id, req.user.id)))
      .limit(1);

    if (postResult.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Post not found or doesn't belong to you",
      });
    }

    const post = postResult[0];

    // Check if offer already sent for this application
    const existingOffer = await db
      .select()
      .from(offer_letters)
      .where(eq(offer_letters.application_id, applicationId))
      .limit(1);

    if (existingOffer.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "Offer already sent for this application",
      });
    }

    console.log("Inserting offer with:", {
      application_id: applicationId,
      student_id: studentId,
      post_id: postId,
      recruiter_id: req.user.id,
    });

    // Create offer letter record with base64
    const offerLetter = await db
      .insert(offer_letters)
      .values({
        application_id: applicationId,
        student_id: studentId,
        post_id: postId,
        recruiter_id: req.user.id,
        company_name: post.company_name,
        position: position,
        salary_package: parseFloat(salary),
        joining_date: new Date(joiningDate),
        location: location,
        bond_period: bondPeriod ? parseInt(bondPeriod) : 0,
        other_terms: otherTerms || null,
        offer_letter_url: offer_letter_base64, // Store base64
        file_name: file_name,
        file_type: file_type,
        status: "pending_placement_approval",
      })
      .returning();

    // Update application status - ONLY application_status, NO offer_status
    await db
      .update(student_applications)
      .set({
        application_status: "offer_pending", // Changed from "offer" to "offer_pending"
        updated_at: new Date(),
      })
      .where(eq(student_applications.id, applicationId));

    // Add timeline event
    await db.insert(application_timeline).values({
      application_id: applicationId,
      event_type: "offer_sent",
      title: "Offer Letter Sent",
      description: `Offer sent for ${position} position at ${post.company_name}. Awaiting placement cell approval.`,
      event_date: new Date(),
      visibility: "all",
    });

    res.status(201).json({
      ok: true,
      message: "Offer letter sent successfully",
      offer: offerLetter[0],
    });
  } catch (e) {
    console.error("Error sending offer letter:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Reject application (Recruiter only)
router.post("/reject", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { applicationId, postId, rejectionReason } = req.body;

    if (!applicationId || !postId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields",
      });
    }

    // Verify the post belongs to this recruiter
    const post = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.user_id, req.user.id)))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Post not found or doesn't belong to you",
      });
    }

    // Update application status - ONLY application_status
    await db
      .update(student_applications)
      .set({
        application_status: "rejected",
        placement_notes: rejectionReason || null,
        updated_at: new Date(),
      })
      .where(eq(student_applications.id, applicationId));

    // Add timeline event
    await db.insert(application_timeline).values({
      application_id: applicationId,
      event_type: "rejected",
      title: "Application Rejected",
      description:
        rejectionReason ||
        `Application rejected for ${post[0].position} at ${post[0].company_name}`,
      event_date: new Date(),
      visibility: "placement",
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

// Get all offers (Placement Cell only)
router.get("/all", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const offers = await db
      .select({
        offer: offer_letters,
        application: student_applications,
        post: posts,
      })
      .from(offer_letters)
      .leftJoin(
        student_applications,
        eq(offer_letters.application_id, student_applications.id)
      )
      .leftJoin(posts, eq(offer_letters.post_id, posts.id))
      .orderBy(desc(offer_letters.created_at));

    res.json({ ok: true, offers });
  } catch (e) {
    console.error("Error fetching offers:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get offer by application ID (Placement Cell and Recruiter)
router.get("/by-application/:applicationId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement" && req.user.role !== "recruiter") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { applicationId } = req.params;

    const offer = await db
      .select()
      .from(offer_letters)
      .where(eq(offer_letters.application_id, applicationId))
      .limit(1);

    if (offer.length === 0) {
      return res.status(404).json({ ok: false, error: "Offer not found" });
    }

    res.json({ ok: true, offer: offer[0] });
  } catch (e) {
    console.error("Error fetching offer:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Approve offer and forward to student (Placement Cell only)
router.put("/approve/:offerId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { offerId } = req.params;

    // Update offer status
    const updatedOffer = await db
      .update(offer_letters)
      .set({
        status: "approved",
        approved_by: req.user.id,
        approved_at: new Date(),
      })
      .where(eq(offer_letters.id, offerId))
      .returning();

    if (updatedOffer.length === 0) {
      return res.status(404).json({ ok: false, error: "Offer not found" });
    }

    // Update application status - ONLY application_status
    await db
      .update(student_applications)
      .set({
        application_status: "offer_approved",
        updated_at: new Date(),
      })
      .where(eq(student_applications.id, updatedOffer[0].application_id));

    // Add timeline event
    await db.insert(application_timeline).values({
      application_id: updatedOffer[0].application_id,
      event_type: "offer_approved",
      title: "Offer Approved",
      description: `Offer letter approved by placement cell and forwarded to student`,
      event_date: new Date(),
      visibility: "all",
    });

    res.json({
      ok: true,
      message: "Offer approved and forwarded to student",
      offer: updatedOffer[0],
    });
  } catch (e) {
    console.error("Error approving offer:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Reject offer (Placement Cell only)
router.put("/reject-offer/:offerId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const { offerId } = req.params;
    const { reason } = req.body;

    // Update offer status
    const updatedOffer = await db
      .update(offer_letters)
      .set({
        status: "rejected_by_placement",
        placement_notes: reason || null,
      })
      .where(eq(offer_letters.id, offerId))
      .returning();

    if (updatedOffer.length === 0) {
      return res.status(404).json({ ok: false, error: "Offer not found" });
    }

    // Update application status - ONLY application_status
    await db
      .update(student_applications)
      .set({
        application_status: "offer_rejected",
        updated_at: new Date(),
      })
      .where(eq(student_applications.id, updatedOffer[0].application_id));

    // Add timeline event
    await db.insert(application_timeline).values({
      application_id: updatedOffer[0].application_id,
      event_type: "offer_rejected_placement",
      title: "Offer Rejected by Placement Cell",
      description: reason || "Offer rejected by placement cell",
      event_date: new Date(),
      visibility: "placement",
    });

    res.json({
      ok: true,
      message: "Offer rejected",
      offer: updatedOffer[0],
    });
  } catch (e) {
    console.error("Error rejecting offer:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Get student's offers (Student only)
router.get("/my-offers", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const offers = await db
      .select({
        offer: offer_letters,
        post: posts,
      })
      .from(offer_letters)
      .leftJoin(posts, eq(offer_letters.post_id, posts.id))
      .where(
        and(
          eq(offer_letters.student_id, req.user.id),
          eq(offer_letters.status, "approved")
        )
      )
      .orderBy(desc(offer_letters.created_at));

    res.json({ ok: true, offers });
  } catch (e) {
    console.error("Error fetching student offers:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Download offer letter (Students, Placement Officers, and Recruiters)
router.get("/download/:offerId", requireAuth, async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await db
      .select()
      .from(offer_letters)
      .where(eq(offer_letters.id, offerId))
      .limit(1);

    if (offer.length === 0) {
      return res.status(404).json({ error: "Offer not found" });
    }

    if (!offer[0].offer_letter_url) {
      return res.status(404).json({ error: "File not found" });
    }

    // Decode base64 and send
    const base64Data = offer[0].offer_letter_url.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    res.setHeader("Content-Type", offer[0].file_type || "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${offer[0].file_name || "offer_letter.pdf"}"`
    );
    res.send(buffer);
  } catch (e) {
    console.error("Error downloading offer:", e);
    res.status(500).json({ error: String(e) });
  }
});

export default router;
