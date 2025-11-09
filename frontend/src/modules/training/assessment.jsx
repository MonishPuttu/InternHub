"use client";

import { use } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Box,
  LinearProgress,
  Alert,
  Checkbox,
  FormGroup,
  Card,
  Chip,
} from "@mui/material";
import { Timer, NavigateNext, NavigateBefore } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function TakeAssessment({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { assessmentId } = use(params);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPremade, setIsPremade] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState("");

  // ✅ Add ref to prevent double execution
  const fetchedRef = useRef(false);

  // Initialize data
  useEffect(() => {
    // ✅ Prevent double execution in StrictMode
    if (fetchedRef.current) {
      console.log("⏭️ Skipping duplicate useEffect call");
      return;
    }
    fetchedRef.current = true;

    if (!assessmentId) {
      setError("Invalid assessment ID");
      setLoading(false);
      return;
    }

    const attemptIdParam = searchParams.get("attemptId");
    if (!attemptIdParam) {
      setError("Invalid attempt. Please start the assessment again.");
      setLoading(false);
      setTimeout(() => router.push("/training/student"), 2000);
      return;
    }

    setAttemptId(attemptIdParam);
    fetchAttemptData(attemptIdParam, assessmentId);
  }, [assessmentId, searchParams, router]);

  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) {
      if (
        timeRemaining === 0 &&
        questions.length > 0 &&
        attemptId &&
        !submitting
      ) {
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, questions.length, attemptId, submitting]);

  const fetchAttemptData = async (attemptIdParam, assessmentIdParam) => {
    try {
      setLoading(true);

      const storageKey = `attempt-${attemptIdParam}`;
      console.log("🔍 Looking for cached data:", storageKey);

      const cachedData = sessionStorage.getItem(storageKey);
      console.log("💾 Found cached data:", cachedData ? "YES" : "NO");

      if (cachedData) {
        console.log("✅ Using cached data");
        const data = JSON.parse(cachedData);

        sessionStorage.removeItem(storageKey);

        setAttempt(data.attempt);
        setQuestions(data.questions);
        setTimeRemaining(data.attempt.duration * 60);
        setIsPremade(true); // ✅ Mark as premade
        setAnswers(
          data.questions.reduce((acc, q) => {
            acc[q.id] = null;
            return acc;
          }, {})
        );
        setLoading(false);
        return;
      }

      // ... rest of code
    } catch (err) {
      console.error("❌ Error fetching attempt data:", err);
      setError(err.message || "Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  // Update saveAnswer to skip API call for premade
  const saveAnswer = useCallback(
    async (questionId, answer) => {
      if (!attemptId) {
        console.warn("Attempt ID not set, skipping save");
        return;
      }

      // ✅ FIX: Save to backend for ALL assessments (including premade)
      try {
        await apiRequest(
          `/api/training/student/attempts/${attemptId}/answers`,
          {
            method: "POST",
            body: JSON.stringify({ questionId, answer, timeTaken: 0 }),
          }
        );
        console.log("✅ Answer saved to backend");
      } catch (error) {
        console.error("Error saving answer:", error);
      }
    },
    [attemptId] // Remove isPremade from dependencies
  );

  const handleAnswerChange = (value) => {
    const currentQuestion = questions[currentQuestionIndex];

    const answerValue =
      currentQuestion.questionType === "mcq" ? [value] : value;

    const newAnswers = { ...answers, [currentQuestion.id]: answerValue };
    setAnswers(newAnswers);
    saveAnswer(currentQuestion.id, answerValue);
  };

  const handleSubmit = async () => {
    if (submitting || !attemptId) {
      return;
    }

    setSubmitting(true);
    try {
      // ✅ FIX: No need to send answers - they're already saved
      // Just submit directly
      const response = await apiRequest(
        `/api/training/student/attempts/${attemptId}/submit`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        router.push(`/training/student/report-card/${attemptId}`);
      } else {
        throw new Error(response.error || "Failed to submit assessment");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setError(
        "Failed to submit assessment: " + (error.message || "Unknown error")
      );
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
        {error && (
          <Alert severity="error" sx={{ mt: 2, mx: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  if (error || questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || "No questions found for this assessment"}
        </Alert>
        <Button
          onClick={() => router.push("/training/student")}
          sx={{ mt: 2, color: "#8b5cf6" }}
        >
          Back to Assessments
        </Button>
      </Container>
    );
  }

  if (!attemptId || !assessmentId) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Required IDs are missing. Please start the assessment again.
        </Alert>
        <Button
          onClick={() => router.push("/training/student")}
          sx={{ mt: 2, color: "#8b5cf6" }}
        >
          Back to Assessments
        </Button>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Timer Header */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "text.primary" }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Timer
              sx={{
                color: timeRemaining < 300 ? "#ef4444" : "#8b5cf6",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: timeRemaining < 300 ? "#ef4444" : "#8b5cf6",
                fontWeight: "bold",
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {timeRemaining < 300 && timeRemaining > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ Less than 5 minutes remaining!
        </Alert>
      )}

      {/* Progress */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mb: 3,
          height: 8,
          borderRadius: 1,
          bgcolor: "#334155",
          "& .MuiLinearProgress-bar": {
            bgcolor: "#8b5cf6",
          },
        }}
      />

      {/* Question Card */}
      <Card
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={3}
          gap={2}
        >
          <Box flex={1} minWidth={0}>
            <Typography
              variant="h6"
              sx={{
                color: "text.primary",
                fontWeight: "bold",
                wordBreak: "break-word",
              }}
            >
              {currentQuestion.questionText}
            </Typography>
          </Box>
          <Box display="flex" gap={1} sx={{ flexShrink: 0 }}>
            <Chip
              label={
                currentQuestion.questionType === "mcq"
                  ? "Single Choice"
                  : "Multiple Choice"
              }
              size="small"
              sx={{
                bgcolor: "#06b6d420",
                color: "#06b6d4",
                fontWeight: "500",
              }}
            />
            <Chip
              label={`${currentQuestion.marks} marks`}
              size="small"
              sx={{
                bgcolor: "#8b5cf620",
                color: "#8b5cf6",
                fontWeight: "500",
              }}
            />
          </Box>
        </Box>

        {/* MCQ */}
        {currentQuestion.questionType === "mcq" && (
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <RadioGroup
              value={answers[currentQuestion.id]?.[0] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
            >
              {currentQuestion.options.map((option, optIndex) => (
                <Box
                  key={option.id}
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    borderRadius: 1,
                    border: "1px solid #334155",
                    bgcolor:
                      answers[currentQuestion.id]?.[0] === option.id.toString()
                        ? "#8b5cf620"
                        : "transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "#8b5cf610",
                      borderColor: "#8b5cf6",
                    },
                  }}
                >
                  <FormControlLabel
                    value={option.id.toString()}
                    control={
                      <Radio
                        sx={{
                          color: "#8b5cf6",
                          "&.Mui-checked": { color: "#8b5cf6" },
                        }}
                      />
                    }
                    label={`${String.fromCharCode(65 + optIndex)}. ${
                      option.text
                    }`}
                    sx={{
                      color: "text.primary",
                      m: 0,
                      width: "100%",
                      "& .MuiFormControlLabel-label": {
                        wordBreak: "break-word",
                        ml: 1,
                      },
                    }}
                  />
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {/* Multiple Select */}
        {currentQuestion.questionType === "multiple_select" && (
          <FormGroup>
            {currentQuestion.options.map((option, optIndex) => (
              <Box
                key={option.id}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid #334155",
                  bgcolor: answers[currentQuestion.id]?.includes(
                    option.id.toString()
                  )
                    ? "#8b5cf620"
                    : "transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "#8b5cf610",
                    borderColor: "#8b5cf6",
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        answers[currentQuestion.id]?.includes(
                          option.id.toString()
                        ) || false
                      }
                      onChange={(e) => {
                        const current = answers[currentQuestion.id] || [];
                        const newValue = e.target.checked
                          ? [...current, option.id.toString()]
                          : current.filter((id) => id !== option.id.toString());
                        handleAnswerChange(newValue);
                      }}
                      sx={{
                        color: "#8b5cf6",
                        "&.Mui-checked": { color: "#8b5cf6" },
                      }}
                    />
                  }
                  label={`${String.fromCharCode(65 + optIndex)}. ${
                    option.text
                  }`}
                  sx={{
                    color: "text.primary",
                    m: 0,
                    width: "100%",
                    "& .MuiFormControlLabel-label": {
                      wordBreak: "break-word",
                      ml: 1,
                    },
                  }}
                />
              </Box>
            ))}
          </FormGroup>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Navigation */}
      <Box display="flex" justifyContent="space-between" gap={2}>
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          disabled={currentQuestionIndex === 0 || submitting}
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          sx={{
            color: "#8b5cf6",
            borderColor: "#8b5cf6",
            "&:hover": { borderColor: "#7c3aed", bgcolor: "#8b5cf610" },
            "&:disabled": { borderColor: "#334155", color: "text.secondary" },
          }}
        >
          Previous
        </Button>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              bgcolor: "#10b981",
              color: "#fff",
              "&:hover": { bgcolor: "#059669" },
              "&:disabled": { bgcolor: "text.secondary" },
            }}
          >
            {submitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<NavigateNext />}
            disabled={submitting}
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            sx={{
              bgcolor: "#8b5cf6",
              color: "#fff",
              "&:hover": { bgcolor: "#7c3aed" },
              "&:disabled": { bgcolor: "text.secondary" },
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
}
