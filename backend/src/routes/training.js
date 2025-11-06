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
import { v4 as uuidv4 } from "uuid";
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

// Get all assessments - fix categorization
router.get("/assessments", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const currentDate = new Date();

    const allAssessments = await db
      .select()
      .from(assessments)
      .where(eq(assessments.created_by, req.user.id))
      .orderBy(desc(assessments.created_at));

    // ✅ FIX: Completed should NOT appear in recently created
    const completed = allAssessments.filter(
      (a) => new Date(a.end_date) < currentDate
    );

    const completedIds = new Set(completed.map((a) => a.id));

    // ✅ FIX: Recently created EXCLUDES completed
    const recentlyCreated = allAssessments.filter(
      (a) =>
        new Date(a.created_at) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
        !completedIds.has(a.id) // ✅ Exclude completed
    );

    const ongoing = allAssessments.filter(
      (a) =>
        new Date(a.start_date) <= currentDate &&
        new Date(a.end_date) >= currentDate &&
        a.is_active &&
        !completedIds.has(a.id) // ✅ Exclude completed
    );

    const upcoming = allAssessments.filter(
      (a) => new Date(a.start_date) > currentDate && a.is_active
    );

    res.json({
      ok: true,
      data: {
        all: allAssessments,
        recentlyCreated,
        ongoing,
        completed,
        upcoming,
      },
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch assessments",
      details: error.message,
    });
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
      const { branch } = req.query;

      let query = db
        .select({
          rank: leaderboard.rank,
          studentId: leaderboard.student_id,
          studentName: student_profile.full_name,
          rollNumber: student_profile.roll_number,
          branch: student_profile.branch,
          totalScore: leaderboard.total_score,
          percentageScore: leaderboard.percentage_score,
          timeTaken: leaderboard.time_taken,
          attemptDate: leaderboard.attempt_date,
        })
        .from(leaderboard)
        .innerJoin(user, eq(leaderboard.student_id, user.id))
        .innerJoin(student_profile, eq(user.id, student_profile.user_id))
        .where(eq(leaderboard.assessment_id, assessmentId));

      if (branch && branch !== "all") {
        query = query.where(and(eq(student_profile.branch, branch)));
      }

      const leaderboardData = await query.orderBy(leaderboard.rank);

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

    if (!studentId || studentId === "undefined") {
      return res.status(400).json({
        ok: false,
        error: "Student ID is required and must be valid",
      });
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

    const studentBranch = studentProfile?.branch;
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

    const availableAssessments = studentBranch
      ? allAssessments.filter((assessment) => {
          const allowedBranches = assessment.allowedBranches || [];
          return (
            Array.isArray(allowedBranches) &&
            allowedBranches.includes(studentBranch)
          );
        })
      : allAssessments;

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

      // ✅ FIX: If premade and in-progress BUT no questions, delete attempt and retry
      if (assessment.type === "premade" && inProgressAttempt) {
        const storedQuestions = inProgressAttempt.metadata?.questions || [];

        if (storedQuestions.length === 0) {
          console.log("⚠️ Found corrupted attempt, deleting and retrying...");

          // Delete the corrupted attempt
          await db
            .delete(student_attempts)
            .where(eq(student_attempts.id, inProgressAttempt.id));

          // Continue to fetch fresh questions below (don't return here)
        } else {
          // Has questions, return them
          return res.json({
            ok: true,
            data: {
              attempt: {
                ...inProgressAttempt,
                duration: assessment.duration,
              },
              questions: storedQuestions.map((q) => ({
                id: q.id,
                questionText: q.questionText,
                questionType: q.questionType,
                options: q.options.map((o) => ({ id: o.id, text: o.text })),
                marks: q.marks,
              })),
            },
          });
        }
      }

      // NEW: If premade assessment (or corrupted attempt), fetch fresh questions
      if (assessment.type === "premade") {
        const metadata = assessment.metadata || {};
        const {
          difficulty = "medium",
          numQuestions = 10,
          categoryId = 18,
        } = metadata;

        console.log("🔍 Fetching questions from Trivia API...", {
          difficulty,
          categoryId,
          numQuestions,
        });

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const triviaResponse = await fetch(
            `https://opentdb.com/api.php?amount=${numQuestions}&category=${categoryId}&difficulty=${difficulty}&type=multiple`,
            { signal: controller.signal }
          );

          clearTimeout(timeoutId);

          console.log("✅ Trivia API responded:", triviaResponse.status);

          if (!triviaResponse.ok) {
            throw new Error(`Trivia API returned ${triviaResponse.status}`);
          }

          const triviaData = await triviaResponse.json();

          console.log("✅ Trivia data:", {
            responseCode: triviaData.response_code,
            questionCount: triviaData.results?.length,
          });

          if (!triviaData.results || triviaData.results.length === 0) {
            console.error("❌ No results from Trivia API:", triviaData);
            throw new Error("No questions received from API");
          }

          const uniqueQuestionsList = triviaData.results.map((q, index) => {
            const correctAnswer = decodeHTML(q.correct_answer);
            const allAnswers = [
              correctAnswer,
              ...q.incorrect_answers.map(decodeHTML),
            ].sort(() => Math.random() - 0.5);

            return {
              id: `q-${index}`,
              questionText: decodeHTML(q.question),
              questionType: "mcq",
              difficulty: q.difficulty,
              marks: 1,
              options: allAnswers.map((answer, idx) => ({
                id: idx,
                text: answer,
                isCorrect: answer === correctAnswer,
              })),
              correctAnswer: correctAnswer,
            };
          });

          console.log("✅ Questions transformed:", uniqueQuestionsList.length);

          // Store questions in attempt metadata
          const [newAttempt] = await db
            .insert(student_attempts)
            .values({
              student_id: studentId,
              assessment_id: assessmentId,
              start_time: new Date(),
              status: "in_progress",
              metadata: {
                questions: uniqueQuestionsList,
              },
            })
            .returning();

          console.log("✅ Attempt created with questions:", newAttempt.id);

          return res.status(201).json({
            ok: true,
            data: {
              attempt: {
                ...newAttempt,
                duration: assessment.duration,
              },
              questions: uniqueQuestionsList.map((q) => ({
                id: q.id,
                questionText: q.questionText,
                questionType: q.questionType,
                options: q.options.map((o) => ({ id: o.id, text: o.text })),
                marks: q.marks,
              })),
            },
          });
        } catch (fetchError) {
          console.error(
            "❌ Error fetching from Trivia API:",
            fetchError.message
          );
          console.error("❌ Stack:", fetchError.stack);

          return res.status(500).json({
            ok: false,
            error:
              "Failed to fetch questions from external API. Please try again.",
            details: fetchError.message,
          });
        }
      }

      // Regular assessment flow
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

      return res.status(201).json({
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
      console.error("❌ Error starting assessment:", error.message);
      console.error("❌ Stack:", error.stack);
      return res.status(500).json({
        ok: false,
        error: "Failed to start assessment",
        details: error.message,
      });
    }
  }
);

// Save answer
router.post(
  "/student/attempts/:attemptId/answers",
  requireAuth,
  async (req, res) => {
    try {
      const { attemptId } = req.params;
      const { questionId, answer, timeTaken } = req.body;

      console.log("💾 Saving answer:", { attemptId, questionId, answer });

      // Get attempt
      const [attempt] = await db
        .select()
        .from(student_attempts)
        .where(eq(student_attempts.id, attemptId))
        .limit(1);

      if (!attempt) {
        return res.status(404).json({ ok: false, error: "Attempt not found" });
      }

      // ✅ FIX: Save answers to DB for BOTH premade and regular assessments
      // Check if answer already exists
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
          .set({
            answer,
            time_taken: timeTaken,
            updated_at: new Date(),
          })
          .where(eq(student_answers.id, existingAnswer.id));

        console.log("✅ Answer updated");
      } else {
        await db.insert(student_answers).values({
          attempt_id: attemptId,
          question_id: questionId,
          answer,
          time_taken: timeTaken,
        });

        console.log("✅ Answer inserted");
      }

      res.json({ ok: true, message: "Answer saved successfully" });
    } catch (error) {
      console.error("❌ Error saving answer:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to save answer",
        details: error.message,
      });
    }
  }
);

// Submit assessment
router.post(
  "/student/attempts/:attemptId/submit",
  requireAuth,
  async (req, res) => {
    try {
      const { attemptId } = req.params;

      console.log("📥 Submit request for attempt:", attemptId);

      const [attempt] = await db
        .select()
        .from(student_attempts)
        .where(eq(student_attempts.id, attemptId))
        .limit(1);

      if (!attempt) {
        return res.status(404).json({ ok: false, error: "Attempt not found" });
      }

      if (attempt.student_id !== req.user.id) {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      const [assessment] = await db
        .select()
        .from(assessments)
        .where(eq(assessments.id, attempt.assessment_id))
        .limit(1);

      let totalScore = 0;
      let questionsWithAnswers = [];

      // ✅ REPLACE THIS SECTION - For premade assessments
      if (assessment.type === "premade") {
        console.log("✅ Premade assessment - grading from metadata");

        const storedQuestions = attempt.metadata?.questions || [];
        console.log("📚 Found questions in metadata:", storedQuestions.length);

        const studentAnswers = await db
          .select()
          .from(student_answers)
          .where(eq(student_answers.attempt_id, attemptId));

        console.log("📝 Found student answers:", studentAnswers.length);

        // ✅ NEW SIMPLE GRADING LOGIC
        for (const q of storedQuestions) {
          const studentAnswer = studentAnswers.find(
            (sa) => sa.question_id === q.id
          );

          if (studentAnswer && studentAnswer.answer) {
            // Get the option ID from student's answer
            const selectedOptionId = Array.isArray(studentAnswer.answer)
              ? parseInt(studentAnswer.answer[0])
              : parseInt(studentAnswer.answer);

            console.log(
              "🔍 Grading",
              q.id,
              "- selected option:",
              selectedOptionId
            );

            // Find the selected option and check if it's correct
            const selectedOption = q.options?.find(
              (opt) => opt.id === selectedOptionId
            );
            const isCorrect = selectedOption?.isCorrect || false;
            const marksAwarded = isCorrect ? q.marks : 0;

            totalScore += marksAwarded;

            console.log(
              `${isCorrect ? "✅" : "❌"} ${
                q.id
              }: option ${selectedOptionId} (${
                selectedOption?.text
              }) = ${marksAwarded}/${q.marks}`
            );

            // Update the answer record
            await db
              .update(student_answers)
              .set({
                is_correct: isCorrect,
                marks_awarded: marksAwarded,
                updated_at: new Date(),
              })
              .where(eq(student_answers.id, studentAnswer.id));

            questionsWithAnswers.push({
              questionId: q.id,
              correctAnswer: q.correctAnswer,
              questionType: q.questionType,
              marks: q.marks,
              tags: ["premade"],
              studentAnswer: studentAnswer.answer,
              answerId: studentAnswer.id,
            });
          } else {
            console.log("⚠️ No answer for question:", q.id);
          }
        }

        console.log("📊 Total score:", totalScore, "/", assessment.total_marks);
      } else {
        // Regular assessment grading (keep existing logic)
        questionsWithAnswers = await db
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
              sql`CAST(${student_answers.question_id} AS uuid) = ${questions.id}`,
              eq(student_answers.attempt_id, attemptId)
            )
          )
          .where(eq(questions.assessment_id, attempt.assessment_id));
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
      }

      // Calculate final scores
      const percentageScore = Math.round(
        (totalScore / assessment.total_marks) * 100
      );
      const timeTaken = Math.round(
        (new Date() - new Date(attempt.start_time)) / 60000
      );

      // Update attempt
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

      console.log("✅ Assessment submitted successfully");

      res.json({
        ok: true,
        message: "Assessment submitted successfully",
        data: { totalScore, percentageScore },
      });
    } catch (error) {
      console.error("❌ Error submitting assessment:", error);
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

      // ✅ NEW: Check if assessment is premade
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

      // ✅ For premade assessments, questions come from attempt metadata
      if (assessment.type === "premade") {
        // Find student's attempt
        const [attempt] = await db
          .select()
          .from(student_attempts)
          .where(
            and(
              eq(student_attempts.assessment_id, assessmentId),
              eq(student_attempts.student_id, req.user.id)
            )
          )
          .limit(1);

        if (!attempt) {
          return res.status(404).json({
            ok: false,
            error: "No attempt found. Start the assessment first.",
          });
        }

        const storedQuestions = attempt.metadata?.questions || [];

        if (storedQuestions.length === 0) {
          return res
            .status(404)
            .json({ ok: false, error: "No questions found" });
        }

        // Return questions without correct answers
        return res.json({
          ok: true,
          data: {
            questions: storedQuestions.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              questionType: q.questionType,
              options: q.options.map((o) => ({ id: o.id, text: o.text })),
              marks: q.marks,
            })),
          },
        });
      }

      // ✅ For regular assessments, get from questions table
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
      res.status(500).json({
        ok: false,
        error: "Failed to fetch questions",
        details: error.message,
      });
    }
  }
);

//
//
//
//

// 1. Create premade assessment using external API
router.post(
  "/premade-assessments/create-template",
  requireAuth,
  async (req, res) => {
    try {
      if (req.user.role !== "placement") {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      const {
        subject,
        difficulty,
        numQuestions = 10,
        startDate,
        endDate,
        allowedBranches = [],
      } = req.body;

      const userId = req.user?.id;

      if (!subject || !difficulty || !startDate || !endDate) {
        return res.status(400).json({
          ok: false,
          error: "Subject, difficulty, and dates are required",
        });
      }

      if (allowedBranches.length === 0) {
        return res
          .status(400)
          .json({ ok: false, error: "At least one branch must be selected" });
      }

      const assessmentId = uuidv4();

      // ✅ Store only assessment metadata - NO questions
      const [assessment] = await db
        .insert(assessments)
        .values({
          id: assessmentId,
          title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} - ${
            difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
          } Level`,
          description: `${subject} assessment covering key concepts`,
          type: "premade",
          duration: 15,
          total_marks: numQuestions,
          passing_marks: Math.ceil(numQuestions * 0.6),
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          created_by: userId,
          is_active: true,
          allowed_branches: allowedBranches,
          // ✅ Store metadata for fetching questions later
          metadata: {
            subject,
            difficulty,
            numQuestions,
            categoryId: 18,
          },
        })
        .returning();

      // ✅ NO questions inserted here

      res.status(201).json({
        ok: true,
        data: {
          assessmentId: assessment.id,
        },
      });
    } catch (error) {
      console.error("Error creating premade assessment:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to create assessment",
        details: error.message,
      });
    }
  }
);
// Helper function
function decodeHTML(html) {
  const entities = {
    "&quot;": '"',
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&#039;": "'",
    "&apos;": "'",
    "&ndash;": "–",
    "&mdash;": "—",
    "&hellip;": "…",
  };

  return html.replace(/&[^;]+;/g, (entity) => {
    return entities[entity] || entity;
  });
}

// Export at the end
export default router;
