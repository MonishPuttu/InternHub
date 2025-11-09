// /src/app/(protected)/training/placement/take-premade-assessment/[assessmentId]/page.jsx

"use client";

import { use } from "react";
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
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Timer, NavigateNext, NavigateBefore } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function TakePremadeAssessment({ params }) {
  const router = useRouter();
  const { assessmentId } = use(params);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const theme = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!assessmentId) {
      setError("Invalid assessment ID");
      setLoading(false);
      return;
    }

    fetchAssessment(assessmentId);
  }, [assessmentId]);

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

  const fetchAssessment = async (id) => {
    try {
      const response = await apiRequest(
        `/api/training/premade-assessments/${id}`
      );

      if (!response.data?.questions) {
        throw new Error("Questions not found");
      }

      setQuestions(response.data.questions);
      setAttemptId(response.data.attemptId || id);
      setTimeRemaining(response.data.assessment?.duration * 60 || 900);
      setLoading(false);
      setError("");
    } catch (error) {
      console.error("Error fetching assessment:", error);
      setError(error.message || "Failed to load assessment. Redirecting...");
      setLoading(false);
      setTimeout(() => router.push("/training/placement"), 2000);
    }
  };

  const saveAnswer = useCallback(
    async (questionIndex, answer) => {
      if (!attemptId) return;

      try {
        await apiRequest(
          `/api/training/student/attempts/${attemptId}/answers`,
          {
            method: "POST",
            body: JSON.stringify({
              questionId: questionIndex,
              answer: [answer],
              timeTaken: 0,
            }),
          }
        );
      } catch (error) {
        console.error("Error saving answer:", error);
      }
    },
    [attemptId]
  );

  const handleAnswerChange = (value) => {
    const newAnswers = { ...answers, [currentQuestionIndex]: value };
    setAnswers(newAnswers);
    saveAnswer(currentQuestionIndex, value);
  };

  const handleSubmit = async () => {
    if (submitting || !attemptId) return;

    setSubmitting(true);
    try {
      const response = await apiRequest(
        `/api/training/student/attempts/${attemptId}/submit`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        router.push(`/training/student/report-card/${attemptId}`);
      } else {
        throw new Error(response.error || "Failed to submit");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      setError("Failed to submit assessment");
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
        <Alert severity="error">{error || "No questions found"}</Alert>
        <Button
          onClick={() => router.push("/training/placement")}
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
      {/* Timer */}
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
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
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
      </Paper>

      {timeRemaining < 300 && timeRemaining > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ Less than 5 minutes remaining!
        </Alert>
      )}

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
        <Box mb={3}>
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: "bold",
              wordBreak: "break-word",
              mb: 2,
            }}
          >
            {currentQuestion.questionText}
          </Typography>
          <Chip
            label={`${currentQuestion.marks} mark${
              currentQuestion.marks !== 1 ? "s" : ""
            }`}
            sx={{
              bgcolor: "#8b5cf620",
              color: "#8b5cf6",
            }}
          />
        </Box>

        {/* MCQ Options */}
        <FormControl component="fieldset" sx={{ width: "100%" }}>
          <RadioGroup
            value={answers[currentQuestionIndex] || ""}
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
                    answers[currentQuestionIndex] === option.text
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
                  value={option.text}
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
      </Card>

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
