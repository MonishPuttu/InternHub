"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  Schedule,
  Assignment,
  Cancel,
  EmojiEvents,
  ArrowBack,
  Business,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/dateUtils";

const STATUS_CONFIG = {
  applied: { label: "Applied", color: "#3b82f6", icon: Assignment },
  interview_scheduled: {
    label: "Interview Scheduled",
    color: "#f59e0b",
    icon: Schedule,
  },
  interviewed: {
    label: "Interview Completed",
    color: "#8b5cf6",
    icon: CheckCircle,
  },
  offered: { label: "Offer Received", color: "#10b981", icon: EmojiEvents },
  rejected: { label: "Not Selected", color: "#ef4444", icon: Cancel },
};

export default function TimelineDetailPage({ params }) {
  const { applicationId } = use(params);
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, [applicationId]);

  const fetchTimeline = async () => {
    try {
      const response = await apiRequest(
        `/api/timeline/application/${applicationId}/timeline`
      );
      if (response.ok) {
        setData(response.data);

        // Show confirmation dialog if interview scheduled and not confirmed
        if (
          response.data.application.application_status ===
            "interview_scheduled" &&
          !response.data.application.interview_confirmed
        ) {
          setShowConfirmDialog(true);
        }
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInterview = async (attended) => {
    setConfirming(true);
    try {
      const response = await apiRequest(
        `/api/timeline/application/${applicationId}/confirm-interview`,
        {
          method: "POST",
          body: JSON.stringify({ attended }),
        }
      );

      if (response.ok) {
        setShowConfirmDialog(false);
        fetchTimeline(); // Refresh timeline
      }
    } catch (error) {
      console.error("Error confirming interview:", error);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography sx={{ color: "text.secondary" }}>
          Timeline not found
        </Typography>
      </Container>
    );
  }

  const { application, post, timeline, currentStatus } = data;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/timeline")}
        sx={{ color: "#8b5cf6", mb: 3 }}
      >
        Back to Applications
      </Button>

      {/* Header Card */}
      <Card
        sx={{
          p: 4,
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ bgcolor: "#8b5cf6", width: 56, height: 56 }}>
            <Business sx={{ fontSize: 32 }} />
          </Avatar>
          <Box flex={1}>
            <Typography
              variant="h5"
              sx={{ color: "text.primary", fontWeight: "bold", mb: 0.5 }}
            >
              {post.position}
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              {post.company_name}
            </Typography>
          </Box>
          <Chip
            label={STATUS_CONFIG[currentStatus]?.label}
            sx={{
              bgcolor: `${STATUS_CONFIG[currentStatus]?.color}20`,
              color: STATUS_CONFIG[currentStatus]?.color,
              fontWeight: 600,
              fontSize: "0.875rem",
              px: 2,
              py: 2.5,
            }}
          />
        </Box>

        {post.package_offered && (
          <Box
            sx={{
              bgcolor: "background.default",
              p: 2,
              borderRadius: 1,
              border: "1px solid #1e293b",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <strong style={{ color: "#10b981" }}>Package Offered:</strong> ₹
              {post.package_offered} LPA
            </Typography>
          </Box>
        )}
      </Card>

      {/* Timeline Card */}
      <Card
        sx={{
          p: 4,
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: "bold", mb: 3 }}
        >
          Application Timeline
        </Typography>

        <Stepper
          activeStep={timeline.length - 1}
          orientation="vertical"
          sx={{
            "& .MuiStepLabel-root .Mui-completed": { color: "#10b981" },
            "& .MuiStepLabel-root .Mui-active": { color: "#8b5cf6" },
          }}
        >
          {timeline.map((event, index) => {
            const Icon = STATUS_CONFIG[event.event_type]?.icon || CheckCircle;
            const color = STATUS_CONFIG[event.event_type]?.color || "#64748b";

            return (
              <Step key={event.id} active completed>
                <StepLabel
                  StepIconComponent={() => (
                    <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                      <Icon sx={{ fontSize: 24 }} />
                    </Avatar>
                  )}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6" sx={{ color: "text.primary" }}>
                      {event.title}
                    </Typography>
                    <Chip
                      label={STATUS_CONFIG[event.event_type]?.label}
                      size="small"
                      sx={{
                        bgcolor: `${color}20`,
                        color: color,
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </StepLabel>

                <StepContent>
                  <Box sx={{ pl: 2, pt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      <Schedule
                        sx={{
                          fontSize: 16,
                          mr: 0.5,
                          verticalAlign: "middle",
                        }}
                      />
                      {formatDate(event.event_date)}
                    </Typography>

                    {event.description && (
                      <Typography
                        variant="body2"
                        sx={{ color: "#cbd5e1", mb: 2 }}
                      >
                        {event.description}
                      </Typography>
                    )}

                    {event.metadata && (
                      <Box
                        sx={{
                          bgcolor: "background.default",
                          p: 2,
                          borderRadius: 1,
                          border: "1px solid #1e293b",
                        }}
                      >
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <Typography
                            key={key}
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            <strong style={{ textTransform: "capitalize" }}>
                              {key.replace(/_/g, " ")}:
                            </strong>{" "}
                            {value}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </Card>

      {/* Interview Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "background.paper", border: "1px solid #334155" },
        }}
      >
        <DialogTitle sx={{ color: "text.primary" }}>
          Interview Attendance Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            Did you attend the interview scheduled on{" "}
            <strong style={{ color: "#f59e0b" }}>
              {application.interview_date &&
                formatDate(application.interview_date)}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleConfirmInterview(false)}
            disabled={confirming}
            sx={{ color: "text.secondary" }}
          >
            No, I didn't attend
          </Button>
          <Button
            onClick={() => handleConfirmInterview(true)}
            disabled={confirming}
            variant="contained"
            sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
          >
            {confirming ? "Confirming..." : "Yes, I attended"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
