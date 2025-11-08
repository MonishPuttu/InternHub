"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  Typography,
  Grid,
  Chip,
  Box,
  Button,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Business,
  Schedule,
  NavigateNext,
  Assignment,
} from "@mui/icons-material";
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
        <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: "bold" }}>
          My Applications
        </Typography>
      </Box>

      {applications.length === 0 ? (
        <Card
          sx={{
            p: 4,
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#94a3b8", mb: 2 }}>
            No applications yet. Apply to jobs to see them here!
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/post")}
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Browse Jobs
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {applications.map(({ application, post }) => {
            const status =
              STATUS_CONFIG[application.application_status] ||
              STATUS_CONFIG.applied;

            return (
              <Grid item xs={12} md={6} key={application.id}>
                <Card
                  sx={{
                    p: 3,
                    bgcolor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#8b5cf6",
                      boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)",
                      transform: "translateY(-4px)",
                    },
                  }}
                  onClick={() => handleViewTimeline(application.id)}
                >
                  <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: "#8b5cf6", width: 48, height: 48 }}>
                      <Business />
                    </Avatar>
                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#e2e8f0", fontWeight: "bold" }}
                      >
                        {post.position}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
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
                      }}
                    />
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Schedule sx={{ fontSize: 16, color: "#64748b" }} />
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      Applied{" "}
                      {new Date(application.applied_at).toLocaleDateString()}
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
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
