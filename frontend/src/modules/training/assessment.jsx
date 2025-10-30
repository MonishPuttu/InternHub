"use client";

import { useState, useEffect, useCallback } from "react";
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
  const { assessmentId } = params;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get attemptId from search params
    const id = searchParams.get("attemptId");
    if (!id) {
      setError("Invalid attempt. Please start the assessment again.");
      setLoading(false);
      setTimeout(() => router.push("/training/student"), 2000);
      return;
    }
    setAttemptId(id);
    fetchAssessmentData(id);
  }, [searchParams, assessmentId, router]);

  // Timer effect
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) {
      if (timeRemaining === 0 && questions.length > 0) {
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, questions.length]);

  const fetchAssessmentData = async (attemptIdParam) => {
    try {
      const response = await apiRequest(
        `/api/training/student/assessments/${assessmentId}/start`,
        { method: "POST" }
      );

      if (!response.data || !response.data.questions) {
        throw new Error("Invalid response from server");
      }

      setQuestions(response.data.questions);

      // Get duration from assessment, not attempt
      const duration = response.data.assessment?.duration || 60;
      setTimeRemaining(duration * 60); // convert to seconds
      setLoading(false);
      setError("");
    } catch (error) {
      console.error("Error fetching assessment:", error);
      setError(error.message || "Failed to load assessment. Redirecting...");
      setLoading(false);
      setTimeout(() => router.push("/training/student"), 2000);
    }
  };

  const saveAnswer = useCallback(
    async (questionId, answer) => {
      if (!attemptId) {
        console.warn("Attempt ID not set, skipping save");
        return;
      }

      try {
        await apiRequest(
          `/api/training/student/attempts/${attemptId}/answers`,
          {
            method: "POST",
            body: JSON.stringify({ questionId, answer, timeTaken: 0 }),
          }
        );
      } catch (error) {
        console.error("Error saving answer:", error);
      }
    },
    [attemptId]
  );

  const handleAnswerChange = (value) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    saveAnswer(currentQuestion.id, value);
  };

  const handleSubmit = async () => {
    if (submitting || !attemptId) {
      console.error(
        "Cannot submit: submitting=",
        submitting,
        "attemptId=",
        attemptId
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest(
        `/api/training/student/attempts/${attemptId}/submit`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Navigate with attemptId in URL
        router.push(`/training/student/report-card/${attemptId}`);
      } else {
        throw new Error("Failed to submit assessment");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert(
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
          <Alert severity="error" sx={{ mt: 2 }}>
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
      </Container>
    );
  }

  if (!attemptId) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Attempt ID is missing. Please start the assessment again.
        </Alert>
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
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "#e2e8f0" }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Attempt ID: {attemptId.slice(0, 8)}...
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

      {timeRemaining < 300 && (
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
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="start"
          mb={2}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#e2e8f0", flex: 1 }}
          >
            {currentQuestion.questionText}
          </Typography>
          <Chip
            label={`${currentQuestion.marks} marks`}
            sx={{
              bgcolor: "#8b5cf620",
              color: "#8b5cf6",
              flexShrink: 0,
            }}
          />
        </Box>

        {/* MCQ */}
        {currentQuestion.questionType === "mcq" && (
          <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
            >
              {currentQuestion.options.map((option, optIndex) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id.toString()}
                  control={<Radio sx={{ color: "#8b5cf6" }} />}
                  label={`${String.fromCharCode(65 + optIndex)}. ${
                    option.text
                  }`}
                  sx={{
                    color: "#e2e8f0",
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1,
                    border: "1px solid #334155",
                    bgcolor:
                      answers[currentQuestion.id] === option.id.toString()
                        ? "#8b5cf620"
                        : "transparent",
                    "&:hover": {
                      bgcolor: "#8b5cf610",
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {/* Multiple Select */}
        {currentQuestion.questionType === "multiple_select" && (
          <FormGroup sx={{ mt: 2 }}>
            {currentQuestion.options.map((option, optIndex) => (
              <FormControlLabel
                key={option.id}
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
                    sx={{ color: "#8b5cf6" }}
                  />
                }
                label={`${String.fromCharCode(65 + optIndex)}. ${option.text}`}
                sx={{
                  color: "#e2e8f0",
                  mb: 1,
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid #334155",
                  bgcolor: answers[currentQuestion.id]?.includes(
                    option.id.toString()
                  )
                    ? "#8b5cf620"
                    : "transparent",
                  "&:hover": {
                    bgcolor: "#8b5cf610",
                  },
                }}
              />
            ))}
          </FormGroup>
        )}
      </Card>

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
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
}
