import express from "express";
import { db } from "../db/index.js";
import {
    student_profile,
    user,
    education,
    projects,
    social_links,
    report_cards,
    assessments,
    student_applications,
} from "../db/schema/index.js";
import { offer_letters } from "../db/schema/offers.js";
import { posts } from "../db/schema/post.js";
import { eq, like, and, or } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

const splitName = (fullName) => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.split(" ");
    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
    };
};

const buildStudentFilters = (search, department, year) => {
    const conditions = [eq(user.role, "student")];

    if (search?.trim()) {
        conditions.push(
            or(
                like(student_profile.full_name, `%${search}%`),
                like(user.email, `%${search}%`),
                like(student_profile.branch, `%${search}%`),
                like(student_profile.roll_number, `%${search}%`),
                like(student_profile.student_id, `%${search}%`)
            )
        );
    }

    if (department) {
        conditions.push(eq(student_profile.branch, department));
    }

    if (year) {
        conditions.push(eq(student_profile.current_semester, parseInt(year)));
    }

    return conditions;
};

const getUserIdFromStudentId = async (studentId) => {
    const result = await db
        .select({ userId: student_profile.user_id })
        .from(student_profile)
        .where(eq(student_profile.id, studentId))
        .limit(1);

    return result[0]?.userId || null;
};

const handleError = (res, error, message = "An error occurred") => {
    console.error(`${message}:`, error);
    res.status(500).json({ ok: false, error: String(error) });
};

const attachUserId = async (req, res, next) => {
    try {
        const userId = await getUserIdFromStudentId(req.params.studentId);

        if (!userId) {
            return res.status(404).json({ ok: false, error: "Student not found" });
        }

        req.userId = userId;
        next();
    } catch (error) {
        handleError(res, error, "Error fetching student");
    }
};

const getStudentProfileQuery = (studentId) => {
    return db
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
};

const getEducationData = (userId) => {
    return db
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
        .where(eq(education.user_id, userId))
        .orderBy(education.start_date);
};

const getProjectsData = (userId) => {
    return db
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
        .where(eq(projects.user_id, userId))
        .orderBy(projects.start_date);
};

const getSocialLinksData = async (userId) => {
    const result = await db
        .select({
            portfolioWebsite: social_links.portfolio_website,
            linkedinProfile: social_links.linkedin_profile,
            githubProfile: social_links.github_profile,
        })
        .from(social_links)
        .where(eq(social_links.user_id, userId))
        .limit(1);

    return result[0] || {};
};

const getApplicationsData = (userId) => {
    return db
        .select({
            id: student_applications.id,
            post_id: student_applications.post_id,
            applicationStatus: student_applications.application_status,
            appliedAt: student_applications.applied_at,
            companyName: posts.company_name,
            position: posts.position,
        })
        .from(student_applications)
        .leftJoin(posts, eq(student_applications.post_id, posts.id))
        .where(eq(student_applications.student_id, userId))
        .orderBy(student_applications.applied_at);
};

const getOffersData = (userId) => {
    return db
        .select({
            id: offer_letters.id,
            applicationId: offer_letters.application_id,
            offerStatus: offer_letters.status,
            salaryPackage: offer_letters.salary_package,
            joiningDate: offer_letters.joining_date,
            location: offer_letters.location,
            offerLetterUrl: offer_letters.offer_letter_url,
            fileName: offer_letters.file_name,
            createdAt: offer_letters.created_at,
        })
        .from(offer_letters)
        .where(eq(offer_letters.student_id, userId))
        .orderBy(offer_letters.created_at);
};

const getAssessmentsData = (userId) => {
    return db
        .select({
            id: report_cards.id,
            assessmentId: report_cards.assessment_id,
            title: assessments.title,
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
        .where(eq(report_cards.student_id, userId))
        .orderBy(report_cards.generated_at);
};

// GET /api/studentdata/students - Fetch all students with optional filters
router.get("/students", requireAuth, async (req, res) => {
    try {
        const { search, department, year } = req.query;

        if (!search?.trim() && !department && !year) {
            return res.json({ ok: true, students: [] });
        }

        const whereConditions = buildStudentFilters(search, department, year);

        const students = await db
            .select({
                id: student_profile.id,
                firstName: student_profile.full_name,
                lastName: student_profile.full_name,
                email: user.email,
                department: student_profile.branch,
                registerNumber: student_profile.roll_number,
                rollNumber: student_profile.student_id,
                year: student_profile.current_semester,
                cgpa: student_profile.cgpa,
                careerPath: student_profile.career_path,
            })
            .from(student_profile)
            .leftJoin(user, eq(student_profile.user_id, user.id))
            .where(and(...whereConditions))
            .orderBy(student_profile.full_name);

        const processedStudents = students.map((student) => ({
            ...student,
            ...splitName(student.firstName),
        }));

        res.json({ ok: true, students: processedStudents });
    } catch (error) {
        handleError(res, error, "Error fetching student data");
    }
});

// GET /api/studentdata/students/:studentId - Fetch detailed student information
router.get("/students/:studentId", requireAuth, async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentQuery = await getStudentProfileQuery(studentId);

        if (studentQuery.length === 0) {
            return res.status(404).json({ ok: false, error: "Student not found" });
        }

        const student = studentQuery[0];

        // Fetch all related data in parallel for better performance
        const [educationData, projectsData, socialLinks, applicationsData, offersData] =
            await Promise.all([
                getEducationData(student.userId),
                getProjectsData(student.userId),
                getSocialLinksData(student.userId),
                getApplicationsData(student.userId),
                getOffersData(student.userId),
            ]);

        const detailedStudent = {
            ...student,
            education: educationData,
            projects: projectsData,
            socialLinks,
            applications: applicationsData,
            offers: offersData,
        };

        res.json({ ok: true, student: detailedStudent });
    } catch (error) {
        handleError(res, error, "Error fetching detailed student data");
    }
});

// PUT /api/studentdata/students/:studentId - Update student details
router.put("/students/:studentId", requireAuth, async (req, res) => {
    try {
        const { studentId } = req.params;
        const {
            full_name,
            branch,
            roll_number,
            student_id,
            current_semester,
            cgpa,
            career_path,
        } = req.body;

        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (branch !== undefined) updateData.branch = branch;
        if (roll_number !== undefined) updateData.roll_number = roll_number;
        if (student_id !== undefined) updateData.student_id = student_id;
        if (current_semester !== undefined)
            updateData.current_semester = parseInt(current_semester);
        if (cgpa !== undefined) updateData.cgpa = parseFloat(cgpa);
        if (career_path !== undefined) updateData.career_path = career_path;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ ok: false, error: "No fields to update" });
        }

        await db
            .update(student_profile)
            .set(updateData)
            .where(eq(student_profile.id, studentId));

        res.json({ ok: true, message: "Student data updated successfully" });
    } catch (error) {
        handleError(res, error, "Error updating student data");
    }
});

// POST /api/studentdata/import - Import student data from CSV
router.post("/import", requireAuth, async (req, res) => {
    try {
        const { students } = req.body;

        if (!Array.isArray(students)) {
            return res.status(400).json({
                ok: false,
                error: "Invalid data format. Expected array of students.",
            });
        }

        const uniqueStudents = Array.from(
            new Map(students.map((s) => [s.roll_number, s])).values()
        );

        const results = {
            imported: [],
            skipped: [],
            errors: [],
        };

        for (const studentData of uniqueStudents) {
            try {
                const userResult = await db
                    .select()
                    .from(user)
                    .where(eq(user.email, studentData.email))
                    .limit(1);

                if (userResult.length === 0) {
                    results.skipped.push({
                        student: studentData,
                        reason: "Email not found",
                    });
                    continue;
                }

                const studentProfile = await db
                    .select()
                    .from(student_profile)
                    .where(
                        and(
                            eq(student_profile.user_id, userResult[0].id),
                            eq(student_profile.roll_number, studentData.roll_number)
                        )
                    )
                    .limit(1);

                if (studentProfile.length === 0) {
                    results.skipped.push({
                        student: studentData,
                        reason: "Register number not found for this email",
                    });
                    continue;
                }

                const updatedProfile = await db
                    .update(student_profile)
                    .set({
                        full_name: studentData.full_name,
                        branch: studentData.branch,
                        roll_number: studentData.roll_number,
                        student_id: studentData.student_id,
                        current_semester: studentData.current_semester,
                        cgpa: studentData.cgpa,
                        career_path: studentData.career_path,
                    })
                    .where(eq(student_profile.id, studentProfile[0].id))
                    .returning();

                results.imported.push(updatedProfile[0]);
            } catch (err) {
                results.errors.push({
                    student: studentData,
                    error: err.message,
                });
            }
        }

        res.json({
            ok: true,
            message: `Updated ${results.imported.length} students. ${results.skipped.length} skipped. ${results.errors.length} errors.`,
            updated: results.imported.length,
            skipped: results.skipped.length,
            errors: results.errors.length,
            skippedDetails: results.skipped,
            errorDetails: results.errors,
        });
    } catch (error) {
        handleError(res, error, "Error importing student data");
    }
});

router.get(
    "/students/:studentId/assessments",
    requireAuth,
    attachUserId,
    async (req, res) => {
        try {
            const assessments = await getAssessmentsData(req.userId);
            res.json({ ok: true, assessments });
        } catch (error) {
            handleError(res, error, "Error fetching assessment history");
        }
    }
);

router.get(
    "/students/:studentId/projects",
    requireAuth,
    attachUserId,
    async (req, res) => {
        try {
            const projects = await getProjectsData(req.userId);
            res.json({ ok: true, projects });
        } catch (error) {
            handleError(res, error, "Error fetching projects data");
        }
    }
);

router.get(
    "/students/:studentId/education",
    requireAuth,
    attachUserId,
    async (req, res) => {
        try {
            const education = await getEducationData(req.userId);
            res.json({ ok: true, education });
        } catch (error) {
            handleError(res, error, "Error fetching education data");
        }
    }
);

router.get(
    "/students/:studentId/social-links",
    requireAuth,
    attachUserId,
    async (req, res) => {
        try {
            const socialLinks = await getSocialLinksData(req.userId);
            res.json({ ok: true, socialLinks });
        } catch (error) {
            handleError(res, error, "Error fetching social links");
        }
    }
);

export default router;