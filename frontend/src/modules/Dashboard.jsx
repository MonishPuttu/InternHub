"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  MenuItem,
  Select,
  FormControl,
  Paper,
} from "@mui/material";
import {
  Add,
  WorkOutline,
  Person,
  BarChart,
  VideoCall,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken, getUser } from "@/lib/session";
import RecentApplicationsCard from "@/components/dashboard/RecentApplicationsCard";
import UpcomingEventsCard from "@/components/dashboard/UpcomingEventsCard";
import RecommendedCard from "@/components/dashboard/RecommendedCard";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [timeFilter, setTimeFilter] = useState("year");
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const results = await Promise.allSettled([
        axios.get(`${BACKEND_URL}/api/dashboard/recent-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        //   axios.get(`${BACKEND_URL}/api/calendar`, {
        //     headers: { Authorization: `Bearer ${token}` },
        //   }),
      ]);

      // Handle applications result
      if (results[0]?.status === "fulfilled" && results[0]?.value?.data) {
        setApplications(results[0].value.data.applications || []);
      } else {
        console.error("Failed to fetch applications:", results[0]?.reason);
        setApplications([]);
      }

      // Handle events result (only if calendar endpoint is enabled)
      if (results[1]) {
        if (results[1].status === "fulfilled" && results[1].value?.data) {
          setEvents(results[1].value.data.calevents || []);
        } else {
          console.error("Failed to fetch events:", results[1].reason);
          setEvents([]);
        }
      } else {
        // Calendar endpoint is commented out, set empty events
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setApplications([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Browse Jobs",
      subtitle: "Find new opportunities",
      icon: WorkOutline,
      color: "#8b5cf6",
      path: "/posts",
    },
    {
      title: "Update Profile",
      subtitle: "Keep resume current",
      icon: Person,
      color: "#06b6d4",
      path: "/profile",
    },
    {
      title: "Skill Assessment",
      subtitle: "Test your abilities",
      icon: BarChart,
      color: "#10b981",
      path: "/analytics",
    },
    {
      title: "Mock Interview",
      subtitle: "Practice sessions",
      icon: VideoCall,
      color: "#f59e0b",
      path: "/mock",
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const recentApplications = applications.map((app) => ({
    company: app.company_name || "Unknown Company",
    location: app.industry || "Unknown Location",
    position: app.position || "Unknown Position",
    type: "Internship",
    stipend: app.package_offered ? `₹${app.package_offered}` : "Not disclosed",
    status: app.status || "pending",
    applied: formatDate(app.application_date),
  }));

  const upcomingEvents = events.slice(0, 4);

  const recommendedOpportunities = [
    {
      company: "Microsoft",
      position: "Software Engineer Intern",
      type: "Internship",
      salary: "₹50,000",
      match: 95,
      deadline: "3 days left",
    },
    {
      company: "Google",
      position: "Product Manager",
      type: "Full-time",
      salary: "₹25,00,000",
      match: 88,
      deadline: "1 week left",
    },
    {
      company: "Amazon",
      position: "Data Scientist",
      type: "Full-time",
      salary: "₹18,00,000",
      match: 82,
      deadline: "2 weeks left",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: "#e2e8f0" }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}
          >
            Welcome back, {user?.name || "User"}!
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Track your placement journey and discover new opportunities
          </Typography>
        </Box>
        <FormControl size="small">
          <Select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            sx={{
              color: "#e2e8f0",
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&:hover": { borderColor: "#8b5cf6" },
              minWidth: 120,
            }}
          >
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Paper
              key={idx}
              onClick={() => router.push(action.path)}
              sx={{
                p: 2.5,
                bgcolor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: action.color,
                  bgcolor: "#0f172a",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    bgcolor: `${action.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ color: action.color, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ color: "#e2e8f0", fontWeight: 600, mb: 0.25 }}
                  >
                    {action.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    {action.subtitle}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <RecentApplicationsCard applications={recentApplications} />
        <UpcomingEventsCard events={upcomingEvents} />
      </Box>

      <RecommendedCard opportunities={recommendedOpportunities} />
    </Box>
  );
}
