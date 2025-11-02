"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { ArrowBack, Email, Phone, TrendingUp } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function StudentDetails({ params: paramsPromise }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const extractParams = async () => {
      try {
        const resolvedParams = await paramsPromise;
        if (!resolvedParams?.studentId) {
          setLoading(false);
          return;
        }
        setStudentId(resolvedParams.studentId);
        await fetchStudentDetails(resolvedParams.studentId);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    extractParams();
  }, [paramsPromise]);

  const fetchStudentDetails = async (id) => {
    try {
      const response = await apiRequest(`/api/training/students/${id}/details`);
      setStudentData(response.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress sx={{ mt: 4 }} />;
  }

  if (!studentData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ color: "#94a3b8" }}>
          Student not found
        </Typography>
      </Container>
    );
  }

  const { profile, assessmentHistory } = studentData;

  // Calculate useful metrics
  const totalAssessments = assessmentHistory.length;
  const completedAssessments = assessmentHistory.filter(
    (a) => a.status === "completed"
  ).length;
  const avgScore =
    assessmentHistory.length > 0
      ? Math.round(
          assessmentHistory.reduce((sum, a) => sum + a.percentage, 0) /
            assessmentHistory.length
        )
      : 0;
  const bestScore = Math.max(...assessmentHistory.map((a) => a.percentage), 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/training/placement")}
        sx={{ mb: 3, color: "#8b5cf6" }}
      >
        Back to Assessments
      </Button>

      {/* Student Profile Section */}
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
        <Box mb={4}>
          <Typography
            variant="h4"
            sx={{
              color: "#e2e8f0",
              fontWeight: "bold",
              mb: 3,
            }}
          >
            Student Profile
          </Typography>

          {/* Top Row - Name, Roll Number, Email, Branch */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Name */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  mb: 0.5,
                  fontWeight: "600",
                }}
              >
                Name
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#e2e8f0",
                  fontWeight: "bold",
                  wordBreak: "break-word",
                }}
              >
                {profile.fullName}
              </Typography>
            </Box>

            {/* Roll Number */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  mb: 0.5,
                  fontWeight: "600",
                }}
              >
                Roll Number
              </Typography>
              <Typography
                sx={{
                  color: "#e2e8f0",
                  fontWeight: "500",
                  fontSize: "1.1rem",
                }}
              >
                {profile.rollNumber}
              </Typography>
            </Box>

            {/* Email */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  mb: 0.5,
                  fontWeight: "600",
                }}
              >
                Email
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Email sx={{ color: "#8b5cf6", fontSize: 18 }} />
                <Typography
                  sx={{
                    color: "#e2e8f0",
                    wordBreak: "break-word",
                    fontSize: "0.95rem",
                  }}
                >
                  {profile.email || "N/A"}
                </Typography>
              </Box>
            </Box>

            {/* Branch */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  mb: 0.5,
                  fontWeight: "600",
                }}
              >
                Branch
              </Typography>
              <Chip
                label={profile.branch || "N/A"}
                sx={{
                  bgcolor: "#8b5cf620",
                  color: "#8b5cf6",
                  fontWeight: "500",
                }}
              />
            </Box>
          </Box>

          {/* Bottom Row - Phone, Current Semester */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            {/* Phone */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  mb: 0.5,
                  fontWeight: "600",
                }}
              >
                Phone
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Phone sx={{ color: "#8b5cf6", fontSize: 18 }} />
                <Typography
                  sx={{
                    color: "#e2e8f0",
                    fontSize: "0.95rem",
                  }}
                >
                  {profile.phone || "N/A"}
                </Typography>
              </Box>
            </Box>

            {/* Current Semester */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  mb: 0.5,
                  fontWeight: "600",
                }}
              >
                Current Semester
              </Typography>
              <Chip
                label={
                  profile.currentSemester
                    ? `Sem ${profile.currentSemester}`
                    : "N/A"
                }
                sx={{
                  bgcolor: "#10b98120",
                  color: "#10b981",
                  fontWeight: "600",
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
            bgcolor: "#0f172a",
            p: 3,
            borderRadius: 1,
            border: "1px solid #334155",
          }}
        >
          {/* CGPA */}
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 1,
              height: "100%",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#f59e0b",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                {profile.cgpa || "N/A"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                }}
              >
                CGPA
              </Typography>
            </CardContent>
          </Card>

          {/* 10th Score */}
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 1,
              height: "100%",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#10b981",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                {profile.tenthScore || "N/A"}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                }}
              >
                10th Score
              </Typography>
            </CardContent>
          </Card>

          {/* 12th Score */}
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 1,
              height: "100%",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#06b6d4",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                {profile.twelfthScore || "N/A"}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                }}
              >
                12th Score
              </Typography>
            </CardContent>
          </Card>

          {/* Average Assessment Score */}
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 1,
              height: "100%",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#ec4899",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                {assessmentHistory.length > 0
                  ? Math.round(
                      assessmentHistory.reduce(
                        (sum, a) => sum + a.percentage,
                        0
                      ) / assessmentHistory.length
                    )
                  : "N/A"}
                %
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                }}
              >
                Avg Score
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Assessment History Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#e2e8f0",
            mb: 3,
            fontWeight: "bold",
          }}
        >
          Assessment History
        </Typography>

        {assessmentHistory.length === 0 ? (
          <Typography sx={{ color: "#94a3b8", textAlign: "center", py: 3 }}>
            No assessment attempts yet
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ borderBottom: "1px solid #334155" }}>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>
                    Assessment
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
                    Status
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
                {assessmentHistory.map((attempt, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      borderBottom: "1px solid #334155",
                      "&:hover": { bgcolor: "#0f172a" },
                    }}
                  >
                    <TableCell sx={{ color: "#e2e8f0", py: 2 }}>
                      {attempt.assessmentTitle}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#10b981",
                        fontWeight: "bold",
                      }}
                    >
                      {attempt.score}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#f59e0b",
                        fontWeight: "bold",
                      }}
                    >
                      {attempt.percentage}%
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={attempt.status}
                        sx={{
                          bgcolor: "#10b98120",
                          color: "#10b981",
                          textTransform: "capitalize",
                          fontWeight: "600",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ color: "#94a3b8" }}>
                      {new Date(attempt.attemptDate).toLocaleDateString()}
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
