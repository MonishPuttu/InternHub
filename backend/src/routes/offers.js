import express from "express";
import { db } from "../db/index.js";
import {
  offer_letters,
  student_applications,
  posts,
  application_timeline,
} from "../db/schema/index.js";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/send", requireAuth, async (req, res) => {
  try {
    // --- Role Validation ---
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        ok: false,
        error: "Forbidden: only recruiters can send offers",
      });
    }

    // --- Extract Body ---
    const {
      student_id,
      post_id,
      application_id,
      company_name,
      position,
      package_offered,
      joining_date,
      location,
      offer_letter_file,
      file_name,
      file_type,
      notes,
    } = req.body;

    // --- Validation ---
    if (
      !student_id ||
      !post_id ||
      !application_id ||
      !company_name ||
      !position ||
      !package_offered ||
      !joining_date ||
      !location ||
      !offer_letter_file
    ) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields in offer letter submission",
      });
    }

    // --- Validate Application ---
    const [application] = await db
      .select()
      .from(student_applications)
      .where(eq(student_applications.id, application_id))
      .limit(1);

    if (!application) {
      return res
        .status(404)
        .json({ ok: false, error: "Application not found" });
    }

    // --- Validate Post ---
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, post_id))
      .limit(1);

    if (!post) {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }

    const existingOffer = await db
      .select()
      .from(offer_letters)
      .where(eq(offer_letters.application_id, application_id))
      .limit(1);

    if (existingOffer.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "Offer letter already sent for this application",
      });
    }

    // --- Insert Offer Letter ---
    const [offerLetter] = await db
      .insert(offer_letters)
      .values({
        application_id,
        student_id,
        post_id,
        recruiter_id: req.user.id,
        company_name,
        position,
        salary_package: parseFloat(package_offered),
        joining_date: new Date(joining_date),
        location, // ✅ fixed: added to satisfy NOT NULL constraint
        offer_letter_url: offer_letter_file,
        file_name,
        file_type,
        status: "pending_placement_approval",
        placement_notes: notes || null,
      })
      .returning();

    // --- Update Application Status ---
    await db
      .update(student_applications)
      .set({ application_status: "offer-pending" })
      .where(eq(student_applications.id, application_id));

    // --- Add to Timeline ---
    await db.insert(application_timeline).values({
      application_id: application_id, // ✅ fixed: previously used undefined variable
      event_type: "offer_sent",
      title: "Offer Sent to Candidate",
      description: `Offer letter for ${position} at ${company_name} sent by recruiter.`,
      event_date: new Date(),
      visibility: "student", // depends on your schema defaults
    });

    // --- Response ---
    return res.json({
      ok: true,
      message: "Offer letter sent successfully",
      offer: offerLetter,
    });
  } catch (error) {
    console.error("Error sending offer letter:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Internal server error",
    });
  }
});

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

    // ✅ Fixed: Update application_status instead of status
    await db
      .update(student_applications)
      .set({
        application_status: "rejected",
        updated_at: new Date(),
      })
      .where(eq(student_applications.id, applicationId));

    // ✅ Fixed: Add proper timeline event
    await db.insert(application_timeline).values({
      application_id: applicationId,
      event_type: "rejected",
      title: "Application Rejected",
      description: rejectionReason || "Application rejected by recruiter",
      event_date: new Date(),
      visibility: "student",
    });

    res.json({
      ok: true,
      message: "Application rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
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

    const studentId = req.user.id;

    const studentOffers = await db
      .select()
      .from(offer_letters)
      .where(eq(offer_letters.student_id, studentId))
      .orderBy(desc(offer_letters.created_at));

    res.json({ ok: true, offers: studentOffers });
  } catch (error) {
    console.error("Error fetching student offers:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
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
