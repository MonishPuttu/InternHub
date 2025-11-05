"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  TrendingUp,
  FilterList,
  Business,
  Numbers,
} from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

const BRANCH_OPTIONS = [
  "CSE",
  "IT",
  "AIML",
  "ECE",
  "EEE",
  "CIVIL",
  "MECH",
  "MBA",
  "MCA",
];

export default function Leaderboard({ params }) {
  const router = useRouter();
  const { assessmentId } = use(params);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null); // ✅ For filter menu
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (assessmentId) {
      fetchLeaderboard(assessmentId, selectedBranch);
    }
  }, [assessmentId, selectedBranch]);

  const fetchLeaderboard = async (id, branch = "all") => {
    try {
      const queryParam = branch !== "all" ? `?branch=${branch}` : "";
      const response = await apiRequest(
        `/api/training/assessments/${id}/leaderboard${queryParam}`
      );
      setLeaderboardData(response.data || []);

      const assessmentRes = await apiRequest(`/api/training/assessments/${id}`);
      setAssessmentTitle(assessmentRes.data?.assessment?.title || "");
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    handleFilterClose();
  };

  if (loading) {
    return <LinearProgress sx={{ mt: 4 }} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/training/placement")}
        sx={{ mb: 3, color: "#8b5cf6" }}
      >
        Back to Assessments
      </Button>

      {/* Leaderboard Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <TrendingUp sx={{ color: "#8b5cf6", fontSize: 32 }} />
            <Typography
              variant="h4"
              sx={{
                color: "#e2e8f0",
                fontWeight: "bold",
              }}
            >
              Leaderboard
            </Typography>
          </Box>

          {/* ✅ Filter Icon Button */}
          <IconButton
            onClick={handleFilterClick}
            sx={{
              color: "#8b5cf6",
              bgcolor: "#8b5cf620",
              "&:hover": { bgcolor: "#8b5cf640" },
            }}
          >
            <FilterList />
          </IconButton>
        </Box>

        {assessmentTitle && (
          <Typography
            variant="body1"
            sx={{
              color: "#94a3b8",
            }}
          >
            {assessmentTitle}
          </Typography>
        )}

        {/* Show active filter */}
        {selectedBranch !== "all" && (
          <Box mt={2}>
            <Chip
              label={`Filtered by: ${selectedBranch}`}
              onDelete={() => setSelectedBranch("all")}
              sx={{
                bgcolor: "#8b5cf620",
                color: "#8b5cf6",
                fontWeight: "500",
              }}
            />
          </Box>
        )}
      </Paper>

      {/* ✅ Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            minWidth: 220,
          },
        }}
      >
        <MenuItem disabled sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
          Filter Options
        </MenuItem>
        <Divider sx={{ borderColor: "#334155" }} />

        <MenuItem
          onClick={() => handleBranchSelect("all")}
          selected={selectedBranch === "all"}
          sx={{
            color: "#e2e8f0",
            "&:hover": { bgcolor: "#0f172a" },
            "&.Mui-selected": { bgcolor: "#8b5cf620" },
          }}
        >
          <ListItemIcon>
            <Business sx={{ color: "#8b5cf6" }} />
          </ListItemIcon>
          <ListItemText>All Departments</ListItemText>
        </MenuItem>

        <Divider sx={{ borderColor: "#334155", my: 1 }} />

        {BRANCH_OPTIONS.map((branch) => (
          <MenuItem
            key={branch}
            onClick={() => handleBranchSelect(branch)}
            selected={selectedBranch === branch}
            sx={{
              color: "#e2e8f0",
              "&:hover": { bgcolor: "#0f172a" },
              "&.Mui-selected": { bgcolor: "#8b5cf620" },
            }}
          >
            <ListItemIcon>
              <Business sx={{ color: "#8b5cf6", fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText>{branch}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Leaderboard Table */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        {leaderboardData.length === 0 ? (
          <Typography sx={{ color: "#94a3b8", textAlign: "center", py: 3 }}>
            No leaderboard data available
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ borderBottom: "1px solid #334155" }}>
                  <TableCell
                    sx={{
                      color: "#94a3b8",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Rank
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>
                    Student Name
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>
                    Roll Number
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>
                    Department
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#94a3b8", fontWeight: "bold" }}
                  >
                    Score
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#94a3b8", fontWeight: "bold" }}
                  >
                    Percentage
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#94a3b8", fontWeight: "bold" }}
                  >
                    Time Taken
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#94a3b8", fontWeight: "bold" }}
                  >
                    Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboardData.map((student, index) => (
                  <TableRow
                    key={student.studentId}
                    onClick={() =>
                      router.push(
                        `/training/placement/student-details/${student.studentId}`
                      )
                    }
                    sx={{
                      borderBottom: "1px solid #334155",
                      "&:hover": { bgcolor: "#0f172a", cursor: "pointer" },
                      backgroundColor:
                        index === 0
                          ? "#8b5cf610"
                          : index === 1
                          ? "#10b98110"
                          : index === 2
                          ? "#f59e0b10"
                          : "transparent",
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "#e2e8f0",
                        fontWeight: "bold",
                        textAlign: "center",
                        py: 2,
                      }}
                    >
                      <Chip
                        label={`#${student.rank}`}
                        sx={{
                          bgcolor:
                            index === 0
                              ? "#8b5cf6"
                              : index === 1
                              ? "#10b981"
                              : index === 2
                              ? "#f59e0b"
                              : "#64748b",
                          color: "#ffffff",
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#e2e8f0", py: 2 }}>
                      {student.studentName}
                    </TableCell>
                    <TableCell sx={{ color: "#94a3b8", py: 2 }}>
                      {student.rollNumber}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={student.branch || "N/A"}
                        size="small"
                        sx={{
                          bgcolor: "#8b5cf620",
                          color: "#8b5cf6",
                          fontWeight: "500",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#10b981",
                        fontWeight: "bold",
                        py: 2,
                      }}
                    >
                      {student.totalScore}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#f59e0b",
                        fontWeight: "bold",
                        py: 2,
                      }}
                    >
                      {student.percentageScore}%
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#06b6d4",
                        py: 2,
                      }}
                    >
                      {student.timeTaken} min
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#94a3b8",
                        py: 2,
                      }}
                    >
                      {new Date(student.attemptDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}
