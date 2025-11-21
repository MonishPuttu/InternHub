import express from "express";
import { db } from "../db/index.js";
import { student_profile, user, education, projects, social_links, report_cards, assessments, student_applications } from "../db/schema/index.js";
import { eq, like, and, sql, exists, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// GET /api/studentdata/students - Fetch all students with optional filters
router.get("/students", requireAuth, async (req, res) => {
    try {
        const { search, department, year, placementStatus } = req.query;

        // Base query joining user, student_profile, and student_applications for placement status
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
                applicationId: student_applications.id,
            })
            .from(student_profile)
            .leftJoin(user, eq(student_profile.user_id, user.id))
            .leftJoin(student_applications, and(
                eq(student_applications.student_id, user.id),
                inArray(student_applications.application_status, ['offer-approved', 'offer_approved', 'offered'])
            ))
            .where(eq(user.role, "student"));

        // Apply search filter if provided
        if (search) {
            query = query.where(
                sql`${student_profile.full_name} LIKE ${`%${search}%`} OR ${user.email} LIKE ${`%${search}%`} OR ${student_profile.branch} LIKE ${`%${search}%`} OR ${student_profile.roll_number} LIKE ${`%${search}%`} OR ${student_profile.student_id} LIKE ${`%${search}%`}`
            );
        }

        // Apply department filter
        if (department) {
            query = query.where(eq(student_profile.branch, department));
        }

        // Apply year filter
        if (year) {
            query = query.where(eq(student_profile.current_semester, parseInt(year)));
        }

        // Apply placement status filter
        if (placementStatus) {
            if (placementStatus === "Placed") {
                query = query.where(sql`${student_applications.id} IS NOT NULL`);
            } else if (placementStatus === "Not Placed") {
                query = query.where(sql`${student_applications.id} IS NULL`);
            }
        }

        const students = await query.orderBy(student_profile.full_name);

        // Process full_name to split into firstName and lastName if needed
        const processedStudents = students.map(student => {
            const nameParts = student.firstName ? student.firstName.split(' ') : ['', ''];
            return {
                ...student,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                placementStatus: student.applicationId ? 'Placed' : 'Not Placed',
            };
        });

        res.json({ ok: true, students: processedStudents });
    } catch (e) {
        console.error("Error fetching student data:", e);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

// GET /api/studentdata/students/:studentId - Fetch detailed student information
router.get("/students/:studentId", requireAuth, async (req, res) => {
    try {
        const { studentId } = req.params;

        // Fetch student profile and user details
        const studentQuery = await db
            .select({
                id: student_profile.id,
                userId: student_profile.user_id,
                fullName: student_profile.full_name,
                email: user.email,
                rollNumber: student_profile.roll_number,
                studentId: student_profile.student_id,
                dateOfBirth: student_profile.date_of_birth,
                gender: student_profile.gender,
                contactNumber: student_profile.contact_number,
                permanentAddress: student_profile.permanent_address,
                currentAddress: student_profile.current_address,
                collegeName: student_profile.college_name,
                profilePicture: student_profile.profile_picture,
                website: student_profile.website,
                linkedin: student_profile.linkedin,
                branch: student_profile.branch,
                currentSemester: student_profile.current_semester,
                cgpa: student_profile.cgpa,
                tenthScore: student_profile.tenth_score,
                twelfthScore: student_profile.twelfth_score,
                coursesCertifications: student_profile.courses_certifications,
                emis: student_profile.emis,
                skills: student_profile.skills,
                extraActivities: student_profile.extra_activities,
                careerPath: student_profile.career_path,
            })
            .from(student_profile)
            .leftJoin(user, eq(student_profile.user_id, user.id))
            .where(eq(student_profile.id, studentId))
            .limit(1);

        if (studentQuery.length === 0) {
            return res.status(404).json({ ok: false, error: "Student not found" });
        }

        const student = studentQuery[0];

        // Fetch report cards for the student
        const reportCardsQuery = await db
            .select({
                id: report_cards.id,
                assessmentTitle: assessments.title,
                overallScore: report_cards.overall_score,
                percentageScore: report_cards.percentage_score,
                grade: report_cards.grade,
                strengths: report_cards.strengths,
                weaknesses: report_cards.weaknesses,
                recommendations: report_cards.recommendations,
                generatedAt: report_cards.generated_at,
            })
            .from(report_cards)
            .leftJoin(assessments, eq(report_cards.assessment_id, assessments.id))
            .where(eq(report_cards.student_id, student.userId))
            .orderBy(report_cards.generated_at);

        // Process report cards
        const reportCards = reportCardsQuery.map(card => ({
            ...card,
            strengths: card.strengths || [],
            weaknesses: card.weaknesses || [],
        }));

        // Fetch education details
        const educationQuery = await db
            .select({
                id: education.id,
                degree: education.degree,
                institution: education.institution,
                fieldOfStudy: education.field_of_study,
                startDate: education.start_date,
                endDate: education.end_date,
                grade: education.grade,
                coursework: education.coursework,
            })
            .from(education)
            .where(eq(education.user_id, student.userId))
            .orderBy(education.start_date);

        // Fetch projects
        const projectsQuery = await db
            .select({
                id: projects.id,
                title: projects.title,
                description: projects.description,
                technologies: projects.technologies,
                projectUrl: projects.project_url,
                startDate: projects.start_date,
                endDate: projects.end_date,
            })
            .from(projects)
            .where(eq(projects.user_id, student.userId))
            .orderBy(projects.start_date);

        // Fetch social links
        const socialLinksQuery = await db
            .select({
                portfolioWebsite: social_links.portfolio_website,
                linkedinProfile: social_links.linkedin_profile,
                githubProfile: social_links.github_profile,
            })
            .from(social_links)
            .where(eq(social_links.user_id, student.userId))
            .limit(1);

        const socialLinks = socialLinksQuery.length > 0 ? socialLinksQuery[0] : {};

        // Compile detailed student data
        const detailedStudent = {
            ...student,
            reportCards,
            education: educationQuery,
            projects: projectsQuery,
            socialLinks,
        };

        res.json({ ok: true, student: detailedStudent });
    } catch (e) {
        console.error("Error fetching detailed student data:", e);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

// PUT /api/studentdata/students/:studentId - Update student details
router.put("/students/:studentId", requireAuth, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { full_name, branch, roll_number, student_id, current_semester, cgpa } = req.body;

        // Check if user is placement_cell
        // if (req.user.role !== "placement_cell") {
        //     return res.status(403).json({ ok: false, error: "Access denied. Only placement cell can edit student data." });
        // }

        // Update student_profile
        const updateData = {};
        if (full_name) updateData.full_name = full_name;
        if (branch) updateData.branch = branch;
        if (roll_number) updateData.roll_number = roll_number;
        if (student_id) updateData.student_id = student_id;
        if (current_semester) updateData.current_semester = parseInt(current_semester);
        if (cgpa) updateData.cgpa = parseFloat(cgpa);

        await db
            .update(student_profile)
            .set(updateData)
            .where(eq(student_profile.id, studentId));

        res.json({ ok: true, message: "Student data updated successfully" });
    } catch (e) {
        console.error("Error updating student data:", e);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

export default router;
