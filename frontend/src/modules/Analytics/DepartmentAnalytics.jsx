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
  Chip,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const COLORS = {
  applied: "#10b981",
  not_applied: "#ef4444",
};

const DEPARTMENT_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#f97316",
  "#a855f7",
];

export default function DepartmentApplications() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchApplicationData();
  }, []);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BACKEND_URL}/api/placement-analytics/department-applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setApplicationData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching application data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const preparePieData = (dept) => {
    return [
      {
        name: "Applied",
        value: dept.total_applied,
        color: COLORS.applied,
      },
      {
        name: "Not Applied",
        value: dept.total_not_applied,
        color: COLORS.not_applied,
      },
    ];
  };

  const prepareBarChartData = () => {
    return applicationData.map((dept) => ({
      department: dept.department,
      applied: dept.total_applied,
    }));
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <IconButton
          onClick={handleBack}
          sx={{
            bgcolor: "background.paper",
            color: "#8b5cf6",
            border: "1px solid #334155",
            "&:hover": {
              bgcolor: "#334155",
            },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              mb: 0.5,
              letterSpacing: "-0.5px",
            }}
          >
            Department Application Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Detailed breakdown of student applications by department
          </Typography>
        </Box>
      </Stack>

      <Paper
        sx={{
          p: 3,
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
        >
          Applied Students Overview
        </Typography>
        <Box sx={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={prepareBarChartData()}
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
                dataKey="applied"
                fill="#10b981"
                name="Applied Students"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Typography
        variant="h6"
        sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
      >
        Department-wise Application Status
      </Typography>

      <Grid container spacing={3}>
        {applicationData.map((dept, index) => {
          const pieData = preparePieData(dept);
          const totalStudents = dept.total_applied + dept.total_not_applied;
          const appliedPercentage = (
            (dept.total_applied / totalStudents) *
            100
          ).toFixed(1);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={dept.department}>
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: "background.paper",
                  border: "1px solid #334155",
                  borderRadius: 2,
                  height: "100%",
                  "&:hover": {
                    borderColor:
                      DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
                    transform: "translateY(-4px)",
                    transition: "all 0.3s",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.primary",
                        fontWeight: 600,
                      }}
                    >
                      {dept.department}
                    </Typography>
                    <Chip
                      label={`${appliedPercentage}%`}
                      size="small"
                      sx={{
                        bgcolor: "#10b98120",
                        color: "#10b981",
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  <Box sx={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ value, percent }) =>
                            `${value} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "background.paper",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "text.primary",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "background.default",
                      borderRadius: 1,
                      border: "1px solid #334155",
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Applied:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: COLORS.applied, fontWeight: 600 }}
                        >
                          {dept.total_applied} students
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Not Applied:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: COLORS.not_applied, fontWeight: 600 }}
                        >
                          {dept.total_not_applied} students
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          pt: 1,
                          mt: 1,
                          borderTop: "1px solid #334155",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between">
                          <Typography
                            variant="body2"
                            sx={{ color: "text.primary", fontWeight: 600 }}
                          >
                            Total:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.primary", fontWeight: 600 }}
                          >
                            {totalStudents} students
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
