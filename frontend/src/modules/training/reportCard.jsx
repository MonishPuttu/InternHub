"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  TrendingUp,
  TrendingDown,
  ArrowBack,
} from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function ReportCard({ params }) {
  const { attemptId } = params;
  const router = useRouter();
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!attemptId) {
      setError("Attempt ID is missing");
      setLoading(false);
      setTimeout(() => router.push("/training/student"), 2000);
      return;
    }
    fetchReportCard();
  }, [attemptId, router]);

  const fetchReportCard = async () => {
    try {
      if (!attemptId) {
        throw new Error("Attempt ID is required");
      }

      const response = await apiRequest(
        `/api/training/student/report-cards/${attemptId}`
      );

      if (!response.data) {
        throw new Error("Report card not found");
      }

      setReportCard(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching report card:", error);
      setError(error.message || "Failed to load report card");
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/training/student")}
          sx={{ color: "#8b5cf6" }}
        >
          Back to Assessments
        </Button>
      </Container>
    );
  }

  if (!reportCard) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Report card is still being generated. Please refresh in a moment.
        </Alert>
        <Button
          onClick={fetchReportCard}
          variant="contained"
          sx={{ bgcolor: "#8b5cf6", color: "#fff" }}
        >
          Refresh
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/training/student")}
        sx={{ mb: 3, color: "#8b5cf6" }}
      >
        Back to Assessments
      </Button>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom sx={{ color: "#e2e8f0" }}>
            Assessment Report Card
          </Typography>
          <Typography variant="h6" sx={{ color: "#94a3b8" }}>
            {reportCard.assessmentTitle}
          </Typography>
        </Box>

        {/* Score Summary */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "#0f172a",
                border: "2px solid #8b5cf6",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Typography
                  variant="h3"
                  sx={{ color: "#8b5cf6", fontWeight: "bold" }}
                >
                  {reportCard.percentageScore}%
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1 }}>
                  Percentage Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "#0f172a",
                border: "2px solid #10b981",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Typography
                  variant="h3"
                  sx={{ color: "#10b981", fontWeight: "bold" }}
                >
                  {reportCard.overallScore}
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1 }}>
                  Total Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={2}
              sx={{
                bgcolor: "#0f172a",
                border: "2px solid #f59e0b",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Typography
                  variant="h3"
                  sx={{ color: "#f59e0b", fontWeight: "bold" }}
                >
                  {reportCard.grade}
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1 }}>
                  Grade
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: "#334155" }} />

        {/* Strengths */}
        {reportCard.strengths && reportCard.strengths.length > 0 && (
          <Box mb={3}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingUp sx={{ color: "#10b981" }} />
              <Typography variant="h6" sx={{ color: "#e2e8f0" }}>
                Strengths
              </Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {reportCard.strengths.map((strength, index) => (
                <Chip
                  key={index}
                  label={strength}
                  icon={<CheckCircle />}
                  sx={{
                    bgcolor: "#10b98120",
                    color: "#10b981",
                    border: "1px solid #10b981",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Weaknesses */}
        {reportCard.weaknesses && reportCard.weaknesses.length > 0 && (
          <Box mb={3}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingDown sx={{ color: "#ef4444" }} />
              <Typography variant="h6" sx={{ color: "#e2e8f0" }}>
                Areas to Improve
              </Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {reportCard.weaknesses.map((weakness, index) => (
                <Chip
                  key={index}
                  label={weakness}
                  icon={<Cancel />}
                  sx={{
                    bgcolor: "#ef444420",
                    color: "#ef4444",
                    border: "1px solid #ef4444",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3, bgcolor: "#334155" }} />

        {/* Recommendations */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: "#e2e8f0" }}>
            Recommendations
          </Typography>
          <Typography variant="body1" sx={{ color: "#94a3b8" }}>
            {reportCard.recommendations}
          </Typography>
        </Box>

        {/* Generated Date */}
        <Box mt={4} textAlign="center">
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            Generated on:{" "}
            {new Date(reportCard.generatedAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
