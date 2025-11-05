import express from "express";
import { db } from "../db/index.js";
import {
  assessments,
  questions,
  student_attempts,
  student_answers,
  leaderboard,
  report_cards,
  user,
  student_profile,
} from "../db/schema/index.js";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();

// ============ PLACEMENT CELL ENDPOINTS ============

// Create new assessment
router.post("/assessments", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const {
      title,
      description,
      type,
      duration,
      totalMarks,
      passingMarks,
      startDate,
      endDate,
      allowedBranches,
      questions: questionsList,
    } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        ok: false,
        error: "Title, start date, and end date are required",
      });
    }

    if (!allowedBranches || allowedBranches.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "At least one department must be selected",
      });
    }

    if (!questionsList || questionsList.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "At least one question is required",
      });
    }

    // Create assessment
    const [newAssessment] = await db
      .insert(assessments)
      .values({
        title,
        description,
        type,
        duration,
        total_marks: totalMarks,
        passing_marks: passingMarks,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        created_by: req.user.id,
        is_active: true,
        allowed_branches: allowedBranches,
      })
      .returning();

    // Add questions
    const questionsToInsert = questionsList.map((q, index) => ({
      assessment_id: newAssessment.id,
      question_text: q.questionText,
      question_type: q.questionType,
      options: q.options,
      correct_answer: q.correctAnswer,
      marks: q.marks,
      difficulty: q.difficulty,
      tags: q.tags || [],
      order_index: index + 1,
    }));

    await db.insert(questions).values(questionsToInsert);

    res.status(201).json({
      ok: true,
      message: "Assessment created successfully",
      data: newAssessment,
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to create assessment",
      details: error.message,
    });
  }
});

// Get all assessments (Placement Cell) - Return only assessments created by this placement cell user
router.get("/assessments", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const allAssessments = await db
      .select({
        id: assessments.id,
        title: assessments.title,
        description: assessments.description,
        type: assessments.type,
        duration: assessments.duration,
        totalMarks: assessments.total_marks,
        passingMarks: assessments.passing_marks,
        startDate: assessments.start_date,
        endDate: assessments.end_date,
        isActive: assessments.is_active,
        allowedBranches: assessments.allowed_branches,
        createdBy: assessments.created_by,
        createdAt: assessments.created_at,
      })
      .from(assessments)
      .where(eq(assessments.created_by, req.user.id))
      .orderBy(desc(assessments.created_at));

    res.json({ ok: true, data: allAssessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch assessments" });
  }
});

// Get assessment by ID with questions
router.get("/assessments/:assessmentId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const { assessmentId } = req.params;

    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);

    if (!assessment) {
      return res.status(404).json({ ok: false, error: "Assessment not found" });
    }

    const assessmentQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.assessment_id, assessmentId))
      .orderBy(questions.order_index);

    res.json({
      ok: true,
      data: {
        assessment,
        questions: assessmentQuestions,
      },
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch assessment" });
  }
});

// Get leaderboard for specific assessment
router.get(
  "/assessments/:assessmentId/leaderboard",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "placement") {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      const { assessmentId } = req.params;

      const leaderboardData = await db
        .select({
          rank: leaderboard.rank,
          studentId: leaderboard.student_id,
          studentName: student_profile.full_name,
          email: user.email,
          rollNumber: student_profile.roll_number,
          totalScore: leaderboard.total_score,
          percentageScore: leaderboard.percentage_score,
          timeTaken: leaderboard.time_taken,
          attemptDate: leaderboard.attempt_date,
        })
        .from(leaderboard)
        .innerJoin(user, eq(leaderboard.student_id, user.id))
        .innerJoin(student_profile, eq(user.id, student_profile.user_id))
        .where(eq(leaderboard.assessment_id, assessmentId))
        .orderBy(leaderboard.rank);

      res.json({ ok: true, data: leaderboardData });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ ok: false, error: "Failed to fetch leaderboard" });
    }
  }
);

// Get student details
router.get("/students/:studentId/details", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ ok: false, error: "Student ID required" });
    }

    const profileResult = await db
      .select()
      .from(student_profile)
      .where(eq(student_profile.user_id, studentId));

    if (!profileResult || profileResult.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Student profile not found" });
    }

    const studentProfileData = profileResult[0];

    const userResult = await db
      .select()
      .from(user)
      .where(eq(user.id, studentId));

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const userData = userResult[0];

    const profile = {
      userId: studentProfileData.user_id,
      fullName: studentProfileData.full_name,
      rollNumber: studentProfileData.roll_number,
      branch: studentProfileData.branch || "N/A",
      email: userData.email || "N/A",
      phone: studentProfileData.contact_number || "N/A",
      cgpa: studentProfileData.cgpa || "N/A",
      tenthScore: studentProfileData.tenth_score || "N/A",
      twelfthScore: studentProfileData.twelfth_score || "N/A",
      currentSemester: studentProfileData.current_semester || "N/A",
    };

    const attempts = await db
      .select({
        assessmentTitle: assessments.title,
        score: student_attempts.total_score,
        percentage: student_attempts.percentage_score,
        attemptDate: student_attempts.created_at,
        status: student_attempts.status,
      })
      .from(student_attempts)
      .innerJoin(
        assessments,
        eq(student_attempts.assessment_id, assessments.id)
      )
      .where(eq(student_attempts.student_id, studentId))
      .orderBy(desc(student_attempts.created_at));

    res.json({
      ok: true,
      data: {
        profile,
        assessmentHistory: attempts || [],
      },
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch student details",
      details: error.message,
    });
  }
});

// Delete assessment
router.delete("/assessments/:assessmentId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const { assessmentId } = req.params;

    const [existingAssessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);

    if (!existingAssessment) {
      return res.status(404).json({ ok: false, error: "Assessment not found" });
    }

    // Verify ownership
    if (existingAssessment.created_by !== req.user.id) {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    // Delete in order to maintain referential integrity
    await db.delete(student_answers).where(
      sql`attempt_id IN (
          SELECT id FROM student_attempts 
          WHERE assessment_id = ${assessmentId}
        )`
    );

    await db
      .delete(report_cards)
      .where(eq(report_cards.assessment_id, assessmentId));

    await db
      .delete(student_attempts)
      .where(eq(student_attempts.assessment_id, assessmentId));

    await db
      .delete(leaderboard)
      .where(eq(leaderboard.assessment_id, assessmentId));

    await db.delete(questions).where(eq(questions.assessment_id, assessmentId));

    await db.delete(assessments).where(eq(assessments.id, assessmentId));

    res.json({
      ok: true,
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to delete assessment",
      details: error.message,
    });
  }
});

// ============ STUDENT ENDPOINTS ============

// Get available assessments for student
router.get("/student/assessments", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const [studentProfile] = await db
      .select({ branch: student_profile.branch })
      .from(student_profile)
      .where(eq(student_profile.user_id, req.user.id))
      .limit(1);

    if (!studentProfile) {
      return res.status(400).json({
        ok: false,
        error: "Student profile not found. Please complete your profile.",
      });
    }

    if (!studentProfile.branch) {
      return res.status(400).json({
        ok: false,
        error:
          "Branch not set. Please update your profile with your department.",
      });
    }

    const studentBranch = studentProfile.branch;
    const currentDate = new Date();

    const allAssessments = await db
      .select({
        id: assessments.id,
        title: assessments.title,
        description: assessments.description,
        type: assessments.type,
        duration: assessments.duration,
        totalMarks: assessments.total_marks,
        passingMarks: assessments.passing_marks,
        startDate: assessments.start_date,
        endDate: assessments.end_date,
        allowedBranches: assessments.allowed_branches,
      })
      .from(assessments)
      .where(
        and(
          eq(assessments.is_active, true),
          lte(assessments.start_date, currentDate),
          gte(assessments.end_date, currentDate)
        )
      )
      .orderBy(assessments.start_date);

    const availableAssessments = allAssessments.filter((assessment) => {
      const allowedBranches = assessment.allowedBranches || [];
      return (
        Array.isArray(allowedBranches) &&
        allowedBranches.includes(studentBranch)
      );
    });

    const attemptedAssessmentIds = await db
      .select({ assessmentId: student_attempts.assessment_id })
      .from(student_attempts)
      .where(
        and(
          eq(student_attempts.student_id, req.user.id),
          eq(student_attempts.status, "completed")
        )
      );

    const attemptedIds = new Set(
      attemptedAssessmentIds.map((a) => a.assessmentId)
    );

    const assessmentsWithStatus = availableAssessments.map((assessment) => ({
      ...assessment,
      isAttempted: attemptedIds.has(assessment.id),
    }));

    res.json({ ok: true, data: assessmentsWithStatus });
  } catch (error) {
    console.error("Error fetching student assessments:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch assessments" });
  }
});

// Start assessment attempt
router.post(
  "/student/assessments/:assessmentId/start",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      const { assessmentId } = req.params;
      const studentId = req.user.id;

      const [assessment] = await db
        .select()
        .from(assessments)
        .where(eq(assessments.id, assessmentId))
        .limit(1);

      if (!assessment) {
        return res
          .status(404)
          .json({ ok: false, error: "Assessment not found" });
      }

      const [studentProfile] = await db
        .select({ branch: student_profile.branch })
        .from(student_profile)
        .where(eq(student_profile.user_id, studentId))
        .limit(1);

      if (studentProfile && studentProfile.branch) {
        const allowedBranches = assessment.allowed_branches || [];
        if (
          !Array.isArray(allowedBranches) ||
          !allowedBranches.includes(studentProfile.branch)
        ) {
          return res.status(403).json({
            ok: false,
            error: "This assessment is not available for your department",
          });
        }
      }

      // Check if already completed
      const [existingAttempt] = await db
        .select()
        .from(student_attempts)
        .where(
          and(
            eq(student_attempts.student_id, studentId),
            eq(student_attempts.assessment_id, assessmentId),
            eq(student_attempts.status, "completed")
          )
        )
        .limit(1);

      if (existingAttempt) {
        return res
          .status(400)
          .json({ ok: false, error: "Assessment already completed" });
      }

      // Check for in-progress attempt
      const [inProgressAttempt] = await db
        .select()
        .from(student_attempts)
        .where(
          and(
            eq(student_attempts.student_id, studentId),
            eq(student_attempts.assessment_id, assessmentId),
            eq(student_attempts.status, "in_progress")
          )
        )
        .limit(1);

      if (inProgressAttempt) {
        const assessmentQuestions = await db
          .select({
            id: questions.id,
            questionText: questions.question_text,
            questionType: questions.question_type,
            options: questions.options,
            marks: questions.marks,
            orderIndex: questions.order_index,
          })
          .from(questions)
          .where(eq(questions.assessment_id, assessmentId))
          .orderBy(questions.order_index);

        return res.json({
          ok: true,
          data: {
            attempt: {
              ...inProgressAttempt,
              duration: assessment.duration,
            },
            questions: assessmentQuestions,
          },
        });
      }

      // Create new attempt
      const [newAttempt] = await db
        .insert(student_attempts)
        .values({
          student_id: studentId,
          assessment_id: assessmentId,
          start_time: new Date(),
          status: "in_progress",
        })
        .returning();

      const assessmentQuestions = await db
        .select({
          id: questions.id,
          questionText: questions.question_text,
          questionType: questions.question_type,
          options: questions.options,
          marks: questions.marks,
          orderIndex: questions.order_index,
        })
        .from(questions)
        .where(eq(questions.assessment_id, assessmentId))
        .orderBy(questions.order_index);

      res.status(201).json({
        ok: true,
        data: {
          attempt: {
            ...newAttempt,
            duration: assessment.duration,
          },
          questions: assessmentQuestions,
        },
      });
    } catch (error) {
      console.error("Error starting assessment:", error);
      res.status(500).json({ ok: false, error: "Failed to start assessment" });
    }
  }
);

// Save answer
router.post(
  "/student/attempts/:attemptId/answers",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      const { attemptId } = req.params;
      const { questionId, answer, timeTaken } = req.body;

      const [existingAnswer] = await db
        .select()
        .from(student_answers)
        .where(
          and(
            eq(student_answers.attempt_id, attemptId),
            eq(student_answers.question_id, questionId)
          )
        )
        .limit(1);

      if (existingAnswer) {
        await db
          .update(student_answers)
          .set({ answer, time_taken: timeTaken, updated_at: new Date() })
          .where(eq(student_answers.id, existingAnswer.id));
      } else {
        await db.insert(student_answers).values({
          attempt_id: attemptId,
          question_id: questionId,
          answer,
          time_taken: timeTaken,
        });
      }

      res.json({ ok: true, message: "Answer saved successfully" });
    } catch (error) {
      console.error("Error saving answer:", error);
      res.status(500).json({ ok: false, error: "Failed to save answer" });
    }
  }
);

// Submit assessment
router.post(
  "/student/attempts/:attemptId/submit",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      const { attemptId } = req.params;

      const [attempt] = await db
        .select()
        .from(student_attempts)
        .where(eq(student_attempts.id, attemptId))
        .limit(1);

      if (!attempt) {
        return res.status(404).json({ ok: false, error: "Attempt not found" });
      }

      const questionsWithAnswers = await db
        .select({
          questionId: questions.id,
          correctAnswer: questions.correct_answer,
          questionType: questions.question_type,
          marks: questions.marks,
          tags: questions.tags,
          studentAnswer: student_answers.answer,
          answerId: student_answers.id,
        })
        .from(questions)
        .leftJoin(
          student_answers,
          and(
            eq(student_answers.question_id, questions.id),
            eq(student_answers.attempt_id, attemptId)
          )
        )
        .where(eq(questions.assessment_id, attempt.assessment_id));

      // Auto-evaluate answers
      let totalScore = 0;
      for (const q of questionsWithAnswers) {
        if (q.answerId && q.studentAnswer) {
          const correctAnswerArray = Array.isArray(q.correctAnswer)
            ? q.correctAnswer.map(String)
            : [String(q.correctAnswer)];

          const studentAnswerArray = Array.isArray(q.studentAnswer)
            ? q.studentAnswer.map(String)
            : [String(q.studentAnswer)];

          const sortedCorrect = correctAnswerArray.sort();
          const sortedStudent = studentAnswerArray.sort();

          const isCorrect =
            sortedCorrect.length === sortedStudent.length &&
            sortedCorrect.every((val, idx) => val === sortedStudent[idx]);

          const marksAwarded = isCorrect ? q.marks : 0;
          totalScore += marksAwarded;

          await db
            .update(student_answers)
            .set({
              is_correct: isCorrect,
              marks_awarded: marksAwarded,
            })
            .where(eq(student_answers.id, q.answerId));
        }
      }

      const [assessment] = await db
        .select()
        .from(assessments)
        .where(eq(assessments.id, attempt.assessment_id))
        .limit(1);

      const percentageScore = Math.round(
        (totalScore / assessment.total_marks) * 100
      );
      const timeTaken = Math.round(
        (new Date() - new Date(attempt.start_time)) / 60000
      );

      await db
        .update(student_attempts)
        .set({
          end_time: new Date(),
          status: "completed",
          total_score: totalScore,
          percentage_score: percentageScore,
          time_taken: timeTaken,
          is_evaluated: true,
        })
        .where(eq(student_attempts.id, attemptId));

      await updateLeaderboard(attempt.assessment_id);

      await generateReportCard(
        attemptId,
        attempt.student_id,
        attempt.assessment_id,
        questionsWithAnswers
      );

      res.json({
        ok: true,
        message: "Assessment submitted successfully",
        data: { totalScore, percentageScore },
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      res.status(500).json({ ok: false, error: "Failed to submit assessment" });
    }
  }
);

// Get report card
router.get(
  "/student/report-cards/:attemptId",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      const { attemptId } = req.params;

      const [reportCard] = await db
        .select({
          id: report_cards.id,
          assessmentTitle: assessments.title,
          overallScore: report_cards.overall_score,
          percentageScore: report_cards.percentage_score,
          grade: report_cards.grade,
          strengths: report_cards.strengths,
          weaknesses: report_cards.weaknesses,
          recommendations: report_cards.recommendations,
          detailedAnalysis: report_cards.detailed_analysis,
          generatedAt: report_cards.generated_at,
        })
        .from(report_cards)
        .innerJoin(assessments, eq(report_cards.assessment_id, assessments.id))
        .where(
          and(
            eq(report_cards.attempt_id, attemptId),
            eq(report_cards.student_id, req.user.id)
          )
        )
        .limit(1);

      if (!reportCard) {
        return res
          .status(404)
          .json({ ok: false, error: "Report card not found" });
      }

      res.json({ ok: true, data: reportCard });
    } catch (error) {
      console.error("Error fetching report card:", error);
      res.status(500).json({ ok: false, error: "Failed to fetch report card" });
    }
  }
);

// Get all report cards for student
router.get("/student/report-cards", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const reportCards = await db
      .select({
        id: report_cards.id,
        attemptId: report_cards.attempt_id,
        assessmentTitle: assessments.title,
        assessmentType: assessments.type,
        overallScore: report_cards.overall_score,
        percentageScore: report_cards.percentage_score,
        grade: report_cards.grade,
        generatedAt: report_cards.generated_at,
      })
      .from(report_cards)
      .innerJoin(assessments, eq(report_cards.assessment_id, assessments.id))
      .where(eq(report_cards.student_id, req.user.id))
      .orderBy(desc(report_cards.generated_at));

    res.json({ ok: true, data: reportCards });
  } catch (error) {
    console.error("Error fetching report cards:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch report cards" });
  }
});

// Helper function to update leaderboard
async function updateLeaderboard(assessmentId) {
  try {
    const attempts = await db
      .select()
      .from(student_attempts)
      .where(
        and(
          eq(student_attempts.assessment_id, assessmentId),
          eq(student_attempts.status, "completed")
        )
      )
      .orderBy(desc(student_attempts.total_score), student_attempts.time_taken);

    if (!attempts || attempts.length === 0) {
      return;
    }

    await db
      .delete(leaderboard)
      .where(eq(leaderboard.assessment_id, assessmentId));

    const leaderboardEntries = attempts.map((attempt, index) => ({
      student_id: attempt.student_id,
      assessment_id: attempt.assessment_id,
      rank: index + 1,
      total_score: attempt.total_score,
      percentage_score: attempt.percentage_score,
      time_taken: attempt.time_taken,
      attempt_date: attempt.end_time,
    }));

    await db.insert(leaderboard).values(leaderboardEntries);
  } catch (error) {
    console.error("Error updating leaderboard:", error);
  }
}

async function generateReportCard(
  attemptId,
  studentId,
  assessmentId,
  questionsWithAnswers
) {
  try {
    const [attempt] = await db
      .select()
      .from(student_attempts)
      .where(eq(student_attempts.id, attemptId))
      .limit(1);

    const percentage = attempt.percentage_score;
    let grade;
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else grade = "F";

    const tagPerformance = {};

    questionsWithAnswers.forEach((q) => {
      if (q.tags && q.answerId) {
        q.tags.forEach((tag) => {
          if (!tagPerformance[tag]) {
            tagPerformance[tag] = { total: 0, correct: 0, marks: 0, earned: 0 };
          }
          tagPerformance[tag].total++;
          tagPerformance[tag].marks += q.marks;

          if (q.studentAnswer) {
            // ✅ FIXED: Use same comparison logic as submit endpoint
            const correctAnswerArray = Array.isArray(q.correctAnswer)
              ? q.correctAnswer.map(String)
              : [String(q.correctAnswer)];

            const studentAnswerArray = Array.isArray(q.studentAnswer)
              ? q.studentAnswer.map(String)
              : [String(q.studentAnswer)];

            const sortedCorrect = correctAnswerArray.sort();
            const sortedStudent = studentAnswerArray.sort();

            const isCorrect =
              sortedCorrect.length === sortedStudent.length &&
              sortedCorrect.every((val, idx) => val === sortedStudent[idx]);

            if (isCorrect) {
              tagPerformance[tag].correct++;
              tagPerformance[tag].earned += q.marks;
            }
          }
        });
      }
    });

    const strengths = [];
    const weaknesses = [];

    Object.entries(tagPerformance).forEach(([tag, perf]) => {
      const successRate = (perf.earned / perf.marks) * 100;
      if (successRate >= 75) {
        strengths.push(tag);
      } else if (successRate < 50) {
        weaknesses.push(tag);
      }
    });

    const recommendations =
      weaknesses.length > 0
        ? `Focus on improving: ${weaknesses.join(
            ", "
          )}. Practice more problems in these areas.`
        : "Great performance! Continue practicing to maintain your level.";

    await db.insert(report_cards).values({
      student_id: studentId,
      attempt_id: attemptId,
      assessment_id: assessmentId,
      overall_score: attempt.total_score,
      percentage_score: attempt.percentage_score,
      grade,
      strengths,
      weaknesses,
      recommendations,
      detailed_analysis: tagPerformance,
    });
  } catch (error) {
    console.error("Error generating report card:", error);
  }
}

// Get attempt details by ID
router.get("/student/attempts/:attemptId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const { attemptId } = req.params;

    const [attempt] = await db
      .select()
      .from(student_attempts)
      .where(
        and(
          eq(student_attempts.id, attemptId),
          eq(student_attempts.student_id, req.user.id)
        )
      )
      .limit(1);

    if (!attempt) {
      return res.status(404).json({ ok: false, error: "Attempt not found" });
    }

    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, attempt.assessment_id))
      .limit(1);

    res.json({
      ok: true,
      data: {
        ...attempt,
        duration: assessment.duration,
      },
    });
  } catch (error) {
    console.error("Error fetching attempt:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch attempt" });
  }
});

// Get questions for an assessment
router.get(
  "/student/assessments/:assessmentId/questions",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      const { assessmentId } = req.params;

      if (!assessmentId || assessmentId === "undefined") {
        return res
          .status(400)
          .json({ ok: false, error: "Assessment ID is required" });
      }

      const assessmentQuestions = await db
        .select({
          id: questions.id,
          questionText: questions.question_text,
          questionType: questions.question_type,
          options: questions.options,
          marks: questions.marks,
          orderIndex: questions.order_index,
        })
        .from(questions)
        .where(eq(questions.assessment_id, assessmentId))
        .orderBy(questions.order_index);

      if (!assessmentQuestions || assessmentQuestions.length === 0) {
        return res.status(404).json({ ok: false, error: "No questions found" });
      }

      res.json({
        ok: true,
        data: {
          questions: assessmentQuestions,
        },
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ ok: false, error: "Failed to fetch questions" });
    }
  }
);

export default router;
