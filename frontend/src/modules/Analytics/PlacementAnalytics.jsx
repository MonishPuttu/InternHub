"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// Professional color palette - Indigo + Cyan + Slate + Muted Red
const COLOR_PALETTE = {
  // Application status colors - professional and safe
  applied: "#06B6D4",      // Cyan (modern, corporate)
  interviewed: "#6366F1",  // Indigo (professional)
  offer: "#64748B",        // Slate (subtle) - dark mode
  offerLight: "#CBD5E1",   // Light slate - light mode
  rejected: "#EF4444",     // Muted red (clear but not harsh)
  
  // Career path colors - cyan/turquoise theme from reference
  placement: "#00BCD4",    // Cyan/Turquoise
  higherEd: "#FFD700",     // Gold/Yellow
  appliedCareer: "#7C3AED", // Purple
  other: "#64748B",        // Slate gray
  
  // Accent colors
  accent1: "#F59E0B",      // Amber/Orange
  accent2: "#10B981",      // Emerald green
  accent3: "#8B5CF6",      // Purple
  
  // Mustard for line graph (keeping this as you like it)
  mustard: "#D4AF37",      // Golden mustard
  
  // Rank colors
  rank1: "#FFD700",        // Gold
  rank2: "#C0C0C0",        // Silver
  rank3: "#CD7F32",        // Bronze
};

export default function PlacementAnalytics() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("All Dept");
  const [careerPathDept, setCareerPathDept] = useState("All Dept");
  const [appliedData, setAppliedData] = useState([]);
  const [totalApplied, setTotalApplied] = useState(0);
  const [statistics, setStatistics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentPlacedData, setDepartmentPlacedData] = useState([]);
  const [topHiringCompanies, setTopHiringCompanies] = useState([]);
  const [statusFilters, setStatusFilters] = useState({
    applied: true,
    interviewed: true,
    offer: true,
    rejected: true,
  });
  const itemsPerPage = 6;

  const departments = [
    "All Dept",
    "ECE",
    "CSE",
    "IT",
    "AIML",
    "MECH",
    "CIVIL",
    "EEE",
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAnalyticsData(),
          fetchChartData(),
          fetchDepartmentPlacedData(),
          fetchTopHiringCompanies()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedDepartment]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [careerPathDept]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token");
      const departmentParam =
        careerPathDept === "All Dept"
          ? ""
          : `?department=${careerPathDept}`;

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
        console.log('Statistics:', statsRes.data.data);
        setStatistics(statsRes.data.data);
      }

      if (totalAppliedRes.data.ok) {
        console.log('Total Applied:', totalAppliedRes.data.total_applied);
        setTotalApplied(totalAppliedRes.data.total_applied);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
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
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchDepartmentPlacedData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch placed students for each department
      const deptData = [];
      for (const dept of departments.filter(d => d !== "All Dept")) {
        const res = await axios.get(
          `${BACKEND_URL}/api/placement-analytics/statistics?department=${dept}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (res.data.ok) {
          deptData.push({
            department: dept,
            placed: res.data.data.total_placed || 0,
          });
        }
      }
      
      setDepartmentPlacedData(deptData);
    } catch (error) {
      console.error("Error fetching department placed data:", error);
    }
  };

  const fetchTopHiringCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Add department parameter to the request
      const departmentParam =
        selectedDepartment === "All Dept"
          ? ""
          : `?department=${encodeURIComponent(selectedDepartment)}`;
      
      const res = await axios.get(
        `${BACKEND_URL}/api/placement-analytics/top-hiring-companies?limit=3${departmentParam ? `&${departmentParam.slice(1)}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (res.data.ok && res.data.data && res.data.data.length > 0) {
        setTopHiringCompanies(res.data.data);
      } else {
        setTopHiringCompanies([]);
      }
    } catch (error) {
      console.error("Error fetching top hiring companies:", error);
      setTopHiringCompanies([]);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleStatusToggle = (status) => {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const totalPages = Math.ceil(appliedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = appliedData.slice(startIndex, endIndex);

  // ===== FIXED CALCULATION - Mutually Exclusive Categories =====
  // Calculate statistics for the donut chart
  const careerStats = statistics?.career_path_stats || {};
  const placementCount = careerStats.placement || 0;
  const higherEdCount = careerStats.higher_education || 0;
  
  // Calculate applied-only count (students who applied but are not placed or in higher ed)
  const appliedOnlyCount = Math.max(0, totalApplied - placementCount - higherEdCount);
  
  // Total students is the sum of mutually exclusive categories
  const totalStudents = placementCount + higherEdCount + appliedOnlyCount;
  
  // Calculate percentages based on totalStudents
  const placementPercentage =
    totalStudents > 0 ? Math.round((placementCount / totalStudents) * 100) : 0;
  const higherEdPercentage =
    totalStudents > 0 ? Math.round((higherEdCount / totalStudents) * 100) : 0;
  const appliedPercentage =
    totalStudents > 0 ? Math.round((appliedOnlyCount / totalStudents) * 100) : 0;
  
  // Other is calculated as the remainder
  const otherPercentage = Math.max(0, 100 - placementPercentage - higherEdPercentage - appliedPercentage);
  const otherCount = Math.round((otherPercentage / 100) * totalStudents);
  // ===== END FIXED CALCULATION =====

  // Get rank badge color
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return COLOR_PALETTE.rank1;
      case 2: return COLOR_PALETTE.rank2;
      case 3: return COLOR_PALETTE.rank3;
      default: return COLOR_PALETTE.other;
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
        <CircularProgress sx={{ color: COLOR_PALETTE.applied }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header */}
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.5fr 1fr" },
          gap: 3,
        }}
      >
        {/* Left Column - Application Statistics */}
        <Box>
          <Paper
            sx={{
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              mb: 3,
              boxShadow: 1,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Application Statistics
              </Typography>

              {/* Toggle Switches with accessibility support */}
              <Stack direction="row" spacing={1.5}>
                {/* Applied Toggle */}
                <Box
                  role="switch"
                  tabIndex={0}
                  aria-checked={statusFilters.applied}
                  aria-label="Toggle Applied status filter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStatusToggle("applied");
                    }
                  }}
                  onClick={() => handleStatusToggle("applied")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    "&:focus": {
                      outline: `2px solid ${COLOR_PALETTE.applied}`,
                      outlineOffset: "2px",
                      borderRadius: "4px",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    Applied
                  </Typography>
                  <Box
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: statusFilters.applied
                        ? COLOR_PALETTE.applied
                        : theme.palette.mode === 'dark' ? '#374151' : '#D1D5DB',
                      position: "relative",
                      transition: "background-color 0.3s",
                      "&:hover": {
                        opacity: 0.9,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        left: statusFilters.applied ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        transition: "left 0.3s",
                      }}
                    />
                  </Box>
                </Box>

                {/* Interviewed Toggle */}
                <Box
                  role="switch"
                  tabIndex={0}
                  aria-checked={statusFilters.interviewed}
                  aria-label="Toggle Interviewed status filter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStatusToggle("interviewed");
                    }
                  }}
                  onClick={() => handleStatusToggle("interviewed")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    "&:focus": {
                      outline: `2px solid ${COLOR_PALETTE.interviewed}`,
                      outlineOffset: "2px",
                      borderRadius: "4px",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    Interviewed
                  </Typography>
                  <Box
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: statusFilters.interviewed
                        ? COLOR_PALETTE.interviewed
                        : theme.palette.mode === 'dark' ? '#374151' : '#D1D5DB',
                      position: "relative",
                      transition: "background-color 0.3s",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        left: statusFilters.interviewed ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        transition: "left 0.3s",
                      }}
                    />
                  </Box>
                </Box>

                {/* Offer Toggle */}
                <Box
                  role="switch"
                  tabIndex={0}
                  aria-checked={statusFilters.offer}
                  aria-label="Toggle Offer status filter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStatusToggle("offer");
                    }
                  }}
                  onClick={() => handleStatusToggle("offer")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    "&:focus": {
                      outline: `2px solid ${theme.palette.mode === 'dark' ? COLOR_PALETTE.offer : COLOR_PALETTE.offerLight}`,
                      outlineOffset: "2px",
                      borderRadius: "4px",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    Offer
                  </Typography>
                  <Box
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: statusFilters.offer
                        ? (theme.palette.mode === 'dark' ? COLOR_PALETTE.offer : COLOR_PALETTE.offerLight)
                        : theme.palette.mode === 'dark' ? '#374151' : '#D1D5DB',
                      position: "relative",
                      transition: "background-color 0.3s",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        left: statusFilters.offer ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        transition: "left 0.3s",
                      }}
                    />
                  </Box>
                </Box>

                {/* Rejected Toggle */}
                <Box
                  role="switch"
                  tabIndex={0}
                  aria-checked={statusFilters.rejected}
                  aria-label="Toggle Rejected status filter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStatusToggle("rejected");
                    }
                  }}
                  onClick={() => handleStatusToggle("rejected")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    "&:focus": {
                      outline: `2px solid ${COLOR_PALETTE.rejected}`,
                      outlineOffset: "2px",
                      borderRadius: "4px",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    Rejected
                  </Typography>
                  <Box
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: statusFilters.rejected
                        ? COLOR_PALETTE.rejected
                        : theme.palette.mode === 'dark' ? '#374151' : '#D1D5DB',
                      position: "relative",
                      transition: "background-color 0.3s",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        left: statusFilters.rejected ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        transition: "left 0.3s",
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            </Stack>

            {/* Application Statistics List */}
            <Stack spacing={2.5}>
              {paginatedData.map((item, index) => {
                // Include interview_scheduled in the interviewed count
                const interviewedTotal = (item.interviewed || 0) + (item.interview_scheduled || 0);
                
                const total =
                  item.applied +
                  interviewedTotal +
                  item.offer +
                  item.rejected;
                
                const appliedPercent =
                  total > 0 ? (item.applied / total) * 100 : 0;
                const interviewedPercent =
                  total > 0 ? (interviewedTotal / total) * 100 : 0;
                const offerPercent = total > 0 ? (item.offer / total) * 100 : 0;
                const rejectedPercent =
                  total > 0 ? (item.rejected / total) * 100 : 0;

                // Calculate cumulative percentages for positioning
                let cumulativePercent = 0;
                const segments = [];

                if (statusFilters.applied) {
                  segments.push({
                    percent: appliedPercent,
                    color: COLOR_PALETTE.applied,
                    offset: cumulativePercent,
                    count: item.applied,
                  });
                  cumulativePercent += appliedPercent;
                }
                if (statusFilters.interviewed) {
                  segments.push({
                    percent: interviewedPercent,
                    color: COLOR_PALETTE.interviewed,
                    offset: cumulativePercent,
                    count: interviewedTotal,
                  });
                  cumulativePercent += interviewedPercent;
                }
                if (statusFilters.offer) {
                  segments.push({
                    percent: offerPercent,
                    color: theme.palette.mode === 'dark' ? COLOR_PALETTE.offer : COLOR_PALETTE.offerLight,
                    offset: cumulativePercent,
                    count: item.offer,
                  });
                  cumulativePercent += offerPercent;
                }
                if (statusFilters.rejected) {
                  segments.push({
                    percent: rejectedPercent,
                    color: COLOR_PALETTE.rejected,
                    offset: cumulativePercent,
                    count: item.rejected,
                  });
                  cumulativePercent += rejectedPercent;
                }

                return (
                  <Box key={index}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontStyle: "italic" }}
                      >
                        {item.post_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.primary", fontWeight: 600 }}
                      >
                        {total.toLocaleString()}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        position: "relative",
                        height: 18,
                        bgcolor: theme.palette.mode === 'dark' ? '#374151' : '#E2E8F0',
                        borderRadius: "9px",
                        overflow: "visible",
                        display: "flex",
                      }}
                    >
                      {segments.map((segment, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            position: "relative",
                            height: "100%",
                            width: `${segment.percent}%`,
                            bgcolor: segment.color,
                            transition: "all 0.3s ease",
                            borderRadius: "9px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "&:hover .tooltip": {
                              opacity: 1,
                              visibility: "visible",
                            },
                          }}
                        >
                          {/* Tooltip - centered inside the bar */}
                          <Box
                            className="tooltip"
                            sx={{
                              opacity: 0,
                              visibility: "hidden",
                              transition: "opacity 0.2s, visibility 0.2s",
                              pointerEvents: "none",
                              zIndex: 10,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                fontSize: 11,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {segment.count}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Stack>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  size="medium"
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "text.secondary",
                      fontWeight: 500,
                      fontSize: "14px",
                      minWidth: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      "&:hover": {
                        bgcolor: theme.palette.mode === 'dark' ? '#374151' : '#F3F4F6',
                      },
                    },
                    "& .Mui-selected": {
                      bgcolor: `${COLOR_PALETTE.applied} !important`,
                      color: "white !important",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: `${COLOR_PALETTE.placement} !important`,
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Paper>

          {/* Department-Wise Placed Students Chart - LINE CHART with MUSTARD color */}
          <Paper
            sx={{
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              boxShadow: 1,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Department-Wise Placed Students
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: "text.primary", fontWeight: 700 }}
              >
                {departmentPlacedData.reduce(
                  (sum, dept) => sum + dept.placed,
                  0
                )}
              </Typography>
            </Stack>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={departmentPlacedData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme.palette.mode === 'dark' ? '#374151' : '#F3F4F6'} 
                />
                <XAxis
                  dataKey="department"
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                    color: theme.palette.text.primary,
                  }}
                  formatter={(value) => [value, "Placed Students"]}
                  cursor={false}
                />
                <Line 
                  type="monotone"
                  dataKey="placed" 
                  stroke={COLOR_PALETTE.mustard}
                  strokeWidth={3}
                  dot={{ fill: COLOR_PALETTE.mustard, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Right Column - Career Path Distribution & Top Hiring Companies */}
        <Box>
          <Paper
            sx={{
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              boxShadow: 1,
              mb: 3,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Career Path Distribution
              </Typography>
              
              {/* Department Filter - Controls all analytics */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={careerPathDept}
                  onChange={(e) => {
                    setCareerPathDept(e.target.value);
                    setSelectedDepartment(e.target.value);
                  }}
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "text.primary",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "divider",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: COLOR_PALETTE.applied,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: COLOR_PALETTE.applied,
                    },
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept} sx={{ fontSize: 13 }}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Bigger Donut Chart with purple palette */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
                position: "relative",
              }}
            >
              <Box sx={{ position: "relative", width: 260, height: 260 }}>
                <svg width="260" height="260" viewBox="0 0 260 260">
                  {/* Background circle */}
                  <circle
                    cx="130"
                    cy="130"
                    r="110"
                    fill="none"
                    stroke={theme.palette.mode === 'dark' ? '#374151' : '#E5E7EB'}
                    strokeWidth="12"
                  />

                  {/* Placement (Cyan/Turquoise) */}
                  <circle
                    cx="130"
                    cy="130"
                    r="110"
                    fill="none"
                    stroke={COLOR_PALETTE.placement}
                    strokeWidth="12"
                    strokeDasharray={`${
                      (placementPercentage / 100) * 690.8
                    } 690.8`}
                    strokeDashoffset="0"
                    transform="rotate(-90 130 130)"
                    strokeLinecap="round"
                  />

                  {/* Higher Education (Gold) */}
                  <circle
                    cx="130"
                    cy="130"
                    r="110"
                    fill="none"
                    stroke={COLOR_PALETTE.higherEd}
                    strokeWidth="12"
                    strokeDasharray={`${
                      (higherEdPercentage / 100) * 690.8
                    } 690.8`}
                    strokeDashoffset={`-${
                      (placementPercentage / 100) * 690.8
                    }`}
                    transform="rotate(-90 130 130)"
                    strokeLinecap="round"
                  />

                  {/* Applied (Purple) */}
                  <circle
                    cx="130"
                    cy="130"
                    r="110"
                    fill="none"
                    stroke={COLOR_PALETTE.appliedCareer}
                    strokeWidth="12"
                    strokeDasharray={`${
                      (appliedPercentage / 100) * 690.8
                    } 690.8`}
                    strokeDashoffset={`-${
                      ((placementPercentage + higherEdPercentage) / 100) *
                      690.8
                    }`}
                    transform="rotate(-90 130 130)"
                    strokeLinecap="round"
                  />

                  {/* Other (Gray) */}
                  <circle
                    cx="130"
                    cy="130"
                    r="110"
                    fill="none"
                    stroke={COLOR_PALETTE.other}
                    strokeWidth="12"
                    strokeDasharray={`${
                      (otherPercentage / 100) * 690.8
                    } 690.8`}
                    strokeDashoffset={`-${
                      ((placementPercentage +
                        higherEdPercentage +
                        appliedPercentage) /
                        100) *
                      690.8
                    }`}
                    transform="rotate(-90 130 130)"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Text */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      color: "text.primary",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {totalStudents.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}
                  >
                    Students
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Statistics Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: COLOR_PALETTE.placement,
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Placement
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{ color: "text.primary", fontWeight: 700 }}
                >
                  {placementPercentage}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: 11 }}
                >
                  ({placementCount} students)
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: COLOR_PALETTE.higherEd,
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Higher Education
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{ color: "text.primary", fontWeight: 700 }}
                >
                  {higherEdPercentage}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: 11 }}
                >
                  ({higherEdCount} students)
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: COLOR_PALETTE.appliedCareer,
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Applied
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{ color: "text.primary", fontWeight: 700 }}
                >
                  {appliedPercentage}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: 11 }}
                >
                  ({appliedOnlyCount} students)
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: COLOR_PALETTE.other,
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Other
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{ color: "text.primary", fontWeight: 700 }}
                >
                  {otherPercentage}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: 11 }}
                >
                  ({otherCount} students)
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Top Hiring Companies Section */}
          <Paper
            sx={{
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              boxShadow: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
            >
              Top Hiring Companies
            </Typography>

            {topHiringCompanies.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: "center", 
                  py: 6,
                  px: 2,
                  bgcolor: theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB',
                  borderRadius: 2,
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  No hiring data available yet
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                {topHiringCompanies.map((company, index) => {
                  const rank = index + 1;
                  const rankColor = getRankColor(rank);
                  const isTopRank = rank === 1;
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2.5,
                        bgcolor: isTopRank 
                          ? (theme.palette.mode === 'dark' ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 215, 0, 0.12)')
                          : (theme.palette.mode === 'dark' ? '#1F2937' : '#F9FAFB'),
                        borderRadius: 2,
                        border: 1,
                        borderColor: isTopRank 
                          ? (theme.palette.mode === 'dark' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 215, 0, 0.3)')
                          : "divider",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 4px 12px rgba(0,0,0,0.3)' 
                            : '0 4px 12px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {/* Rank Badge */}
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            bgcolor: rankColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 16,
                            color: rank === 2 ? '#1F2937' : 'white',
                            boxShadow: `0 2px 8px ${rankColor}40`,
                          }}
                        >
                          {rank}
                        </Box>
                        
                        {/* Company Name */}
                        <Typography
                          variant="body1"
                          sx={{ 
                            color: "text.primary", 
                            fontWeight: isTopRank ? 700 : 600,
                            fontSize: isTopRank ? 16 : 15,
                          }}
                        >
                          {company.name}
                        </Typography>
                      </Stack>
                      
                      {/* Hire Count Chip */}
                      <Chip
                        label={`${company.hire_count} ${company.hire_count === 1 ? 'hire' : 'hires'}`}
                        size="small"
                        sx={{
                          bgcolor: COLOR_PALETTE.placement,
                          color: "white",
                          fontWeight: 700,
                          fontSize: 13,
                          px: 1,
                          height: 28,
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}