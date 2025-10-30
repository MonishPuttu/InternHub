"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Avatar,
  Button,
  LinearProgress,
  Card,
  CardContent,
} from "@mui/material";
import { EmojiEvents, Visibility, ArrowBack } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function Leaderboard({ params }) {
  const { assessmentId } = params;
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await apiRequest(
        `/api/training/assessments/${assessmentId}/leaderboard`
      );
      setLeaderboardData(response.data);

      // Get assessment title
      if (response.data.length > 0) {
        const assessmentResponse = await apiRequest(
          `/api/training/assessments/${assessmentId}`
        );
        setAssessmentTitle(assessmentResponse.data.assessment.title);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "#fbbf24"; // gold
    if (rank === 2) return "#9ca3af"; // silver
    if (rank === 3) return "#cd7f32"; // bronze
    return "#64748b";
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) {
      return <EmojiEvents sx={{ color: getRankColor(rank), fontSize: 28 }} />;
    }
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: "#334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontWeight: 600,
        }}
      >
        {rank}
      </Box>
    );
  };

  const viewStudentDetails = (studentId) => {
    router.push(`/training/placement/student-details/${studentId}`);
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
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

      <Box mb={4}>
        <Typography variant="h4" gutterBottom sx={{ color: "#e2e8f0" }}>
          Leaderboard
        </Typography>
        <Typography variant="h6" sx={{ color: "#94a3b8" }}>
          {assessmentTitle}
        </Typography>
      </Box>

      {leaderboardData.length === 0 ? (
        <Card
          sx={{
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "#94a3b8" }}>
            No submissions yet for this assessment
          </Typography>
        </Card>
      ) : (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            bgcolor: "#1e293b",
            border: "1px solid #334155",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#0f172a" }}>
                <TableCell sx={{ color: "#e2e8f0", fontWeight: 700 }}>
                  Rank
                </TableCell>
                <TableCell sx={{ color: "#e2e8f0", fontWeight: 700 }}>
                  Student
                </TableCell>
                <TableCell sx={{ color: "#e2e8f0", fontWeight: 700 }}>
                  Roll Number
                </TableCell>
                <TableCell
                  sx={{ color: "#e2e8f0", fontWeight: 700 }}
                  align="center"
                >
                  Score
                </TableCell>
                <TableCell
                  sx={{ color: "#e2e8f0", fontWeight: 700 }}
                  align="center"
                >
                  Percentage
                </TableCell>
                <TableCell
                  sx={{ color: "#e2e8f0", fontWeight: 700 }}
                  align="center"
                >
                  Time Taken
                </TableCell>
                <TableCell
                  sx={{ color: "#e2e8f0", fontWeight: 700 }}
                  align="center"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboardData.map((student) => (
                <TableRow
                  key={student.studentId}
                  hover
                  sx={{
                    "&:hover": { bgcolor: "#0f172a" },
                    borderBottom: "1px solid #334155",
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getRankIcon(student.rank)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: "#8b5cf6",
                          width: 36,
                          height: 36,
                        }}
                      >
                        {student.studentName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ color: "#e2e8f0", fontWeight: 500 }}>
                          {student.studentName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          {student.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: "#94a3b8" }}>
                      {student.rollNumber || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={student.totalScore}
                      sx={{
                        bgcolor: "#8b5cf620",
                        color: "#8b5cf6",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${student.percentageScore}%`}
                      sx={{
                        bgcolor:
                          student.percentageScore >= 75
                            ? "#10b98120"
                            : student.percentageScore >= 50
                            ? "#f59e0b20"
                            : "#ef444420",
                        color:
                          student.percentageScore >= 75
                            ? "#10b981"
                            : student.percentageScore >= 50
                            ? "#f59e0b"
                            : "#ef4444",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ color: "#94a3b8" }}>
                      {student.timeTaken} mins
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => viewStudentDetails(student.studentId)}
                      sx={{
                        color: "#8b5cf6",
                        borderColor: "#8b5cf6",
                        "&:hover": {
                          borderColor: "#7c3aed",
                          bgcolor: "#8b5cf610",
                        },
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
