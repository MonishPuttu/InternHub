// frontend/src/app/training/placement/assessments/[assessmentId]/page.jsx

"use client";

import { use } from "react";
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

export default function ViewAssessment({ params }) {
  const router = useRouter();
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
          }}
        >
          {assessment.description || "No description provided"}
        </Typography>

        {assessment.allowed_branches &&
          assessment.allowed_branches.length > 0 && (
            <Box mb={3}>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mb: 1,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  fontWeight: "600",
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

      {/* Questions Section - Keep your existing code */}
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

        {/* Keep your existing questions accordion code */}
      </Paper>
    </Container>
  );
}
