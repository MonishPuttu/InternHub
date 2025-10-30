"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Card,
  CardContent,
  Divider,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Chip,
} from "@mui/material";
import { Add, Delete, ArrowBack, Save } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function CreateAssessment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [assessment, setAssessment] = useState({
    title: "",
    description: "",
    type: "daily",
    duration: 30,
    totalMarks: 0,
    passingMarks: 0,
    startDate: "",
    endDate: "",
  });

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      questionType: "mcq",
      options: [
        { id: 1, text: "" },
        { id: 2, text: "" },
      ],
      correctAnswer: [],
      marks: 1,
      difficulty: "medium",
      tags: [],
    },
  ]);

  // Get current year and next year for date validation
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;

  const handleAssessmentChange = (field, value) => {
    setAssessment((prev) => {
      const updated = { ...prev, [field]: value };

      // Title validation (max 50 characters)
      if (field === "title" && value.length > 50) {
        setError("Title cannot exceed 50 characters");
        return prev;
      }

      // Description validation (max 250 characters)
      if (field === "description" && value.length > 250) {
        setError("Description cannot exceed 250 characters");
        return prev;
      }

      // Duration validation (max 3 hours = 180 minutes)
      if (field === "duration") {
        if (value > 180) {
          setError("Duration cannot exceed 3 hours (180 minutes)");
          return { ...prev, duration: 180 };
        }
      }

      // Passing marks validation
      if (field === "passingMarks" && value > updated.totalMarks) {
        setError("Passing marks cannot exceed total marks");
        return prev;
      } else {
        setError("");
      }

      // Date validation
      if (field === "startDate" || field === "endDate") {
        const year = new Date(value).getFullYear();
        if (year > maxYear) {
          setError(`Year cannot exceed ${maxYear}`);
          return prev;
        }
      }

      // Clear error if validation passes
      if (
        (field === "title" && value.length <= 50) ||
        (field === "description" && value.length <= 250)
      ) {
        setError("");
      }

      return updated;
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];

    // Question text validation (max 500 characters)
    if (field === "questionText" && value.length > 500) {
      setError("Question text cannot exceed 500 characters");
      return;
    }

    // Marks validation (max 3 digits = 999)
    if (field === "marks") {
      if (value > 999) {
        setError("Marks cannot exceed 999");
        value = 999;
      }
    }

    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);

    // Recalculate total marks
    const total = updatedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
    setAssessment((prev) => {
      const updated = { ...prev, totalMarks: total };
      if (updated.passingMarks > total) {
        updated.passingMarks = total;
      }
      return updated;
    });

    // Clear error if valid
    if (field === "questionText" && value.length <= 500) {
      setError("");
    }
    if (field === "marks" && value <= 999) {
      setError("");
    }
  };

  const handleOptionChange = (qIndex, optionId, text) => {
    // Option text validation (max 100 characters)
    if (text.length > 100) {
      setError("Option text cannot exceed 100 characters");
      return;
    }

    const updatedQuestions = [...questions];
    const option = updatedQuestions[qIndex].options.find(
      (o) => o.id === optionId
    );
    if (option) option.text = text;
    setQuestions(updatedQuestions);

    // Clear error if valid
    if (text.length <= 100) {
      setError("");
    }
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[qIndex].options.length >= 6) {
      setError("Maximum 6 options allowed per question");
      return;
    }
    const newId = updatedQuestions[qIndex].options.length + 1;
    updatedQuestions[qIndex].options.push({ id: newId, text: "" });
    setQuestions(updatedQuestions);
    setError("");
  };

  const removeOption = (qIndex, optionId) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter(
      (o) => o.id !== optionId
    );
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        questionType: "mcq",
        options: [
          { id: 1, text: "" },
          { id: 2, text: "" },
        ],
        correctAnswer: [],
        marks: 1,
        difficulty: "medium",
        tags: [],
      },
    ]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    const total = updatedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
    setAssessment((prev) => ({ ...prev, totalMarks: total }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (!assessment.title.trim()) throw new Error("Title is required");
      if (!assessment.startDate) throw new Error("Start date is required");
      if (!assessment.endDate) throw new Error("End date is required");

      // Additional validations
      if (assessment.title.length > 50)
        throw new Error("Title cannot exceed 50 characters");
      if (assessment.description.length > 250)
        throw new Error("Description cannot exceed 250 characters");
      if (assessment.duration > 180)
        throw new Error("Duration cannot exceed 3 hours");

      const startDate = new Date(assessment.startDate);
      const endDate = new Date(assessment.endDate);

      if (
        startDate.getFullYear() > maxYear ||
        endDate.getFullYear() > maxYear
      ) {
        throw new Error(`Year cannot exceed ${maxYear}`);
      }

      if (endDate <= startDate)
        throw new Error("End date must be after start date");
      if (startDate < new Date())
        throw new Error("Start date cannot be in the past");
      if (questions.length === 0)
        throw new Error("Please add at least one question");

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim())
          throw new Error(`Question ${i + 1}: Question text is required`);
        if (q.questionText.length > 500)
          throw new Error(
            `Question ${i + 1}: Question text exceeds 500 characters`
          );
        if (q.marks > 999)
          throw new Error(`Question ${i + 1}: Marks cannot exceed 999`);
        if (q.options.length < 2)
          throw new Error(`Question ${i + 1}: At least 2 options required`);

        const emptyOptions = q.options.filter((opt) => !opt.text.trim());
        if (emptyOptions.length > 0)
          throw new Error(`Question ${i + 1}: All options must have text`);

        const longOptions = q.options.filter((opt) => opt.text.length > 100);
        if (longOptions.length > 0)
          throw new Error(
            `Question ${i + 1}: Option text cannot exceed 100 characters`
          );

        if (!q.correctAnswer || q.correctAnswer.length === 0)
          throw new Error(`Question ${i + 1}: Please select correct answer`);
      }

      const data = {
        ...assessment,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          difficulty: q.difficulty,
          tags: q.tags || [],
        })),
      };

      await apiRequest("/api/training/assessments", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setSuccess(true);
      setTimeout(() => router.push("/training/placement"), 1500);
    } catch (error) {
      setError(error.message || "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/training/placement")}
        sx={{ mb: 3, color: "#8b5cf6" }}
      >
        Back
      </Button>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "#e2e8f0",
            wordBreak: "break-word",
          }}
        >
          Create New Assessment
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Assessment created successfully!
          </Alert>
        )}

        {/* Assessment Details */}
        <Box mb={4}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#e2e8f0", mb: 3 }}
          >
            Assessment Details
          </Typography>

          {/* Row 1: Title, Type, Description */}
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Title"
              value={assessment.title}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  handleAssessmentChange("title", e.target.value);
                }
              }}
              inputProps={{ maxLength: 50 }}
              helperText={`${assessment.title.length}/50 characters`}
              required
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiFormHelperText-root": { color: "#64748b" },
              }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel sx={{ color: "#94a3b8" }}>Type</InputLabel>
              <Select
                value={assessment.type}
                label="Type"
                onChange={(e) => handleAssessmentChange("type", e.target.value)}
                sx={{
                  color: "#e2e8f0",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#334155",
                  },
                }}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={assessment.description}
              onChange={(e) => {
                if (e.target.value.length <= 250) {
                  handleAssessmentChange("description", e.target.value);
                }
              }}
              inputProps={{ maxLength: 250 }}
              helperText={`${assessment.description.length}/250 characters`}
              multiline
              rows={2}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiFormHelperText-root": { color: "#64748b" },
              }}
            />
          </Box>

          {/* Row 2: Duration, Total Marks, Passing Marks */}
          <Box display="flex" gap={2} mb={2}>
            <TextField
              type="number"
              label="Duration (minutes)"
              value={assessment.duration}
              onChange={(e) =>
                handleAssessmentChange(
                  "duration",
                  Math.min(180, Math.max(1, parseInt(e.target.value) || 0))
                )
              }
              inputProps={{ min: 1, max: 180 }}
              helperText="Maximum 3 hours (180 minutes)"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiFormHelperText-root": { color: "#64748b" },
              }}
            />
            <TextField
              type="number"
              label="Total Marks"
              value={assessment.totalMarks}
              disabled
              helperText="Auto-calculated"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiFormHelperText-root": { color: "#64748b" },
              }}
            />
            <TextField
              type="number"
              label="Passing Marks"
              value={assessment.passingMarks}
              onChange={(e) =>
                handleAssessmentChange(
                  "passingMarks",
                  Math.max(0, parseInt(e.target.value) || 0)
                )
              }
              inputProps={{ min: 0, max: assessment.totalMarks }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
              }}
            />
          </Box>

          {/* Row 3: Start Date & Time, End Date & Time */}
          <Box display="flex" gap={2}>
            <TextField
              type="datetime-local"
              label="Start Date & Time"
              value={assessment.startDate}
              onChange={(e) =>
                handleAssessmentChange("startDate", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16),
                max: `${maxYear}-12-31T23:59`,
              }}
              helperText={`Year cannot exceed ${maxYear}`}
              required
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiFormHelperText-root": { color: "#64748b" },
              }}
            />
            <TextField
              type="datetime-local"
              label="End Date & Time"
              value={assessment.endDate}
              onChange={(e) =>
                handleAssessmentChange("endDate", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min:
                  assessment.startDate || new Date().toISOString().slice(0, 16),
                max: `${maxYear}-12-31T23:59`,
              }}
              helperText={`Year cannot exceed ${maxYear}`}
              required
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiFormHelperText-root": { color: "#64748b" },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 4, bgcolor: "#334155" }} />

        {/* Questions */}
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" sx={{ color: "#e2e8f0" }}>
              Questions ({questions.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addQuestion}
              sx={{ color: "#8b5cf6", borderColor: "#8b5cf6" }}
            >
              Add Question
            </Button>
          </Box>

          {questions.map((question, qIndex) => (
            <Card
              key={qIndex}
              sx={{
                mb: 3,
                bgcolor: "#0f172a",
                border: "1px solid #334155",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#e2e8f0",
                      wordBreak: "break-word",
                    }}
                  >
                    Question {qIndex + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeQuestion(qIndex)}
                    sx={{ color: "#ef4444" }}
                    disabled={questions.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                {/* Row 1: Question Text (Full Width) */}
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Question Text"
                  value={question.questionText}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "questionText", e.target.value)
                  }
                  inputProps={{ maxLength: 500 }}
                  helperText={`${question.questionText.length}/500 characters`}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      color: "#e2e8f0",
                      "& fieldset": { borderColor: "#334155" },
                    },
                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                    "& .MuiFormHelperText-root": { color: "#64748b" },
                  }}
                />

                {/* Row 2: Type, Marks, Difficulty */}
                <Box display="flex" gap={2} mb={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: "#94a3b8" }}>Type</InputLabel>
                    <Select
                      value={question.questionType}
                      label="Type"
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "questionType",
                          e.target.value
                        )
                      }
                      sx={{
                        color: "#e2e8f0",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#334155",
                        },
                      }}
                    >
                      <MenuItem value="mcq">Multiple Choice</MenuItem>
                      <MenuItem value="multiple_select">
                        Multiple Select
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    type="number"
                    label="Marks"
                    value={question.marks}
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        "marks",
                        Math.min(
                          999,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      )
                    }
                    inputProps={{ min: 1, max: 999 }}
                    helperText="Max 999"
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        color: "#e2e8f0",
                        "& fieldset": { borderColor: "#334155" },
                      },
                      "& .MuiInputLabel-root": { color: "#94a3b8" },
                      "& .MuiFormHelperText-root": { color: "#64748b" },
                    }}
                  />

                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: "#94a3b8" }}>
                      Difficulty
                    </InputLabel>
                    <Select
                      value={question.difficulty}
                      label="Difficulty"
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "difficulty",
                          e.target.value
                        )
                      }
                      sx={{
                        color: "#e2e8f0",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#334155",
                        },
                      }}
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 3: Options Section */}
                <Box mb={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="subtitle2" sx={{ color: "#94a3b8" }}>
                      Options
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => addOption(qIndex)}
                      disabled={question.options.length >= 6}
                      sx={{ color: "#8b5cf6" }}
                    >
                      Add Option {question.options.length >= 6 && "(Max 6)"}
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: 1,
                    }}
                  >
                    {question.options.map((option) => (
                      <Box
                        key={option.id}
                        display="flex"
                        gap={1}
                        sx={{ width: "100%" }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={`Option ${option.id}`}
                          value={option.text}
                          onChange={(e) =>
                            handleOptionChange(
                              qIndex,
                              option.id,
                              e.target.value
                            )
                          }
                          inputProps={{ maxLength: 100 }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: "#e2e8f0",
                              "& fieldset": { borderColor: "#334155" },
                            },
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeOption(qIndex, option.id)}
                          sx={{ color: "#ef4444" }}
                          disabled={question.options.length <= 2}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", mt: 1, display: "block" }}
                  >
                    Max 100 characters per option
                  </Typography>
                </Box>

                {/* Row 4: Correct Answer */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#94a3b8", mb: 1 }}
                  >
                    Correct Answer
                  </Typography>
                  {question.questionType === "mcq" ? (
                    <RadioGroup
                      value={question.correctAnswer[0] || ""}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "correctAnswer", [
                          e.target.value,
                        ])
                      }
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      {question.options.map((option) => (
                        <FormControlLabel
                          key={option.id}
                          value={option.id.toString()}
                          control={<Radio sx={{ color: "#8b5cf6" }} />}
                          label={option.text || `Option ${option.id}`}
                          sx={{
                            color: "#e2e8f0",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            border: "1px solid #334155",
                            bgcolor:
                              question.correctAnswer[0] === option.id.toString()
                                ? "#8b5cf620"
                                : "transparent",
                            m: 0,
                            wordBreak: "break-word",
                          }}
                        />
                      ))}
                    </RadioGroup>
                  ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {question.options.map((option) => (
                        <FormControlLabel
                          key={option.id}
                          control={
                            <Checkbox
                              checked={question.correctAnswer.includes(
                                option.id.toString()
                              )}
                              onChange={(e) => {
                                const current = question.correctAnswer || [];
                                const newValue = e.target.checked
                                  ? [...current, option.id.toString()]
                                  : current.filter(
                                      (id) => id !== option.id.toString()
                                    );
                                handleQuestionChange(
                                  qIndex,
                                  "correctAnswer",
                                  newValue
                                );
                              }}
                              sx={{ color: "#8b5cf6" }}
                            />
                          }
                          label={option.text || `Option ${option.id}`}
                          sx={{
                            color: "#e2e8f0",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            border: "1px solid #334155",
                            bgcolor: question.correctAnswer.includes(
                              option.id.toString()
                            )
                              ? "#8b5cf620"
                              : "transparent",
                            m: 0,
                            wordBreak: "break-word",
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button
            variant="outlined"
            onClick={() => router.push("/training/placement")}
            disabled={loading}
            sx={{ color: "#94a3b8", borderColor: "#334155" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
          >
            {loading ? "Creating..." : "Create Assessment"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
