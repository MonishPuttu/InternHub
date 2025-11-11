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
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/offer-letters";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `offer-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Send offer letter (Recruiter only)
router.post(
  "/send",
  requireAuth,
  upload.single("offerLetter"),
  async (req, res) => {
    try {
      if (req.user.role !== "recruiter") {
        return res.status(403).json({ ok: false, error: "Forbidden" });
      }

      const {
        applicationId,
        postId,
        position,
        salary,
        joiningDate,
        location,
        bondPeriod,
        otherTerms,
      } = req.body;

      console.log("Received offer data:", {
        applicationId,
        postId,
        position,
        salary,
        joiningDate,
        location,
      });

      // Validate required fields
      if (
        !applicationId ||
        !postId ||
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

      // Get the application to fetch student_id
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
      const studentId = application.student_id;

      console.log("Student ID from application:", studentId);

      if (!studentId) {
        return res.status(400).json({
          ok: false,
          error: "Student ID not found in application",
        });
      }

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

      // Create offer letter record
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
          offer_letter_url: req.file
            ? `/uploads/offer-letters/${req.file.filename}`
            : null,
          status: "pending_placement_approval",
        })
        .returning();

      // Update application status
      await db
        .update(student_applications)
        .set({
          application_status: "offer",
          offer_status: "pending_placement_approval",
          updated_at: new Date(),
        })
        .where(eq(student_applications.id, applicationId));

      // Add timeline event
      await db.insert(application_timeline).values({
        application_id: applicationId,
        event_type: "offer_sent",
        title: "Offer Letter Sent",
        description: `Offer sent for ${position} position at ${post.company_name}`,
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
  }
);

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

    // Update application status
    await db
      .update(student_applications)
      .set({
        application_status: "rejected",
        offer_status: "rejected",
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

// Get offer by application ID (Placement Cell only)
router.get("/by-application/:applicationId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
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

    // Update application offer_status
    await db
      .update(student_applications)
      .set({
        offer_status: "approved",
        updated_at: new Date(),
      })
      .where(eq(student_applications.id, updatedOffer[0].application_id));

    // Add timeline event
    await db.insert(application_timeline).values({
      application_id: updatedOffer[0].application_id,
      event_type: "offer_approved",
      title: "Offer Approved",
      description: `Offer letter approved by placement cell`,
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

    // Update application offer_status
    await db
      .update(student_applications)
      .set({
        offer_status: "rejected_by_placement",
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

// Download offer letter (Students and Placement Officers)
router.get("/download/:offerId", requireAuth, async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch the offer
    const offer = await db
      .select()
      .from(offer_letters)
      .where(eq(offer_letters.id, offerId))
      .limit(1);

    if (offer.length === 0) {
      return res.status(404).json({ ok: false, error: "Offer not found" });
    }

    const offerData = offer[0];

    // Authorization: Students can only access their own offers, Placement officers can access all
    if (userRole === "student") {
      if (offerData.student_id !== userId) {
        return res.status(403).json({
          ok: false,
          error: "You can only download your own offer letters",
        });
      }
    } else if (userRole !== "placement") {
      // Only students and placement officers are allowed
      return res.status(403).json({
        ok: false,
        error: "Insufficient permissions to download offer letters",
      });
    }
    // Placement officers have unrestricted access (no additional check needed)

    if (!offerData.offer_letter_url) {
      return res.status(404).json({
        ok: false,
        error: "Offer letter file not found",
      });
    }

    const filePath = path.join(process.cwd(), offerData.offer_letter_url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        ok: false,
        error: "Offer letter file not found on server",
      });
    }

    res.download(filePath);
  } catch (e) {
    console.error("Error downloading offer letter:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
