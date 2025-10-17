"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Paper,
} from "@mui/material";
import {
  Description,
  CalendarMonth,
  EmojiEvents,
  AttachMoney,
} from "@mui/icons-material";
import axios from "axios";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6");
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      console.log("Fetching analytics with timeRange:", timeRange); // Debug log

      const [overviewRes, timelineRes, industryRes] = await Promise.all([
        axios.get(
          `${BACKEND_URL}/api/analytics/overview?timeRange=${timeRange}`,
          { headers }
        ),
        axios.get(
          `${BACKEND_URL}/api/analytics/timeline?timeRange=${timeRange}`,
          { headers }
        ),
        axios.get(`${BACKEND_URL}/api/analytics/industry-focus`, { headers }),
      ]);

      console.log("Overview:", overviewRes.data); // Debug log
      console.log("Timeline:", timelineRes.data); // Debug log

      setStats(overviewRes.data.stats);
      setTimeline(timelineRes.data.timeline);
      setIndustries(industryRes.data.industries);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const timelineChartData = {
    labels: timeline.map((d) => {
      const [year, month] = d.month.split("-");
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString("en-US", { month: "short" });
    }),
    datasets: [
      {
        label: "Applications",
        data: timeline.map((d) => d.applications),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Interviews",
        data: timeline.map((d) => d.interviews),
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Offers",
        data: timeline.map((d) => d.offers),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#94a3b8",
          padding: 20,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
    },
    scales: {
      x: {
        grid: { color: "#334155" },
        ticks: { color: "#94a3b8" },
      },
      y: {
        grid: { color: "#334155" },
        ticks: { color: "#94a3b8", precision: 0 },
        beginAtZero: true,
      },
    },
  };

  const industryColors = {
    Technology: "#8b5cf6",
    Finance: "#06b6d4",
    Healthcare: "#10b981",
    Consulting: "#f59e0b",
    Other: "#ef4444",
  };

  const industryChartData = {
    labels: industries.map((i) => i.industry),
    datasets: [
      {
        data: industries.map((i) => parseInt(i.count)),
        backgroundColor: industries.map(
          (i) => industryColors[i.industry] || "#6b7280"
        ),
        borderWidth: 0,
      },
    ],
  };

  const industryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            const ind = industries.find((i) => i.industry === label);
            return `${label}: ${value} (${ind?.percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "#e2e8f0" }}>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: "#e2e8f0",
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            Career Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Deep insights into your placement journey and performance metrics
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={timeRange}
            onChange={(e) => {
              console.log("Time range changed to:", e.target.value); // Debug log
              setTimeRange(e.target.value);
            }}
            sx={{
              bgcolor: "#1e293b",
              color: "#e2e8f0",
              ".MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#8b5cf6",
              },
              ".MuiSvgIcon-root": { color: "#94a3b8" },
            }}
          >
            <MenuItem value="3">Last 3 months</MenuItem>
            <MenuItem value="6">Last 6 months</MenuItem>
            <MenuItem value="12">Last 12 months</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        <StatsCard
          icon={<Description sx={{ fontSize: 28 }} />}
          value={stats?.totalApplications || 0}
          label="Total Applications"
          subtitle="This semester"
        />
        <StatsCard
          icon={<CalendarMonth sx={{ fontSize: 28 }} />}
          value={`${stats?.interviewRate || 0}%`}
          label="Interview Rate"
          subtitle="Last 6 months"
        />
        <StatsCard
          icon={<EmojiEvents sx={{ fontSize: 28 }} />}
          value={`${stats?.offerRate || 0}%`}
          label="Offer Rate"
          subtitle="Success rate"
        />
        <StatsCard
          icon={<AttachMoney sx={{ fontSize: 28 }} />}
          value={`₹${stats?.avgPackage || 0}L`}
          label="Avg. Package"
          subtitle="Expected CTC"
        />
      </Box>

      {/* Overview Tab */}
      <Box sx={{ borderBottom: 1, borderColor: "#334155", mb: 3 }}>
        <Typography
          sx={{
            color: "#8b5cf6",
            pb: 1.5,
            borderBottom: "2px solid #8b5cf6",
            display: "inline-block",
            fontWeight: 500,
          }}
        >
          Overview
        </Typography>
      </Box>

      {/* Charts - Responsive Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "2fr 1fr",
          },
          gap: 3,
        }}
      >
        {/* Timeline Chart */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: "#1e293b",
            borderRadius: 2,
            border: "1px solid #334155",
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#e2e8f0",
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Career Progress Timeline
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#94a3b8",
              mb: 3,
            }}
          >
            Track your placement journey over time
          </Typography>
          <Box sx={{ height: 400 }}>
            <Line data={timelineChartData} options={timelineOptions} />
          </Box>
        </Paper>

        {/* Industry Focus */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: "#1e293b",
            borderRadius: 2,
            border: "1px solid #334155",
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#e2e8f0",
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Industry Focus
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#94a3b8",
              mb: 3,
            }}
          >
            Application distribution by industry
          </Typography>
          <Box sx={{ height: 250, mb: 3 }}>
            {industries.length > 0 ? (
              <Pie data={industryChartData} options={industryOptions} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#64748b",
                }}
              >
                <Typography variant="body2">No data available</Typography>
              </Box>
            )}
          </Box>
          <Stack spacing={1.5}>
            {industries.map((ind) => (
              <Stack
                key={ind.industry}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: industryColors[ind.industry] || "#6b7280",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "#94a3b8", fontSize: "0.875rem" }}
                  >
                    {ind.industry}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ color: "#e2e8f0", fontWeight: 600 }}
                >
                  {ind.percentage}%
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

function StatsCard({ icon, value, label, subtitle }) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#1e293b",
        borderRadius: 2,
        border: "1px solid #334155",
        "&:hover": {
          borderColor: "#475569",
        },
        transition: "border-color 0.2s",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ color: "#64748b", mb: 1.5 }}>{icon}</Box>
        <Typography
          variant="h4"
          sx={{
            color: "#e2e8f0",
            fontWeight: 700,
            mb: 0.5,
            fontSize: "2rem",
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#e2e8f0",
            mb: 0.5,
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b" }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}
