import express from "express";
import { db } from "../db/index.js";

import { eq, count, sum, sql, countDistinct, and } from "drizzle-orm";
import { student_applications, posts, user, offer_letters } from "../db/schema/index.js";

const router = express.Router();

// Get overall placement statistics
router.get("/statistics", async (req, res) => {
    try {
        // Get total unique students who have applied
        const totalStudentsResult = await db
            .select({ count: countDistinct(student_applications.student_id) })
            .from(student_applications)
            .innerJoin(posts, eq(student_applications.post_id, posts.id))
            .where(eq(posts.approval_status, "approved"));

        // Get total students who received offers (placed)
        const totalPlacedResult = await db
            .select({ count: countDistinct(student_applications.student_id) })
            .from(student_applications)
            .innerJoin(posts, eq(student_applications.post_id, posts.id))
            .where(
                and(
                    eq(posts.approval_status, "approved"),
                    eq(student_applications.application_status, "offer")
                )
            );

        // Get total approved companies
        const totalCompaniesResult = await db
            .select({ count: countDistinct(posts.user_id) })
            .from(posts)
            .where(eq(posts.approval_status, "approved"));

        // Get highest package from approved posts
        const highestPackageResult = await db
            .select({ max: sql`MAX(${posts.package_offered})` })
            .from(posts)
            .where(eq(posts.approval_status, "approved"));

        // Calculate average package
        const averagePackageResult = await db
            .select({ avg: sql`AVG(${posts.package_offered})` })
            .from(posts)
            .where(eq(posts.approval_status, "approved"));

        const total_students = parseInt(totalStudentsResult[0]?.count || 0);
        const total_placed = parseInt(totalPlacedResult[0]?.count || 0);
        const total_companies = parseInt(totalCompaniesResult[0]?.count || 0);
        const highest_package = parseFloat(highestPackageResult[0]?.max || 0);
        const average_package = parseFloat(averagePackageResult[0]?.avg || 0);

        res.json({
            ok: true,
            data: {
                total_students,
                total_placed,
                total_companies,
                highest_package,
                average_package
            }
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch placement statistics"
        });
    }
});

// Get applied students data for stacked horizontal bar chart
router.get("/applied-students", async (req, res) => {
    try {
        const department = req.query.department;

        // Get all applications with approved posts and offer details
        const applicationsWithPosts = await db
            .select({
                application: student_applications,
                post: posts,
                offer: offer_letters
            })
            .from(student_applications)
            .leftJoin(posts, eq(student_applications.post_id, posts.id))
            .leftJoin(offer_letters, eq(student_applications.id, offer_letters.application_id))
            .where(eq(posts.approval_status, "approved"));

        // Group by post
        const postGroups = {};
        applicationsWithPosts.forEach(item => {
            if (!item.post) return;

            const postId = item.post.id;
            if (!postGroups[postId]) {
                postGroups[postId] = {
                    post_name: `${item.post.company_name} - ${item.post.position}`,
                    applied: 0,
                    interview_scheduled: 0,
                    interviewed: 0,
                    offer: 0,
                    rejected: 0,
                    items: []
                };
            }

            // Filter by department if specified
            if (department && department !== "All Departments") {
                if (item.application.branch === department) {
                    postGroups[postId].items.push(item);
                }
            } else {
                postGroups[postId].items.push(item);
            }
        });

        // Count statuses for each post
        const appliedData = Object.values(postGroups).map(group => {
            const statusCounts = {
                applied: 0,
                interview_scheduled: 0,
                interviewed: 0,
                offer: 0,
                rejected: 0
            };

            group.items.forEach(item => {
                const status = item.application.application_status;
                if (statusCounts.hasOwnProperty(status)) {
                    statusCounts[status]++;
                }
            });

            // Count offers based on offer_letters table
            statusCounts.offer = group.items.filter(item => item.offer).length;

            return {
                post_name: group.post_name,
                applied: statusCounts.applied,
                interview_scheduled: statusCounts.interview_scheduled,
                interviewed: statusCounts.interviewed,
                offer: statusCounts.offer,
                rejected: statusCounts.rejected
            };
        }).filter(item => item.applied > 0 || item.interview_scheduled > 0 || item.interviewed > 0 || item.offer > 0 || item.rejected > 0);

        res.json({
            ok: true,
            data: appliedData
        });
    } catch (error) {
        console.error("Error fetching applied students data:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch applied students data"
        });
    }
});

// Get overall applied students count
router.get("/total-applied", async (req, res) => {
    try {
        const department = req.query.department;

        let query = db
            .select({ count: countDistinct(student_applications.student_id) })
            .from(student_applications)
            .innerJoin(posts, eq(student_applications.post_id, posts.id))
            .where(eq(posts.approval_status, "approved"));

        if (department && department !== "All Departments") {
            query = query.where(eq(student_applications.branch, department));
        }

        const totalApplied = await query;

        res.json({
            ok: true,
            total_applied: totalApplied[0].count
        });
    } catch (error) {
        console.error("Error fetching total applied:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch total applied count"
        });
    }
});



export default router;
