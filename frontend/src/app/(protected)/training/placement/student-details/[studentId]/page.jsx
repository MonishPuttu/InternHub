"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ArrowBack, Email, Phone, School, Work } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function StudentDetails({ params }) {
  const { studentId } = params;
  const router = useRouter();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  const fetchStudentDetails = async () => {
    try {
      const response = await apiRequest(
        `/api/training/students/${studentId}/details`
      );
      setStudentData(response.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ mb: 3, color: "#8b5cf6" }}
      >
        Back
      </Button>

      {/* Student Profile */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: "#e2e8f0" }}>
          Student Profile
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h6" sx={{ color: "#94a3b8" }}>
                Name:
              </Typography>
              <Typography variant="h6" sx={{ color: "#e2e8f0" }}>
                {profile.full_name}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Email sx={{ color: "#8b5cf6" }} />
              <Typography sx={{ color: "#94a3b8" }}>
                {profile.contact_number || "N/A"}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Phone sx={{ color: "#8b5cf6" }} />
              <Typography sx={{ color: "#94a3b8" }}>
                {profile.contact_number || "N/A"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <School sx={{ color: "#8b5cf6" }} />
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Roll Number
                </Typography>
                <Typography sx={{ color: "#e2e8f0" }}>
                  {profile.roll_number || "N/A"}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Work sx={{ color: "#8b5cf6" }} />
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Branch
                </Typography>
                <Typography sx={{ color: "#e2e8f0" }}>
                  {profile.branch || "N/A"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2, bgcolor: "#334155" }} />
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: "#0f172a", border: "1px solid #334155" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h5" sx={{ color: "#8b5cf6" }}>
                      {profile.cgpa || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      CGPA
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: "#0f172a", border: "1px solid #334155" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h5" sx={{ color: "#10b981" }}>
                      {profile.tenth_score || "N/A"}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      10th Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: "#0f172a", border: "1px solid #334155" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h5" sx={{ color: "#10b981" }}>
                      {profile.twelfth_score || "N/A"}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      12th Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: "#0f172a", border: "1px solid #334155" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h5" sx={{ color: "#f59e0b" }}>
                      {profile.current_semester || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      Semester
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Assessment History */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: "#1e293b",
          border: "1px solid #334155",
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ color: "#e2e8f0" }}>
          Assessment History
        </Typography>

        {assessmentHistory.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "#94a3b8" }}>
              No assessments taken yet
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#0f172a" }}>
                  <TableCell sx={{ color: "#e2e8f0", fontWeight: 700 }}>
                    Assessment
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
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ color: "#e2e8f0", fontWeight: 700 }}
                    align="center"
                  >
                    Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessmentHistory.map((assessment, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { bgcolor: "#0f172a" },
                      borderBottom: "1px solid #334155",
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ color: "#e2e8f0" }}>
                        {assessment.assessmentTitle}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={assessment.score}
                        size="small"
                        sx={{
                          bgcolor: "#8b5cf620",
                          color: "#8b5cf6",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${assessment.percentage}%`}
                        size="small"
                        sx={{
                          bgcolor:
                            assessment.percentage >= 75
                              ? "#10b98120"
                              : assessment.percentage >= 50
                              ? "#f59e0b20"
                              : "#ef444420",
                          color:
                            assessment.percentage >= 75
                              ? "#10b981"
                              : assessment.percentage >= 50
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={assessment.status}
                        size="small"
                        sx={{
                          bgcolor:
                            assessment.status === "completed"
                              ? "#10b98120"
                              : "#64748b20",
                          color:
                            assessment.status === "completed"
                              ? "#10b981"
                              : "#64748b",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        {new Date(assessment.attemptDate).toLocaleDateString()}
                      </Typography>
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
