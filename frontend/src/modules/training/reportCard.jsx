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
  LinearProgress,
  Button,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function ReportCard({ params: paramsPromise }) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState(null);
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const extractParams = async () => {
      try {
        const resolvedParams = await paramsPromise;

        if (!resolvedParams?.attemptId) {
          setError("Attempt ID is missing");
          setLoading(false);
          setTimeout(() => router.push("/training/student"), 2000);
          return;
        }

        setAttemptId(resolvedParams.attemptId);
        await fetchReportCard(resolvedParams.attemptId);
      } catch (err) {
        console.error("Error extracting params:", err);
        setError("Failed to load report card");
        setLoading(false);
      }
    };

    extractParams();
  }, [paramsPromise, router]);

  const fetchReportCard = async (attemptIdParam) => {
    try {
      if (!attemptIdParam) {
        throw new Error("Attempt ID is required");
      }

      const response = await apiRequest(
        `/api/training/student/report-cards/${attemptIdParam}`
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
          onClick={() => fetchReportCard(attemptId)}
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
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
          width: "100%",
        }}
      >
        {/* Header Section */}
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: "text.primary",
              fontWeight: "bold",
              wordBreak: "break-word",
            }}
          >
            Assessment Report Card
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              wordBreak: "break-word",
            }}
          >
            {reportCard.assessmentTitle}
          </Typography>
        </Box>

        {/* Score Summary - Single Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 2,
            width: "100%",
          }}
        >
          {/* Percentage Score */}
          <Card
            elevation={2}
            sx={{
              bgcolor: "background.default",
              border: "2px solid #8b5cf6",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{
                  color: "#8b5cf6",
                  fontWeight: "bold",
                  mb: 1,
                }}
              >
                {reportCard.percentageScore}%
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Percentage
              </Typography>
            </CardContent>
          </Card>

          {/* Total Score */}
          <Card
            elevation={2}
            sx={{
              bgcolor: "background.default",
              border: "2px solid #10b981",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{
                  color: "#10b981",
                  fontWeight: "bold",
                  mb: 1,
                }}
              >
                {reportCard.overallScore}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Score
              </Typography>
            </CardContent>
          </Card>

          {/* Grade */}
          <Card
            elevation={2}
            sx={{
              bgcolor: "background.default",
              border: "2px solid #f59e0b",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{
                  color: "#f59e0b",
                  fontWeight: "bold",
                  mb: 1,
                }}
              >
                {reportCard.grade}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Grade
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Generated Date */}
        <Box textAlign="center" mt={4}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Generated on:{" "}
            <span style={{ color: "text.secondary", fontWeight: "bold" }}>
              {new Date(reportCard.generatedAt).toLocaleDateString()}
            </span>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
