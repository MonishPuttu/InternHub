"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ArrowForward,
  TrendingUp,
  People,
  Business,
  AttachMoney,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function PlacementAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [departmentStrength, setDepartmentStrength] = useState([]);
  console.log("Department Strength Data:", departmentStrength);
  const [statistics, setStatistics] = useState(null);
  console.log("Placement Statistics Data:", statistics);
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [strengthRes, statsRes] = await Promise.all([
        axios.get(
          `${BACKEND_URL}/api/placement-analytics/department-strength`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(`${BACKEND_URL}/api/placement-analytics/statistics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (strengthRes.data.ok) {
        console.log("Fetched Department Strength:", strengthRes.data.data);
        setDepartmentStrength(strengthRes.data.data);
      }

      if (statsRes.data.ok) {
        setStatistics(statsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToApplications = () => {
    router.push("/placement-analytics/applications");
  };

  const statCards = [
    {
      title: "Total Students",
      value: statistics?.total_students || 0,
      icon: People,
      color: "#8b5cf6",
      bgColor: "#8b5cf620",
    },
    {
      title: "Students Placed",
      value: statistics?.total_placed || 0,
      icon: TrendingUp,
      color: "#10b981",
      bgColor: "#10b98120",
    },
    {
      title: "Companies",
      value: statistics?.total_companies || 0,
      icon: Business,
      color: "#06b6d4",
      bgColor: "#06b6d420",
    },
    {
      title: "Highest Package",
      value: `₹${statistics?.highest_package || 0}L`,
      icon: AttachMoney,
      color: "#f59e0b",
      bgColor: "#f59e0b20",
    },
  ];

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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: "text.primary",
            fontWeight: 700,
            mb: 1,
            letterSpacing: "-0.5px",
          }}
        >
          PLACEMENT ANALYTICS
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Comprehensive insights into department strength and placement
          performance
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid #334155",
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: stat.color,
                    transform: "translateY(-4px)",
                    transition: "all 0.3s",
                  },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          color: "text.primary",
                          fontWeight: 700,
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: stat.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ color: stat.color, fontSize: 24 }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Paper
        sx={{
          p: 3,
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
            >
              Department Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Total number of students per department
            </Typography>
          </Box>
          <IconButton
            onClick={handleNavigateToApplications}
            sx={{
              bgcolor: "#8b5cf620",
              color: "#8b5cf6",
              "&:hover": {
                bgcolor: "#8b5cf640",
              },
            }}
          >
            <ArrowForward />
          </IconButton>
        </Stack>

        <Box sx={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentStrength}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="department"
                stroke="#94a3b8"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "background.paper",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "text.primary",
                }}
              />
              <Legend wrapperStyle={{ color: "text.secondary" }} />
              <Bar
                dataKey="total_students"
                fill="#8b5cf6"
                name="Total Students"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "background.default",
            borderRadius: 2,
            border: "1px solid #334155",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            📊 Click the arrow icon above to view detailed application analytics
            by department
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Application analytics show how many students from each department
            have applied to job postings
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
