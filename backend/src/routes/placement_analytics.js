import express from "express";
import { db } from "../db/index.js";
import {
    department_strength,
    department_applications,
    placement_statistics
} from "../db/schema/placement_analytics.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// Get department strength data
router.get("/department-strength", async (req, res) => {
    try {
        const year = req.query.year || "2024-2025";

        const strengthData = await db
            .select()
            .from(department_strength)
            .where(eq(department_strength.year, year));

        res.json({
            ok: true,
            data: strengthData,
            year: year
        });
    } catch (error) {
        console.error("Error fetching department strength:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch department strength data"
        });
    }
});

// Get application analytics by department
router.get("/department-applications", async (req, res) => {
    try {
        const postId = req.query.postId;

        let query = db.select().from(department_applications);

        if (postId) {
            query = query.where(eq(department_applications.post_id, postId));
        }

        const applicationData = await query;

        // Group by department and aggregate
        const aggregated = applicationData.reduce((acc, curr) => {
            const dept = curr.department;
            if (!acc[dept]) {
                acc[dept] = {
                    department: dept,
                    total_applied: 0,
                    total_not_applied: 0
                };
            }
            acc[dept].total_applied += curr.total_applied;
            acc[dept].total_not_applied += curr.total_not_applied;
            return acc;
        }, {});

        res.json({
            ok: true,
            data: Object.values(aggregated)
        });
    } catch (error) {
        console.error("Error fetching department applications:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch application analytics"
        });
    }
});

// Get overall placement statistics
router.get("/statistics", async (req, res) => {
    try {
        const year = req.query.year || "2024-2025";

        const stats = await db
            .select()
            .from(placement_statistics)
            .where(eq(placement_statistics.year, year))
            .limit(1);

        res.json({
            ok: true,
            data: stats[0] || {
                total_students: 0,
                total_placed: 0,
                total_companies: 0,
                highest_package: 0,
                average_package: 0
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

// Seed fake data for testing
router.post("/seed-data", async (req, res) => {
    try {
        const year = "2024-2025";

        // Seed department strength
        const strengthData = [
            { department: "ECE", total_students: 60 },
            { department: "CSE", total_students: 120 },
            { department: "IT", total_students: 90 },
            { department: "AIML", total_students: 60 },
            { department: "AIDS", total_students: 60 },
            { department: "MECH", total_students: 80 },
            { department: "CSBS", total_students: 60 },
            { department: "CIVIL", total_students: 70 },
            { department: "EEE", total_students: 50 },
            { department: "EIE", total_students: 50 }
        ];

        for (const dept of strengthData) {
            await db
                .insert(department_strength)
                .values({
                    department: dept.department,
                    total_students: dept.total_students,
                    year: year
                })
                .onConflictDoNothing();
        }

        // Seed application data
        const applicationData = [
            { department: "ECE", total_applied: 45, total_not_applied: 15 },
            { department: "CSE", total_applied: 100, total_not_applied: 20 },
            { department: "IT", total_applied: 75, total_not_applied: 15 },
            { department: "AIML", total_applied: 50, total_not_applied: 10 },
            { department: "AIDS", total_applied: 48, total_not_applied: 12 },
            { department: "MECH", total_applied: 55, total_not_applied: 25 },
            { department: "CSBS", total_applied: 50, total_not_applied: 10 },
            { department: "CIVIL", total_applied: 40, total_not_applied: 30 },
            { department: "EEE", total_applied: 35, total_not_applied: 15 },
            { department: "EIE", total_applied: 38, total_not_applied: 12 }
        ];

        for (const app of applicationData) {
            await db.insert(department_applications).values({
                department: app.department,
                total_applied: app.total_applied,
                total_not_applied: app.total_not_applied,
                post_id: null
            });
        }

        // Seed overall statistics
        await db.insert(placement_statistics).values({
            total_students: 700,
            total_placed: 536,
            total_companies: 45,
            highest_package: 45,
            average_package: 12,
            year: year
        });

        res.json({
            ok: true,
            message: "Fake data seeded successfully"
        });
    } catch (error) {
        console.error("Error seeding data:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to seed fake data"
        });
    }
});

router.get('/', (req, res) => {
    res.json({ message: 'Placement analytics endpoint' });
});


export default router;
