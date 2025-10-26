"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { WorkOutline, AttachMoney, CalendarToday } from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const statusColors = {
  applied: "#64748b",
  interview_scheduled: "#0ea5e9",
  interviewed: "#8b5cf6",
  offer: "#10b981",
  rejected: "#ef4444",
};

const statusLabels = {
  applied: "Applied",
  interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed",
  offer: "Offer Received",
  rejected: "Rejected",
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/my-applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ color: "#e2e8f0", fontWeight: 700, mb: 1 }}
      >
        My Applications
      </Typography>
      <Typography variant="body2" sx={{ color: "#94a3b8", mb: 4 }}>
        Track all your job applications in one place
      </Typography>

      {applications.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "#1e293b",
            borderRadius: 2,
            border: "1px solid #334155",
          }}
        >
          <Typography variant="h6" sx={{ color: "#e2e8f0", mb: 1 }}>
            No applications yet
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Browse available posts and start applying!
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {applications.map((app) => (
            <Card
              key={app.id}
              sx={{
                bgcolor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 2,
                p: 3,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#8b5cf6",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => router.push(`/postdetails/${app.post_id}`)}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}
                  >
                    {app.position}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#94a3b8", mb: 2 }}>
                    {app.company_name}
                  </Typography>

                  <Stack direction="row" spacing={3} alignItems="center">
                    {app.industry && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <WorkOutline sx={{ fontSize: 16, color: "#64748b" }} />
                        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                          {app.industry}
                        </Typography>
                      </Stack>
                    )}
                    {app.package_offered && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AttachMoney sx={{ fontSize: 16, color: "#64748b" }} />
                        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                          ₹{app.package_offered}L
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarToday sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Chip
                  label={statusLabels[app.application_status]}
                  size="small"
                  sx={{
                    bgcolor: `${statusColors[app.application_status]}20`,
                    color: statusColors[app.application_status],
                    border: `1px solid ${
                      statusColors[app.application_status]
                    }40`,
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
