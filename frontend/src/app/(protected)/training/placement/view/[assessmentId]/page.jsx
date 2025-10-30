"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
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
  const { assessmentId } = params;
  const router = useRouter();
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentDetails();
  }, []);

  const fetchAssessmentDetails = async () => {
    try {
      const response = await apiRequest(
        `/api/training/assessments/${assessmentId}`
      );
      setAssessmentData(response.data);
    } catch (error) {
      console.error("Error fetching assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
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

      {/* Assessment Details */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="start"
          mb={3}
          gap={2}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#e2e8f0",
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
              minWidth: 0, // Allows text to shrink
            }}
          >
            {assessment.title}
          </Typography>
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
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {assessment.description || "No description provided"}
        </Typography>

        {/* Stats Cards - Responsive Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: "#0f172a",
                border: "1px solid #334155",
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <CardContent sx={{ textAlign: "center", width: "100%", p: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#8b5cf6",
                    fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  }}
                >
                  {assessment.duration}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#94a3b8",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Minutes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: "#0f172a",
                border: "1px solid #334155",
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <CardContent sx={{ textAlign: "center", width: "100%", p: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#10b981",
                    fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  }}
                >
                  {assessment.total_marks}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#94a3b8",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Total Marks
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: "#0f172a",
                border: "1px solid #334155",
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <CardContent sx={{ textAlign: "center", width: "100%", p: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#f59e0b",
                    fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  }}
                >
                  {assessment.passing_marks}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#94a3b8",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Passing Marks
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: "#0f172a",
                border: "1px solid #334155",
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <CardContent sx={{ textAlign: "center", width: "100%", p: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#8b5cf6",
                    fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  }}
                >
                  {questions.length}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#94a3b8",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Questions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: "#334155" }} />

        {/* Date Information */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            p: 3,
            bgcolor: "#0f172a",
            borderRadius: 2,
            border: "1px solid #334155",
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
              Start Date
            </Typography>
            <Typography
              sx={{
                color: "#e2e8f0",
                wordBreak: "break-word",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {new Date(assessment.start_date).toLocaleString()}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
              End Date
            </Typography>
            <Typography
              sx={{
                color: "#e2e8f0",
                wordBreak: "break-word",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {new Date(assessment.end_date).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Questions */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          overflow: "hidden",
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ color: "#e2e8f0", mb: 3 }}>
          Questions ({questions.length})
        </Typography>

        {questions.map((question, index) => (
          <Accordion
            key={question.id}
            sx={{
              bgcolor: "#0f172a",
              border: "1px solid #334155",
              mb: 2,
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: "#8b5cf6" }} />}
              sx={{
                "&:hover": { bgcolor: "#1e293b" },
                minHeight: "auto",
                "& .MuiAccordionSummary-content": {
                  margin: "12px 0",
                  overflow: "hidden",
                },
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
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
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
            <AccordionDetails>
              <Box sx={{ pl: 2 }}>
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

                <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                  Type: {question.question_type} | Difficulty:{" "}
                  {question.difficulty}
                </Typography>

                <Typography
                  variant="subtitle2"
                  sx={{ color: "#94a3b8", mb: 1 }}
                >
                  Options:
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 1,
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
                          ? "#10b98120"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {question.correct_answer.includes(
                        option.id.toString()
                      ) && (
                        <CheckCircle
                          sx={{ color: "#10b981", fontSize: 20, flexShrink: 0 }}
                        />
                      )}
                      <Typography
                        sx={{
                          color: question.correct_answer.includes(
                            option.id.toString()
                          )
                            ? "#10b981"
                            : "#e2e8f0",
                          wordBreak: "break-word",
                          flex: 1,
                        }}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {question.tags && question.tags.length > 0 && (
                  <Box mt={2}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", mb: 1 }}
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
      </Paper>
    </Container>
  );
}
