"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Stack, Button, Paper } from "@mui/material";
import {
  Add,
  WorkOutline,
  Person,
  BarChart,
  VideoCall,
  Timeline,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken, getUser } from "@/lib/session";
import { useTheme } from "@mui/material/styles";
import RecentApplicationsCard from "@/components/dashboard/RecentApplicationsCard";
import UpcomingEventsCard from "@/components/dashboard/UpcomingEventsCard";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function StudentDashboard() {
  const router = useRouter();
  const user = getUser();

  const {
    events,
    loading: eventsLoading,
  } = useCalendarEvents();

  const [applications, setApplications] = useState([]);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      // Fetch recent applications only via backend API
      const response = await axios.get(`${BACKEND_URL}/api/dashboard/recent-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.applications) {
        setApplications(response.data.applications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const userRole = user?.role || "student";

  const getRoleBasedPath = (role) => {
    const rolePaths = {
      student: "/Post/student",
      recruiter: "/Post/recruiter",
      placement: "/Post/placement",
    };
    return rolePaths[role] || "/Post/student";
  };

  const quickActions = [
    {
      title: "Browse Jobs",
      subtitle: "Find new opportunities",
      icon: WorkOutline,
      color: "#8b5cf6",
      path: getRoleBasedPath(userRole),
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
      title: "Timeline",
      subtitle: "Practice sessions",
      icon: Timeline,
      color: "#f59e0b",
      path: "/timeline",
    },
  ];

  // ✅ Fixed date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const today = new Date();

    // Reset time to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPackage = (packageOffered) => {
    // Check for null, undefined, empty string, or "null" string
    if (
      packageOffered === null ||
      packageOffered === undefined ||
      packageOffered === "" ||
      packageOffered === "null"
    ) {
      return "Not disclosed";
    }

    // Convert to string and trim
    const packageStr = String(packageOffered).trim();

    // Handle range format like "8-9" or "8 - 9"
    if (packageStr.includes("-")) {
      const parts = packageStr.split("-").map(p => p.trim());
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);

      if (!isNaN(min) && !isNaN(max)) {
        const result = `₹${min.toFixed(2)}-${max.toFixed(2)} LPA`;
        return result;
      }
    }

    // Handle single numeric value
    const amount = parseFloat(packageStr);

    if (isNaN(amount)) {
      return "Not disclosed";
    }

    const result = `₹${amount.toFixed(2)} LPA`;
    return result;
  };

  // ✅ Fixed status formatting
  const formatStatus = (status) => {
    const statusMap = {
      applied: "Applied",
      interview_scheduled: "Interview Scheduled",
      interviewed: "Interviewed",
      offer_pending: "Offer Pending",
      offer_approved: "Offer Approved",
      rejected: "Rejected",
      hired: "Hired",
    };
    return statusMap[status] || status;
  };

  // ✅ Map applications with proper formatting
  const recentApplications = applications.map((app) => ({
    company: app.company_name || "Unknown Company",
    location: app.industry || "Unknown Location",
    position: app.position || "Unknown Position",
    type: app.job_type || "N/A",
    stipend: formatPackage(app.package_offered), // ✅ Now shows "₹10.00 LPA"
    status: formatStatus(app.status || app.application_status), // ✅ Now shows "Offer Approved"
    applied: formatDate(app.application_date),
  }));

  // Sort and select top 4 recent events from useCalendarEvents hook
  const upcomingEvents = events
    .filter(event => event.eventDate)
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    .slice(0, 3);

  const isLoading = loading || eventsLoading;

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: "text.primary" }}>
          Loading dashboard...
        </Typography>
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
            sx={{ color: "text.primary", fontWeight: 700, mb: 0.5 }}
          >
            Welcome back, {user?.name || "User"}!
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Track your placement journey and discover new opportunities
          </Typography>
        </Box>
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
                bgcolor: "background.paper",
                border: "1px solid #334155",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: action.color,
                  bgcolor: "background.default",
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
                    sx={{ color: "text.primary", fontWeight: 600, mb: 0.25 }}
                  >
                    {action.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
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
        
        {/* ✅ Clickable Upcoming Events Card - Redirects to Calendar */}
        <Box
          onClick={() => router.push("/calendar")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/calendar");
            }
          }}
          role="button"
          tabIndex={0}
          sx={{
            cursor: "pointer",
            transition: "all 0.2s",
            borderRadius: 2,
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
        >
          <UpcomingEventsCard events={upcomingEvents} />
        </Box>
      </Box>
    </Box>
  );
}