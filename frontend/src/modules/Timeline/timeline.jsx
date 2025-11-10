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
  Tabs,
  Tab,
} from "@mui/material";
import {
  Business,
  Schedule,
  NavigateNext,
  Assignment,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { apiRequest } from "@/lib/api";

const STATUS_CONFIG = {
  applied: { label: "Applied", color: "#3b82f6" },
  interview_scheduled: { label: "Interview Scheduled", color: "#f59e0b" },
  interviewed: { label: "Interviewed", color: "#8b5cf6" },
  offered: { label: "Offer Received", color: "#10b981" },
  rejected: { label: "Not Selected", color: "#ef4444" },
};

export default function TimelinePage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await apiRequest("/api/timeline/my-applications");
      if (response.ok) {
        setApplications(response.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimeline = (applicationId) => {
    router.push(`/timeline/${applicationId}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const ongoingApplications = applications.filter(
    ({ application }) =>
      application.application_status === "applied" ||
      application.application_status === "interview_scheduled" ||
      application.application_status === "interviewed"
  );

  const completedApplications = applications.filter(
    ({ application }) =>
      application.application_status === "offered" ||
      application.application_status === "rejected"
  );

  const currentApplications =
    activeTab === 0 ? ongoingApplications : completedApplications;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Assignment sx={{ fontSize: 32, color: "#8b5cf6" }} />
        <Typography
          variant="h4"
          sx={{ color: "text.primary", fontWeight: "bold" }}
        >
          My Applications
        </Typography>
      </Box>

      {applications.length === 0 ? (
        <Card
          sx={{
            p: 4,
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
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
        </Card>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "#334155", mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  color: "text.secondary",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  "&.Mui-selected": {
                    color: "#8b5cf6",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#8b5cf6",
                  height: 3,
                },
              }}
            >
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>Ongoing</span>
                    <Chip
                      label={ongoingApplications.length}
                      size="small"
                      sx={{
                        bgcolor: "#3b82f620",
                        color: "#3b82f6",
                        height: 20,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>
                }
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>Completed</span>
                    <Chip
                      label={completedApplications.length}
                      size="small"
                      sx={{
                        bgcolor: "#64748b20",
                        color: "text.secondary",
                        height: 20,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>
                }
              />
            </Tabs>
          </Box>

          {/* ✅ NEW: Flexbox Layout - 2 cards per row with equal width */}
          {currentApplications.length === 0 ? (
            <Card
              sx={{
                p: 4,
                bgcolor: "background.paper",
                border: "1px solid #334155",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "text.secondary" }}>
                No {activeTab === 0 ? "ongoing" : "completed"} applications
              </Typography>
            </Card>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              {currentApplications.map(({ application, post }) => {
                const status =
                  STATUS_CONFIG[application.application_status] ||
                  STATUS_CONFIG.applied;

                return (
                  <Box
                    key={application.id}
                    sx={{
                      flex: "1 1 calc(50% - 12px)", // ✅ 50% width minus gap
                      minWidth: "300px", // Minimum width for mobile
                      maxWidth: "calc(50% - 12px)", // Maximum 50% width
                    }}
                  >
                    <Card
                      sx={{
                        p: 3,
                        bgcolor: "background.paper",
                        border: "1px solid #334155",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        "&:hover": {
                          borderColor: "#8b5cf6",
                          boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)",
                          transform: "translateY(-4px)",
                        },
                      }}
                      onClick={() => handleViewTimeline(application.id)}
                    >
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        gap={2}
                        mb={2}
                      >
                        <Avatar
                          sx={{ bgcolor: "#8b5cf6", width: 48, height: 48 }}
                        >
                          <Business />
                        </Avatar>
                        <Box flex={1} minWidth={0}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "text.primary",
                              fontWeight: "bold",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {post.position}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {post.company_name}
                          </Typography>
                        </Box>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            bgcolor: `${status.color}20`,
                            color: status.color,
                            fontWeight: 500,
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Schedule
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Applied{" "}
                          {new Date(
                            application.applied_at
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {post.package_offered && (
                        <Typography
                          variant="body2"
                          sx={{ color: "#10b981", fontWeight: 500, mb: 2 }}
                        >
                          Package: ₹{post.package_offered} LPA
                        </Typography>
                      )}

                      <Button
                        variant="outlined"
                        fullWidth
                        endIcon={<NavigateNext />}
                        sx={{
                          mt: "auto",
                          color: "#8b5cf6",
                          borderColor: "#8b5cf6",
                          "&:hover": {
                            borderColor: "#7c3aed",
                            bgcolor: "#8b5cf610",
                          },
                        }}
                      >
                        View Timeline
                      </Button>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
