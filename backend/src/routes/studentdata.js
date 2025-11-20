import express from "express";
import { db } from "../db/index.js";
import { student_profile, user } from "../db/schema/index.js";
import { eq, like, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// GET /api/studentdata/students - Fetch all students with optional filters
router.get("/students", requireAuth, async (req, res) => {
    try {
        const { registerNumber, department } = req.query;

        // Base query joining user and student_profile
        let query = db
            .select({
                id: student_profile.id,
                firstName: student_profile.full_name, // Assuming full_name is "First Last", but need to split if necessary
                lastName: student_profile.full_name, // Placeholder, adjust if full_name is single field
                email: user.email,
                department: student_profile.branch,
                registerNumber: student_profile.roll_number,
                rollNumber: student_profile.student_id,
                year: student_profile.current_semester,
                cgpa: student_profile.cgpa,
                placementStatus: sql`CASE WHEN EXISTS (SELECT 1 FROM student_applications WHERE student_applications.student_id = ${user.id} AND student_applications.application_status IN ('offer-approved', 'offer_approved', 'offered')) THEN 'Placed' ELSE 'Not Placed' END`,
            })
            .from(student_profile)
            .leftJoin(user, eq(student_profile.user_id, user.id))
            .where(eq(user.role, "student"));

        // Apply filters if provided
        if (registerNumber) {
            query = query.where(like(student_profile.roll_number, `%${registerNumber}%`));
        }
        if (department) {
            query = query.where(like(student_profile.branch, `%${department}%`));
        }

        const students = await query;

        // Process full_name to split into firstName and lastName if needed
        const processedStudents = students.map(student => {
            const nameParts = student.firstName ? student.firstName.split(' ') : ['', ''];
            return {
                ...student,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
            };
        });

        res.json({ ok: true, students: processedStudents });
    } catch (e) {
        console.error("Error fetching student data:", e);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

export default router;
