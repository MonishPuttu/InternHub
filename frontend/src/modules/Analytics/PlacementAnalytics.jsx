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
} from "recharts";
import { useRouter } from "next/navigation";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function PlacementAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [appliedData, setAppliedData] = useState([]);
  const [totalApplied, setTotalApplied] = useState(0);
  const [statistics, setStatistics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const departments = [
    "All Departments",
    "ECE",
    "CSE",
    "IT",
    "AIML",
    "AIDS",
    "MECH",
    "CSBS",
    "CIVIL",
    "EEE",
    "EIE"
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [selectedDepartment]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [statsRes, totalAppliedRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/placement-analytics/statistics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BACKEND_URL}/api/placement-analytics/total-applied`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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
      const departmentParam = selectedDepartment === "All Departments" ? "" : `?department=${selectedDepartment}`;

      const appliedRes = await axios.get(`${BACKEND_URL}/api/placement-analytics/applied-students${departmentParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      title: "Total Applied",
      value: totalApplied,
      icon: FilterList,
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

      {/* Department Filter */}
      <Paper
        sx={{
          p: 3,
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <FilterList sx={{ color: "text.secondary" }} />
          <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600 }}>
            Filter by Department
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
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

      {/* Application Statistics Chart */}
      <Paper
        sx={{
          p: 3,
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}
            >
              Application Statistics
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Track application progress across different companies and positions
            </Typography>
          </Box>
          {appliedData.length > 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Showing {startIndex + 1}-{Math.min(endIndex, appliedData.length)} of {appliedData.length} positions
            </Typography>
          )}
        </Stack>

        <Box sx={{ width: "100%", height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={paginatedData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 180, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#33415520" }} />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                }}
                iconType="circle"
              />
              <Bar dataKey="applied" stackId="a" fill="#8b5cf6" name="Applied" />
              <Bar dataKey="interviewed" stackId="a" fill="#06b6d4" name="Interviewed" />
              <Bar dataKey="offer" stackId="a" fill="#10b981" name="Offer" />
              <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
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

        {/* Summary Statistics */}
        <Box
          sx={{
            mt: 4,
            p: 2,
            bgcolor: "background.default",
            borderRadius: 1,
            border: "1px solid #334155",
          }}
        >
          <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            flexWrap="wrap"
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ color: "#8b5cf6", fontWeight: 700 }}
              >
                {appliedData.reduce((sum, item) => sum + item.applied, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total Applied
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ color: "#06b6d4", fontWeight: 700 }}
              >
                {appliedData.reduce((sum, item) => sum + item.interviewed, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total Interviewed
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ color: "#10b981", fontWeight: 700 }}
              >
                {appliedData.reduce((sum, item) => sum + item.offer, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total Offers
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ color: "#ef4444", fontWeight: 700 }}
              >
                {appliedData.reduce((sum, item) => sum + item.rejected, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total Rejected
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
