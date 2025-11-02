"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
} from "@mui/material";
import { Assignment, Schedule, CheckCircle } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function StudentTraining() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await apiRequest("/api/training/student/assessments");
      setAssessments(response.data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setError("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setOpenDialog(true);
  };

  const confirmStartAssessment = async () => {
    if (!selectedAssessment) return;

    setSubmitting(true);
    try {
      const response = await apiRequest(
        `/api/training/student/assessments/${selectedAssessment.id}/start`,
        { method: "POST" }
      );

      if (!response.data?.attempt?.id) {
        throw new Error("Failed to create attempt");
      }

      const attemptId = response.data.attempt.id;
      router.push(
        `/training/student/take-assessment/${selectedAssessment.id}?attemptId=${attemptId}`
      );
    } catch (error) {
      console.error("Error starting assessment:", error);
      alert(error.message || "Failed to start assessment");
      setSubmitting(false);
    }
    setOpenDialog(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "daily":
        return "primary";
      case "weekly":
        return "secondary";
      case "monthly":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#e2e8f0" }}>
          Available Assessments
        </Typography>
        <Typography variant="body1" sx={{ color: "#94a3b8" }}>
          Complete assessments to improve your placement readiness
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Cards Container - Using Box instead of Grid */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "100%",
        }}
      >
        {assessments.length === 0 ? (
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              width: "100%",
            }}
          >
            <Typography variant="h6" sx={{ color: "#94a3b8" }}>
              No assessments available at the moment
            </Typography>
          </Card>
        ) : (
          assessments.map((assessment) => (
            <Card
              key={assessment.id}
              elevation={3}
              sx={{
                bgcolor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 2,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#8b5cf6",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)",
                },
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                }}
              >
                {/* Header with Title and Type */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                  gap={2}
                  sx={{ width: "100%" }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#e2e8f0",
                      flex: 1,
                      minWidth: 0,
                      wordBreak: "break-word",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {assessment.title}
                  </Typography>
                  <Chip
                    label={assessment.type.toUpperCase()}
                    color={getTypeColor(assessment.type)}
                    size="small"
                    sx={{ flexShrink: 0 }}
                  />
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "#94a3b8",
                    mb: 2,
                    wordBreak: "break-word",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    textOverflow: "ellipsis",
                    minHeight: "3em",
                    width: "100%",
                  }}
                >
                  {assessment.description || "No description provided"}
                </Typography>

                {/* Duration and Marks */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Schedule
                    fontSize="small"
                    sx={{ color: "#8b5cf6", flexShrink: 0 }}
                  />
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    Duration: {assessment.duration} minutes
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Assignment
                    fontSize="small"
                    sx={{ color: "#8b5cf6", flexShrink: 0 }}
                  />
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    Total Marks: {assessment.totalMarks}
                  </Typography>
                </Box>

                {/* Button or Completed Status */}
                <Box mt="auto">
                  {assessment.isAttempted ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircle sx={{ color: "#10b981" }} />
                      <Chip
                        label="Completed"
                        sx={{
                          bgcolor: "#10b98120",
                          color: "#10b981",
                        }}
                      />
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleStartAssessment(assessment)}
                      sx={{
                        bgcolor: "#8b5cf6",
                        color: "#fff",
                        "&:hover": { bgcolor: "#7c3aed" },
                        textTransform: "none",
                        fontSize: "1rem",
                      }}
                    >
                      Start Assessment
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: "#e2e8f0", fontWeight: "bold" }}>
          Start Assessment
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: "#e2e8f0", mb: 2 }}>
            Are you sure you want to start{" "}
            <strong>"{selectedAssessment?.title}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
            Duration: {selectedAssessment?.duration} minutes
          </Typography>
          <Alert
            severity="warning"
            sx={{ bgcolor: "#f59e0b20", color: "#f59e0b" }}
          >
            Once started, the timer cannot be paused. Make sure you have enough
            time to complete the assessment.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={submitting}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmStartAssessment}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#8b5cf6",
              color: "#fff",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            {submitting ? "Starting..." : "Start Now"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
