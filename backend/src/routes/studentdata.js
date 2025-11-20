import express from "express";
import { db } from "../db/index.js";
import { student_profile, user, education, projects, social_links, report_cards, assessments } from "../db/schema/index.js";
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

export default router;
