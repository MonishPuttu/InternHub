"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ViewAssessment({ params: paramsPromise }) {
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const extractParams = async () => {
      try {
        const resolvedParams = await paramsPromise;
        if (!resolvedParams?.assessmentId) {
          setLoading(false);
          return;
        }
        setAssessmentId(resolvedParams.assessmentId);
        await fetchAssessmentDetails(resolvedParams.assessmentId);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    extractParams();
  }, [paramsPromise]);

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
        <Typography variant="h6" sx={{ color: "#94a3b8" }}>
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
        sx={{ mb: 3, color: "#8b5cf6" }}
      >
        Back to Assessments
      </Button>

      {/* Assessment Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="start"
          mb={3}
          gap={2}
        >
          <Box flex={1} minWidth={0}>
            <Typography
              variant="h4"
              sx={{
                color: "#e2e8f0",
                wordBreak: "break-word",
                fontWeight: "bold",
              }}
            >
              {assessment.title}
            </Typography>
          </Box>
          <Chip
            label={assessment.type.toUpperCase()}
            sx={{
              bgcolor: "#8b5cf620",
              color: "#8b5cf6",
              flexShrink: 0,
            }}
          />
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: "#94a3b8",
            mb: 3,
            wordBreak: "break-word",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
          }}
        >
          {assessment.description || "No description provided"}
        </Typography>

        <Divider sx={{ my: 3, bgcolor: "#334155" }} />

        {/* Metrics Grid - Responsive */}
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
              bgcolor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#8b5cf6",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                {assessment.duration}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                }}
              >
                Minutes
              </Typography>
            </CardContent>
          </Card>

          {/* Total Marks */}
          <Card
            sx={{
              bgcolor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#10b981",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                {assessment.total_marks}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                }}
              >
                Total Marks
              </Typography>
            </CardContent>
          </Card>

          {/* Passing Marks */}
          <Card
            sx={{
              bgcolor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#f59e0b",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                {assessment.passing_marks}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                }}
              >
                Passing Marks
              </Typography>
            </CardContent>
          </Card>

          {/* Questions Count */}
          <Card
            sx={{
              bgcolor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#06b6d4",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                {questions.length}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
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
            bgcolor: "#0f172a",
            p: 2.5,
            borderRadius: 1,
            border: "1px solid #334155",
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                mb: 0.5,
                textTransform: "uppercase",
                fontSize: "0.75rem",
              }}
            >
              Start Date
            </Typography>
            <Typography
              sx={{
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              {new Date(assessment.start_date).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                mb: 0.5,
                textTransform: "uppercase",
                fontSize: "0.75rem",
              }}
            >
              End Date
            </Typography>
            <Typography
              sx={{
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              {new Date(assessment.end_date).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Questions Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: "#e2e8f0",
            mb: 3,
            fontWeight: "bold",
          }}
        >
          Questions ({questions.length})
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {questions.map((question, index) => (
            <Accordion
              key={question.id}
              sx={{
                bgcolor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 1,
                "&:before": { display: "none" },
                "&:hover": { borderColor: "#8b5cf6" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: "#8b5cf6" }} />}
                sx={{
                  p: 2,
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  width="100%"
                  sx={{ minWidth: 0 }}
                >
                  <Chip
                    label={`Q${index + 1}`}
                    size="small"
                    sx={{
                      bgcolor: "#8b5cf620",
                      color: "#8b5cf6",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      color: "#e2e8f0",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {question.question_text}
                  </Typography>
                  <Chip
                    label={`${question.marks} marks`}
                    size="small"
                    sx={{
                      bgcolor: "#10b98120",
                      color: "#10b981",
                      flexShrink: 0,
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3, bgcolor: "#0f172a" }}>
                <Box>
                  {/* Full Question Text */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#e2e8f0",
                      mb: 2,
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {question.question_text}
                  </Typography>

                  {/* Question Metadata */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#94a3b8",
                        bgcolor: "#1e293b",
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                      }}
                    >
                      Type: {question.question_type}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#94a3b8",
                        bgcolor: "#1e293b",
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                      }}
                    >
                      Difficulty: {question.difficulty}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2, bgcolor: "#334155" }} />

                  {/* Options */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#e2e8f0",
                      mb: 2,
                      fontWeight: "bold",
                    }}
                  >
                    Options:
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    {question.options.map((option, optIndex) => (
                      <Box
                        key={option.id}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          border: "1px solid #334155",
                          bgcolor: question.correct_answer.includes(
                            option.id.toString()
                          )
                            ? "#10b98115"
                            : "#0f172a",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box sx={{ flexShrink: 0 }}>
                          {question.correct_answer.includes(
                            option.id.toString()
                          ) && (
                            <CheckCircle
                              sx={{
                                color: "#10b981",
                                fontSize: 24,
                              }}
                            />
                          )}
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              color: question.correct_answer.includes(
                                option.id.toString()
                              )
                                ? "#10b981"
                                : "#e2e8f0",
                              wordBreak: "break-word",
                            }}
                          >
                            <strong>
                              {String.fromCharCode(65 + optIndex)}.
                            </strong>{" "}
                            {option.text}
                          </Typography>
                          {question.correct_answer.includes(
                            option.id.toString()
                          ) && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#10b981",
                                mt: 0.5,
                                display: "block",
                              }}
                            >
                              ✓ Correct Answer
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <Box mt={2}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          mb: 1,
                          textTransform: "uppercase",
                          fontSize: "0.75rem",
                        }}
                      >
                        Tags:
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {question.tags.map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: "#64748b20",
                              color: "#94a3b8",
                              border: "1px solid #64748b40",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}
