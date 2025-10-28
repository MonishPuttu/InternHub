import { db } from "../db/index.js";
import {
    department_strength,
    department_applications,
    placement_statistics
} from "../db/schema/placement_analytics.js";

async function seedAnalyticsData() {
    try {
        console.log("🌱 Starting to seed placement analytics data...");

        const year = "2024-2025";

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

        console.log("📊 Seeding department strength data...");
        for (const dept of strengthData) {
            await db.insert(department_strength).values({
                department: dept.department,
                total_students: dept.total_students,
                year: year
            });
            console.log(`✓ Added ${dept.department}: ${dept.total_students} students`);
        }

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

        console.log("📈 Seeding application data...");
        for (const app of applicationData) {
            await db.insert(department_applications).values({
                department: app.department,
                total_applied: app.total_applied,
                total_not_applied: app.total_not_applied,
                post_id: null
            });
            console.log(`✓ ${app.department}: ${app.total_applied} applied, ${app.total_not_applied} not applied`);
        }

        console.log("📊 Seeding overall statistics...");
        await db.insert(placement_statistics).values({
            total_students: 700,
            total_placed: 536,
            total_companies: 45,
            highest_package: 45,
            average_package: 12,
            year: year
        });
        console.log("✓ Added overall placement statistics");

        console.log("✅ Successfully seeded all placement analytics data!");

    } catch (error) {
        console.error("❌ Error seeding data:", error);
        throw error;
    }
}

seedAnalyticsData()
    .then(() => {
        console.log("\n🎉 Seeding completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Seeding failed:", error);
        process.exit(1);
    });