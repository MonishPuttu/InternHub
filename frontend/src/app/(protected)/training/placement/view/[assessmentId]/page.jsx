"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ArrowBack, ExpandMore, CheckCircle } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function ViewAssessment({ params }) {
  const router = useRouter();
  const theme = useTheme();
  const { assessmentId } = use(params);
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assessmentId) {
      fetchAssessmentDetails(assessmentId);
    }
  }, [assessmentId]);

  const fetchAssessmentDetails = async (id) => {
    try {
      const response = await apiRequest(`/api/training/assessments/${id}`);
      setAssessmentData(response.data);
    } catch (error) {
      console.error("Error fetching assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress sx={{ mt: 4 }} />;
  }

  if (!assessmentData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          Assessment not found
        </Typography>
      </Container>
    );
  }

  const { assessment, questions } = assessmentData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/training/placement")}
        sx={{ mb: 3, color: "#8b5cf6", textTransform: "none" }}
      >
        Back to Assessments
      </Button>

      {/* Assessment Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
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
              variant="h4"
              sx={{
                color: "text.primary",
                wordBreak: "break-word",
                fontWeight: "bold",
              }}
            >
              {assessment.title}
            </Typography>
          </Box>
          <Chip
            label={assessment.type?.toUpperCase()}
            sx={{
              bgcolor: "#8b5cf620",
              color: "#8b5cf6",
              flexShrink: 0,
              fontWeight: "500",
            }}
          />
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mb: 3,
            wordBreak: "break-word",
          }}
        >
          {assessment.description || "No description provided"}
        </Typography>

        {assessment.allowed_branches &&
          assessment.allowed_branches.length > 0 && (
            <Box mb={3}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  mb: 1,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  display: "block",
                }}
              >
                Target Departments
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {assessment.allowed_branches.map((branch) => (
                  <Chip
                    key={branch}
                    label={branch}
                    sx={{
                      bgcolor: "#8b5cf620",
                      color: "#8b5cf6",
                      border: "1px solid #8b5cf640",
                      fontWeight: "500",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

        <Divider sx={{ my: 3, bgcolor: "#334155" }} />

        {/* Metrics Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Duration */}
          <Card
            sx={{
              bgcolor: "background.default",
              border: "1px solid #334155",
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                sx={{
                  color: "#06b6d4",
                  fontWeight: "bold",
                  mb: 0.5,
                  fontSize: "1.5rem",
                }}
              >
                {assessment.duration}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                  fontWeight: "600",
                }}
              >
                Minutes
              </Typography>
            </CardContent>
          </Card>

          {/* Total Marks */}
          <Card
            sx={{
              bgcolor: "background.default",
              border: "1px solid #334155",
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                sx={{
                  color: "#10b981",
                  fontWeight: "bold",
                  mb: 0.5,
                  fontSize: "1.5rem",
                }}
              >
                {assessment.total_marks}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                  fontWeight: "600",
                }}
              >
                Total Marks
              </Typography>
            </CardContent>
          </Card>

          {/* Passing Marks */}
          <Card
            sx={{
              bgcolor: "background.default",
              border: "1px solid #334155",
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                sx={{
                  color: "#f59e0b",
                  fontWeight: "bold",
                  mb: 0.5,
                  fontSize: "1.5rem",
                }}
              >
                {assessment.passing_marks}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                  fontWeight: "600",
                }}
              >
                Passing Marks
              </Typography>
            </CardContent>
          </Card>

          {/* Questions Count */}
          <Card
            sx={{
              bgcolor: "background.default",
              border: "1px solid #334155",
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                sx={{
                  color: "#8b5cf6",
                  fontWeight: "bold",
                  mb: 0.5,
                  fontSize: "1.5rem",
                }}
              >
                {questions?.length || 0}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                  fontWeight: "600",
                }}
              >
                Questions
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ my: 3, bgcolor: "#334155" }} />

        {/* Date Information */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            bgcolor: "background.default",
            p: 2.5,
            borderRadius: 1,
            border: "1px solid #334155",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                mb: 1,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "block",
              }}
            >
              Start Date
            </Typography>
            <Typography
              sx={{
                color: "text.primary",
                fontWeight: "500",
                fontSize: "0.95rem",
              }}
            >
              {new Date(assessment.start_date).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                mb: 1,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "block",
              }}
            >
              End Date
            </Typography>
            <Typography
              sx={{
                color: "text.primary",
                fontWeight: "500",
                fontSize: "0.95rem",
              }}
            >
              {new Date(assessment.end_date).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ✅ Questions Section - Only show if NOT premade OR has questions */}
      {assessment.type !== "premade" && questions && questions.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "text.primary",
              mb: 3,
              fontWeight: "bold",
            }}
          >
            Questions ({questions?.length || 0})
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {questions.map((question, index) => (
              <Accordion
                key={question.id || index}
                sx={{
                  bgcolor: "background.default",
                  border: "1px solid #334155",
                  borderRadius: 1,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "#8b5cf6" }} />}
                  sx={{
                    bgcolor: "background.default",
                    borderBottom: "1px solid #334155",
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={`Q${index + 1}`}
                      size="small"
                      sx={{
                        bgcolor: "#8b5cf620",
                        color: "#8b5cf6",
                        fontWeight: "600",
                      }}
                    />
                    <Chip
                      label={question.type?.toUpperCase() || "MCQ"}
                      size="small"
                      sx={{
                        bgcolor: "#06b6d420",
                        color: "#06b6d4",
                        fontWeight: "600",
                      }}
                    />
                    <Typography
                      sx={{
                        color: "text.primary",
                        flex: 1,
                        minWidth: 0,
                        wordBreak: "break-word",
                        fontSize: "0.95rem",
                      }}
                    >
                      {question.text || question.question}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ bgcolor: "background.default", p: 3 }}>
                  {question.options && question.options.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          textTransform: "uppercase",
                          fontWeight: "600",
                          mb: 1,
                          display: "block",
                        }}
                      >
                        Options:
                      </Typography>
                      {question.options.map((option, optIndex) => {
                        // ✅ FIXED: Moved const declaration INSIDE the map callback
                        const isCorrectAnswer = option.isCorrect === true;

                        return (
                          <Box
                            key={optIndex}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 2,
                              p: 1.5,
                              bgcolor: "background.paper",
                              borderRadius: 1,
                              border: isCorrectAnswer
                                ? "1px solid #10b98140"
                                : "1px solid #334155",
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#8b5cf6",
                                fontWeight: "600",
                                minWidth: "24px",
                                flexShrink: 0,
                              }}
                            >
                              {String.fromCharCode(65 + optIndex)}.
                            </Typography>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  color: isCorrectAnswer
                                    ? "#10b981"
                                    : "#e2e8f0",
                                  fontWeight: isCorrectAnswer ? "600" : "400",
                                  wordBreak: "break-word",
                                }}
                              >
                                {option.text}
                              </Typography>
                            </Box>
                            {isCorrectAnswer && (
                              <CheckCircle
                                sx={{
                                  color: "#10b981",
                                  fontSize: 20,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ color: "text.secondary" }}>
                      No options available
                    </Typography>
                  )}

                  {question.explanation && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #334155" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          textTransform: "uppercase",
                          fontWeight: "600",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Explanation:
                      </Typography>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.9rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {question.explanation}
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
}
