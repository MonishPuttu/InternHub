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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ArrowForward,
  TrendingUp,
  People,
  Business,
  AttachMoney,
  FilterList,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";
import axios from "axios";
import { color } from "framer-motion";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function PlacementAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [selectedDepartment, setSelectedDepartment] = useState("All Dept");
  const [appliedData, setAppliedData] = useState([]);
  const [totalApplied, setTotalApplied] = useState(0);
  const [statistics, setStatistics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const departments = [
    "All Dept",
    "ECE",
    "CSE",
    "IT",
    "AIML",
    "AIDS",
    "MECH",
    "CSBS",
    "CIVIL",
    "EEE",
    "EIE",
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedDepartment]);

  useEffect(() => {
    fetchChartData();
  }, [selectedDepartment]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const departmentParam =
        selectedDepartment === "All Dept"
          ? ""
          : `?department=${selectedDepartment}`;

      const [statsRes, totalAppliedRes] = await Promise.all([
        axios.get(
          `${BACKEND_URL}/api/placement-analytics/statistics${departmentParam}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `${BACKEND_URL}/api/placement-analytics/total-applied${departmentParam}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      if (statsRes.data.ok) {
        setStatistics(statsRes.data.data);
      }

      if (totalAppliedRes.data.ok) {
        setTotalApplied(totalAppliedRes.data.total_applied);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem("token");
      const departmentParam =
        selectedDepartment === "All Dept"
          ? ""
          : `?department=${selectedDepartment}`;

      const appliedRes = await axios.get(
        `${BACKEND_URL}/api/placement-analytics/applied-students${departmentParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (appliedRes.data.ok) {
        setAppliedData(appliedRes.data.data);
        setCurrentPage(1); // Reset to first page when data changes
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const handleNavigateToApplications = () => {
    router.push("/placement-analytics/applications");
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Calculate pagination
  const totalPages = Math.ceil(appliedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = appliedData.slice(startIndex, endIndex);

  const statCards = [
    {
      title: "Total Students",
      value: statistics?.total_students || 0,
      icon: People,
      color: "#8b5cf6", // ✅ Changed to purple
    },
    {
      title: "Students Placed",
      value: statistics?.total_placed || 0,
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      title: "Total Applied",
      value: totalApplied,
      icon: Business,
      color: "#06b6d4",
    },
    {
      title: "Highest Package",
      value: `₹${statistics?.highest_package || 0}L`,
      icon: AttachMoney,
      p: 2,
      color: "#f59e0b",
    },
  ];

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <Paper
          sx={{
            p: 2,
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}
          >
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Stack
              key={index}
              direction="row"
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 0.5 }}
            >
              <Typography variant="body2" sx={{ color: entry.fill }}>
                {entry.name}:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                {entry.value}
              </Typography>
            </Stack>
          ))}
          <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #334155" }}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", fontWeight: 700 }}
              >
                {total}
              </Typography>
            </Stack>
          </Box>
        </Paper>
      );
    }
    return null;
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
            // FIX: Removed 'item' and kept the responsive props (xs, sm, md)
            <Grid xs={12} sm={6} md={3} key={index}>
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
                        alignItems: "left",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ color: stat.color, fontSize: 25 }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {/* Department Filter */}
        <Paper
          sx={{
            p: 2,
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterList sx={{ color: "text.secondary" }} />
            <FormControl sx={{ Width: 90, height: 75 }}>
              <InputLabel>Select Department</InputLabel>
              <Select
                value={selectedDepartment}
                label="Select Department"
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </Grid>

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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
        }}
      >
        {/* Application Statistics Chart - Left Side */}
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
            mb={1}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}
              >
                Application Statistics
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Track application progress across different companies and
                positions
              </Typography>
            </Box>
            {appliedData.length > 0 && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Showing {startIndex + 1}-
                {Math.min(endIndex, appliedData.length)} of {appliedData.length}{" "}
                positions
              </Typography>
            )}
          </Stack>

          <Box sx={{ width: "100%", height: 400, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paginatedData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                {/* ✅ Remove dotted lines */}
                <CartesianGrid
                  stroke="transparent"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  dataKey="post_name"
                  type="category"
                  stroke="#94a3b8"
                  width={170}
                  style={{ fontSize: "12px" }}
                  tick={{ fill: "#94a3b8" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#33415520" }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "14px",
                  }}
                  iconType="circle"
                />
                {/* ✅ Updated colors to match student analytics */}
                <Bar
                  dataKey="applied"
                  stackId="a"
                  fill="#8b5cf6"
                  name="Applied"
                />
                <Bar
                  dataKey="interviewed"
                  stackId="a"
                  fill="#06b6d4"
                  name="Interviewed"
                />
                <Bar dataKey="offer" stackId="a" fill="#10b981" name="Offer" />
                <Bar
                  dataKey="rejected"
                  stackId="a"
                  fill="#ef4444"
                  name="Rejected"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Paper>

        {/* Career Path Statistics Pie Chart - Right Side */}
        <Paper
          sx={{
            p: 3,
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}
            >
              Career Path Distribution
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Students opting for placement vs. higher education
            </Typography>
          </Box>

          <Box sx={{ width: "100%", height: 465, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Placement",
                      value: statistics?.career_path_stats?.placement || 0,
                      fill: "#10b981",
                    },
                    {
                      name: "Higher Education",
                      value:
                        statistics?.career_path_stats?.higher_education || 0,
                      fill: "#8b5cf6", // ✅ Changed to purple
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => ` ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#8b5cf6" /> {/* ✅ Changed to purple */}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
