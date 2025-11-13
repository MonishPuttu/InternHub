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

// ✅ Fixed: Added all possible status variations
const STATUS_CONFIG = {
  applied: { label: "Applied", color: "#3b82f6" },
  interview_scheduled: { label: "Interview Scheduled", color: "#f59e0b" },
  "interview-scheduled": { label: "Interview Scheduled", color: "#f59e0b" },
  interviewed: { label: "Interviewed", color: "#8b5cf6" },
  "offer-pending": { label: "Offer Pending", color: "#f59e0b" },
  offer_pending: { label: "Offer Pending", color: "#f59e0b" },
  "offer-approved": { label: "Offer Approved", color: "#10b981" },
  offer_approved: { label: "Offer Approved", color: "#10b981" },
  offered: { label: "Offer Received", color: "#10b981" },
  rejected: { label: "Not Selected", color: "#ef4444" },
  "rejected-by-placement": { label: "Rejected by Placement", color: "#ef4444" },
  rejected_by_placement: { label: "Rejected by Placement", color: "#ef4444" },
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
      console.log("Timeline API Response:", response); // Debug log

      if (response.ok) {
        setApplications(response.applications || []);
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

  // ✅ Fixed: Updated status checks to include all variants
  const ongoingApplications = applications.filter(({ application }) => {
    const status = application.application_status;
    return (
      status === "applied" ||
      status === "interview_scheduled" ||
      status === "interview-scheduled" ||
      status === "interviewed" ||
      status === "offer-pending" ||
      status === "offer_pending"
    );
  });

  const completedApplications = applications.filter(({ application }) => {
    const status = application.application_status;
    return (
      status === "offered" ||
      status === "offer-approved" ||
      status === "offer_approved" ||
      status === "rejected" ||
      status === "rejected-by-placement" ||
      status === "rejected_by_placement"
    );
  });

  const currentApplications =
    activeTab === 0 ? ongoingApplications : completedApplications;

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
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 4,
          color: "text.primary",
        }}
      >
        My Applications
      </Typography>

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
        <>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              "& .MuiTab-root": { color: "text.secondary" },
              "& .Mui-selected": { color: "#8b5cf6 !important" },
              "& .MuiTabs-indicator": { bgcolor: "#8b5cf6" },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>Ongoing</span>
                  <Chip
                    label={ongoingApplications.length}
                    size="small"
                    sx={{
                      bgcolor: "#8b5cf620",
                      color: "#8b5cf6",
                      height: "20px",
                      minWidth: "24px",
                    }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>Completed</span>
                  <Chip
                    label={completedApplications.length}
                    size="small"
                    sx={{
                      bgcolor: "#10b98120",
                      color: "#10b981",
                      height: "20px",
                      minWidth: "24px",
                    }}
                  />
                </Box>
              }
            />
          </Tabs>

          {currentApplications.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                No {activeTab === 0 ? "ongoing" : "completed"} applications
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr",
                  md: "repeat(2, 1fr)",
                },
                gap: 3,
              }}
            >
              {currentApplications.map(({ application, post }) => {
                const status =
                  STATUS_CONFIG[application.application_status] ||
                  STATUS_CONFIG.applied;

                return (
                  <Card
                    key={application.id}
                    sx={{
                      p: 3,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        borderColor: "#8b5cf6",
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.15)",
                      },
                    }}
                    onClick={() => handleViewTimeline(application.id)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        mb: 2,
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
                      </Box>
                      <Chip
                        label={status.label}
                        size="small"
                        sx={{
                          bgcolor: `${status.color}20`,
                          color: status.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
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
                        sx={{ mb: 2, color: "#10b981", fontWeight: 600 }}
                      >
                        Package: ₹{post.package_offered} LPA
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
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
                );
              })}
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
