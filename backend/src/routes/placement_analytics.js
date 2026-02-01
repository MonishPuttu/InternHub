import express from "express";
import { db } from "../db/index.js";
import { eq, count, sum, sql, countDistinct, and } from "drizzle-orm";
import {
  student_applications,
  posts,
  user,
  offer_letters,
  student_profile,
} from "../db/schema/index.js";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// Get overall placement statistics
router.get("/statistics", requireAuth, async (req, res) => {
  try {
    // Check if user is placement officer
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const department = req.query.department;

    // Get total unique students who have applied
    let totalStudentsQuery = db
      .select({ count: countDistinct(student_applications.student_id) })
      .from(student_applications)
      .innerJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(posts.approval_status, "approved"));

    if (department && department !== "All Dept") {
      totalStudentsQuery = totalStudentsQuery.where(
        eq(student_applications.branch, department)
      );
    }

    const totalStudentsResult = await totalStudentsQuery;

    // Get total students who received offers (placed)
    let totalPlacedQuery = db
      .select({ count: countDistinct(student_applications.student_id) })
      .from(student_applications)
      .innerJoin(posts, eq(student_applications.post_id, posts.id))
      .where(
        and(
          eq(posts.approval_status, "approved"),
          eq(student_applications.application_status, "offer")
        )
      );

    if (department && department !== "All Dept") {
      totalPlacedQuery = totalPlacedQuery.where(
        eq(student_applications.branch, department)
      );
    }

    const totalPlacedResult = await totalPlacedQuery;

    // Get total approved companies
    const totalCompaniesResult = await db
      .select({ count: countDistinct(posts.user_id) })
      .from(posts)
      .where(eq(posts.approval_status, "approved"));

    // Highest and average package (from positions array)
    const postsWithPositions = await db
      .select({ positions: posts.positions })
      .from(posts)
      .where(eq(posts.approval_status, "approved"));

    const allPackages = postsWithPositions.flatMap((p) =>
      Array.isArray(p.positions)
        ? p.positions
            .map((pos) => parseFloat(pos.package_offered))
            .filter((x) => !isNaN(x))
        : []
    );

    const highest_package =
      allPackages.length > 0 ? Math.max(...allPackages) : 0;
    const average_package =
      allPackages.length > 0
        ? allPackages.reduce((acc, x) => acc + x, 0) / allPackages.length
        : 0;

    // Get career path statistics (placement vs higher_education)
    let careerPathQuery = db
      .select({
        career_path: student_profile.career_path,
        count: count(),
      })
      .from(student_profile)
      .innerJoin(user, eq(student_profile.user_id, user.id))
      .where(eq(user.role, "student"))
      .groupBy(student_profile.career_path);

    if (department && department !== "All Dept") {
      careerPathQuery = careerPathQuery.where(
        eq(student_profile.branch, department)
      );
    }

    const careerPathResult = await careerPathQuery;

    const careerPathStats = {
      placement: 0,
      higher_education: 0,
    };

    careerPathResult.forEach((row) => {
      if (row.career_path === "placement") {
        careerPathStats.placement = parseInt(row.count);
      } else if (row.career_path === "higher_education") {
        careerPathStats.higher_education = parseInt(row.count);
      }
    });

    const total_students = parseInt(totalStudentsResult[0]?.count || 0);
    const total_placed = parseInt(totalPlacedResult[0]?.count || 0);
    const total_companies = parseInt(totalCompaniesResult[0]?.count || 0);

    res.json({
      ok: true,
      data: {
        total_students,
        total_placed,
        total_companies,
        highest_package,
        average_package: Number(average_package.toFixed(2)),
        career_path_stats: careerPathStats,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch placement statistics",
    });
  }
});

// NEW ENDPOINT: Get total students count (for Career Path Distribution denominator)
router.get("/total-students", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }
    
    const department = req.query.department;
    
    let query = db
      .select({ count: count() })
      .from(student_profile)
      .innerJoin(user, eq(student_profile.user_id, user.id))
      .where(eq(user.role, "student"));
    
    if (department && department !== "All Dept") {
      query = query.where(eq(student_profile.branch, department));
    }
    
    const result = await query;
    
    res.json({
      ok: true,
      total_students: parseInt(result[0]?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching total students:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch total students count",
    });
  }
});

// Get applied students data for stacked horizontal bar chart
router.get("/applied-students", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }
    const department = req.query.department;

    // Get all applications with approved posts and offer details
    const applicationsWithPosts = await db
      .select({
        application: student_applications,
        post: posts,
        offer: offer_letters,
      })
      .from(student_applications)
      .leftJoin(posts, eq(student_applications.post_id, posts.id))
      .leftJoin(
        offer_letters,
        eq(student_applications.id, offer_letters.application_id)
      )
      .where(eq(posts.approval_status, "approved"));

    // Group by post
    const postGroups = {};
    applicationsWithPosts.forEach((item) => {
      if (!item.post) return;
      const postId = item.post.id;
      // Get all position titles
      const post_name =
        item.post && Array.isArray(item.post.positions)
          ? `${item.post.company_name} - ${item.post.positions
              .map((pos) => pos.title)
              .join(", ")}`
          : `${item.post?.company_name || ""}`;
      if (!postGroups[postId]) {
        postGroups[postId] = {
          post_name,
          applied: 0,
          interview_scheduled: 0,
          interviewed: 0,
          offer: 0,
          rejected: 0,
          items: [],
        };
      }

      // Filter by department if specified
      if (department && department !== "All Dept") {
        if (item.application.branch === department) {
          postGroups[postId].items.push(item);
        }
      } else {
        postGroups[postId].items.push(item);
      }
    });

    // Count statuses for each post
    const appliedData = Object.values(postGroups)
      .map((group) => {
        const statusCounts = {
          applied: 0,
          interview_scheduled: 0,
          interviewed: 0,
          offer: 0,
          rejected: 0,
        };

        group.items.forEach((item) => {
          const status = item.application.application_status;
          if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
          }
        });

        // Count offers based on offer_letters table
        statusCounts.offer = group.items.filter((item) => item.offer).length;

        return {
          post_name: group.post_name,
          applied: statusCounts.applied,
          interview_scheduled: statusCounts.interview_scheduled,
          interviewed: statusCounts.interviewed,
          offer: statusCounts.offer,
          rejected: statusCounts.rejected,
        };
      })
      .filter(
        (item) =>
          item.applied > 0 ||
          item.interview_scheduled > 0 ||
          item.interviewed > 0 ||
          item.offer > 0 ||
          item.rejected > 0
      );

    res.json({
      ok: true,
      data: appliedData,
    });
  } catch (error) {
    console.error("Error fetching applied students data:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch applied students data",
    });
  }
});

// Get overall applied students count
router.get("/total-applied", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }
    const department = req.query.department;

    let query = db
      .select({ count: countDistinct(student_applications.student_id) })
      .from(student_applications)
      .innerJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(posts.approval_status, "approved"));

    if (department && department !== "All Dept") {
      query = query.where(eq(student_applications.branch, department));
    }

    const totalApplied = await query;

    res.json({
      ok: true,
      total_applied: parseInt(totalApplied[0]?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching total applied:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch total applied count",
    });
  }
});

// Get top hiring companies based on offer letters issued
router.get("/top-hiring-companies", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const limit = parseInt(req.query.limit) || 3;

    // METHOD 1: Try using offer_letters table (most reliable)
    try {
      const companiesWithOffers = await db
        .select({
          company_name: posts.company_name,
          student_id: student_applications.student_id,
        })
        .from(offer_letters)
        .innerJoin(
          student_applications,
          eq(offer_letters.application_id, student_applications.id)
        )
        .innerJoin(posts, eq(student_applications.post_id, posts.id))
        .where(eq(posts.approval_status, "approved"));

      // Group by company and count unique students
      const companyHires = {};
      companiesWithOffers.forEach((item) => {
        const company = item.company_name;
        if (!companyHires[company]) {
          companyHires[company] = new Set();
        }
        companyHires[company].add(item.student_id);
      });

      // Convert to array and sort by hire count
      const topCompanies = Object.entries(companyHires)
        .map(([name, studentSet]) => ({
          name,
          hire_count: studentSet.size,
        }))
        .sort((a, b) => b.hire_count - a.hire_count)
        .slice(0, limit);

      return res.json({
        ok: true,
        data: topCompanies,
      });
    } catch (offerTableError) {
      console.log("Offer letters table approach failed, trying application status...");
    }

    // METHOD 2: Fallback to application_status (if offer_letters table doesn't work)
    const allApplications = await db
      .select({
        company_name: posts.company_name,
        student_id: student_applications.student_id,
        application_status: student_applications.application_status,
      })
      .from(student_applications)
      .innerJoin(posts, eq(student_applications.post_id, posts.id))
      .where(eq(posts.approval_status, "approved"));

    // Filter for offer statuses (case-insensitive)
    const offerStatuses = ["offer", "OFFER", "offered", "OFFERED", "placed", "PLACED"];
    const applicationsWithOffers = allApplications.filter(app => 
      offerStatuses.includes(app.application_status)
    );

    // Group by company and count unique students
    const companyHires = {};
    applicationsWithOffers.forEach((item) => {
      const company = item.company_name;
      if (!companyHires[company]) {
        companyHires[company] = new Set();
      }
      companyHires[company].add(item.student_id);
    });

    // Convert to array and sort by hire count
    const topCompanies = Object.entries(companyHires)
      .map(([name, studentSet]) => ({
        name,
        hire_count: studentSet.size,
      }))
      .sort((a, b) => b.hire_count - a.hire_count)
      .slice(0, limit);

    res.json({
      ok: true,
      data: topCompanies,
    });
  } catch (error) {
    console.error("Error fetching top hiring companies:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch top hiring companies",
    });
  }
});

export default router;