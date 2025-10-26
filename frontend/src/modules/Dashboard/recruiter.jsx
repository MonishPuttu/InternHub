"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Grid,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function RecruiterDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    approvedPosts: 0,
    pendingPosts: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        const posts = response.data.applications;
        setStats({
          totalPosts: posts.length,
          approvedPosts: posts.filter((p) => p.approval_status === "approved")
            .length,
          pendingPosts: posts.filter((p) => p.approval_status === "pending")
            .length,
          totalApplications: 0, // You can add this later
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
          minHeight: "80vh",
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
        sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}
      >
        Recruiter Dashboard
      </Typography>
      <Typography variant="body2" sx={{ color: "#94a3b8", mb: 4 }}>
        Welcome back! Here's an overview of your recruitment activities
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
              Total Posts
            </Typography>
            <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: 700 }}>
              {stats.totalPosts}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
              Approved Posts
            </Typography>
            <Typography variant="h4" sx={{ color: "#10b981", fontWeight: 700 }}>
              {stats.approvedPosts}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
              Pending Review
            </Typography>
            <Typography variant="h4" sx={{ color: "#fbbf24", fontWeight: 700 }}>
              {stats.pendingPosts}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
              Total Applications
            </Typography>
            <Typography variant="h4" sx={{ color: "#8b5cf6", fontWeight: 700 }}>
              {stats.totalApplications}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card
        sx={{
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 2,
          p: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#e2e8f0", fontWeight: 600, mb: 2 }}
        >
          Quick Actions
        </Typography>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            • Go to Posts section to create new job opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            • View and manage your posted opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            • Check applications from students
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
}
