"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  Typography,
  Chip,
  Box,
  Button,
  Avatar,
  CircularProgress,
  Collapse,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Business,
  Schedule,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Assignment,
  Cancel,
  EmojiEvents,
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
  "interview-scheduled": {
    label: "Interview Scheduled",
    color: "#f59e0b",
    icon: Schedule,
  },
  interviewed: {
    label: "Interviewed",
    color: "#8b5cf6",
    icon: CheckCircle,
  },
  "offer-pending": {
    label: "Offer Pending",
    color: "#f59e0b",
    icon: EmojiEvents,
  },
  offer_pending: {
    label: "Offer Pending",
    color: "#f59e0b",
    icon: EmojiEvents,
  },
  "offer-approved": {
    label: "Offer Approved",
    color: "#10b981",
    icon: EmojiEvents,
  },
  offer_approved: {
    label: "Offer Approved",
    color: "#10b981",
    icon: EmojiEvents,
  },
  offered: { label: "Offer Received", color: "#10b981", icon: EmojiEvents },
  rejected: { label: "Not Selected", color: "#ef4444", icon: Cancel },
  "rejected-by-placement": {
    label: "Rejected by Placement",
    color: "#ef4444",
    icon: Cancel,
  },
  rejected_by_placement: {
    label: "Rejected by Placement",
    color: "#ef4444",
    icon: Cancel,
  },
};

export default function TimelinePage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [timelineData, setTimelineData] = useState({});
  const [loadingTimeline, setLoadingTimeline] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await apiRequest("/api/timeline/my-applications");
      console.log("Timeline API Response:", response);

      if (response.ok) {
        setApplications(response.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (applicationId) => {
    if (timelineData[applicationId]) return; // Already loaded

    setLoadingTimeline((prev) => ({ ...prev, [applicationId]: true }));
    try {
      const response = await apiRequest(
        `/api/timeline/application/${applicationId}/timeline`
      );
      if (response.ok) {
        setTimelineData((prev) => ({
          ...prev,
          [applicationId]: response.data,
        }));

        // Check if interview confirmation needed
        if (
          response.data.application.application_status ===
            "interview_scheduled" &&
          !response.data.application.interview_confirmed
        ) {
          setSelectedApplication(response.data.application);
          setShowConfirmDialog(true);
        }
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setLoadingTimeline((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleToggleExpand = (applicationId) => {
    if (expandedId === applicationId) {
      setExpandedId(null);
    } else {
      setExpandedId(applicationId);
      fetchTimeline(applicationId);
    }
  };

  const handleConfirmInterview = async (attended) => {
    if (!selectedApplication) return;

    setConfirming(true);
    try {
      const response = await apiRequest(
        `/api/timeline/application/${selectedApplication.id}/confirm-interview`,
        {
          method: "POST",
          body: JSON.stringify({ attended }),
        }
      );

      if (response.ok) {
        setShowConfirmDialog(false);
        // Refresh timeline data
        setTimelineData((prev) => {
          const newData = { ...prev };
          delete newData[selectedApplication.id];
          return newData;
        });
        fetchTimeline(selectedApplication.id);
        fetchApplications();
      }
    } catch (error) {
      console.error("Error confirming interview:", error);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          My Applications
        </Typography>
        <Chip
          label={`${applications.length} Total`}
          sx={{
            bgcolor: "#8b5cf620",
            color: "#8b5cf6",
            fontWeight: 600,
            fontSize: "0.95rem",
            px: 2,
            py: 2.5,
          }}
        />
      </Box>

      {applications.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            No applications yet. Apply to jobs to see them here!
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/Post")}
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Browse Jobs
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {applications.map(({ application, post }) => {
            const status =
              STATUS_CONFIG[application.application_status] ||
              STATUS_CONFIG.applied;
            const isExpanded = expandedId === application.id;
            const timeline = timelineData[application.id];

            return (
              <Card
                key={application.id}
                sx={{
                  border: "1px solid",
                  borderColor: isExpanded ? "#8b5cf6" : "divider",
                  transition: "all 0.2s",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                  onClick={() => handleToggleExpand(application.id)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#8b5cf620",
                        color: "#8b5cf6",
                        width: 48,
                        height: 48,
                      }}
                    >
                      <Business />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {post.position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {post.company_name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <Schedule
                          fontSize="small"
                          sx={{ color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Applied{" "}
                          {new Date(application.applied_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {post.package_offered && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: "#10b981", fontWeight: 600 }}
                        >
                          Package: ₹{post.package_offered} LPA
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Chip
                        label={status.label}
                        sx={{
                          bgcolor: `${status.color}20`,
                          color: status.color,
                          fontWeight: 600,
                        }}
                      />
                      {isExpanded ? (
                        <ExpandLess sx={{ color: "#8b5cf6" }} />
                      ) : (
                        <ExpandMore sx={{ color: "text.secondary" }} />
                      )}
                    </Box>
                  </Box>
                </Box>

                <Collapse in={isExpanded}>
                  <Box
                    sx={{
                      px: 3,
                      pb: 3,
                      pt: 1,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                    }}
                  >
                    {loadingTimeline[application.id] ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <CircularProgress
                          size={32}
                          sx={{ color: "#8b5cf6" }}
                        />
                      </Box>
                    ) : timeline ? (
                      <>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 3,
                            color: "text.primary",
                          }}
                        >
                          Application Timeline
                        </Typography>

                        <Stepper
                          activeStep={timeline.timeline.length - 1}
                          orientation="vertical"
                          sx={{
                            "& .MuiStepLabel-root .Mui-completed": {
                              color: "#10b981",
                            },
                            "& .MuiStepLabel-root .Mui-active": {
                              color: "#8b5cf6",
                            },
                          }}
                        >
                          {timeline.timeline.map((event) => {
                            const Icon =
                              STATUS_CONFIG[event.event_type]?.icon ||
                              CheckCircle;
                            const color =
                              STATUS_CONFIG[event.event_type]?.color ||
                              "#64748b";

                            return (
                              <Step key={event.id} active completed>
                                <StepLabel
                                  StepIconComponent={() => (
                                    <Avatar
                                      sx={{
                                        bgcolor: color,
                                        width: 40,
                                        height: 40,
                                      }}
                                    >
                                      <Icon sx={{ fontSize: 24 }} />
                                    </Avatar>
                                  )}
                                >
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={2}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{ color: "text.primary" }}
                                    >
                                      {event.title}
                                    </Typography>
                                    <Chip
                                      label={
                                        STATUS_CONFIG[event.event_type]?.label
                                      }
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
                                      sx={{
                                        color: "text.secondary",
                                        mb: 1,
                                      }}
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
                                        sx={{
                                          color: "text.secondary",
                                          mb: 2,
                                        }}
                                      >
                                        {event.description}
                                      </Typography>
                                    )}

                                    {event.metadata && (
                                      <Box
                                        sx={{
                                          bgcolor: "background.paper",
                                          p: 2,
                                          borderRadius: 1,
                                          border: "1px solid",
                                          borderColor: "divider",
                                        }}
                                      >
                                        {Object.entries(event.metadata).map(
                                          ([key, value]) => (
                                            <Typography
                                              key={key}
                                              variant="body2"
                                              sx={{ color: "text.secondary" }}
                                            >
                                              <strong
                                                style={{
                                                  textTransform: "capitalize",
                                                }}
                                              >
                                                {key.replace(/_/g, " ")}:
                                              </strong>{" "}
                                              {value}
                                            </Typography>
                                          )
                                        )}
                                      </Box>
                                    )}
                                  </Box>
                                </StepContent>
                              </Step>
                            );
                          })}
                        </Stepper>
                      </>
                    ) : null}
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </Box>
      )}

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
              {selectedApplication?.interview_date &&
                formatDate(selectedApplication.interview_date)}
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