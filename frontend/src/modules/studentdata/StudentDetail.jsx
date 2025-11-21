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
import { ArrowBack, Email, Phone } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@mui/material/styles";

export default function StudentDetail({ studentId }) {
    const router = useRouter();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        if (studentId) {
            fetchStudentDetails(studentId);
        }
    }, [studentId]);

    const fetchStudentDetails = async (id) => {
        try {
            const response = await apiRequest(`/api/studentdata/students/${id}`);
            setStudentData(response.student);
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
                <Typography variant="h6" sx={{ color: "text.secondary" }}>
                    Student not found
                </Typography>
            </Container>
        );
    }

    const profile = studentData;
    const assessmentHistory = studentData.reportCards || [];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => router.back()}
                sx={{ mb: 3, color: "#8b5cf6" }}
            >
                Back
            </Button>

            {/* Student Profile Section */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 4,
                    bgcolor: "background.paper",
                    border: "1px solid #334155",
                    borderRadius: 2,
                }}
            >
                <Box mb={4}>
                    <Typography
                        variant="h4"
                        sx={{
                            color: "text.primary",
                            fontWeight: "bold",
                            mb: 3,
                        }}
                    >
                        Student Profile
                    </Typography>

                    {/* Top Row */}
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
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
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
                                    color: "text.primary",
                                    fontWeight: "bold",
                                    wordBreak: "break-word",
                                }}
                            >
                                {profile.fullName}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
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
                                    color: "text.primary",
                                    fontWeight: "500",
                                    fontSize: "1.1rem",
                                }}
                            >
                                {profile.rollNumber}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
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
                                        color: "text.primary",
                                        wordBreak: "break-word",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    {profile.email || "N/A"}
                                </Typography>
                            </Box>
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
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

                    {/* Bottom Row */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 3,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
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
                                        color: "text.primary",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    {profile.contactNumber || "N/A"}
                                </Typography>
                            </Box>
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
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

                {/* Academic Scores */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 2,
                        bgcolor: "background.default",
                        p: 3,
                        borderRadius: 1,
                        border: "1px solid #334155",
                    }}
                >
                    <Card
                        sx={{
                            bgcolor: "background.paper",
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
                                    color: "text.secondary",
                                    textTransform: "uppercase",
                                    fontSize: "0.7rem",
                                    fontWeight: "600",
                                }}
                            >
                                CGPA
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        sx={{
                            bgcolor: "background.paper",
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
                                    color: "text.secondary",
                                    textTransform: "uppercase",
                                    fontSize: "0.7rem",
                                    fontWeight: "600",
                                }}
                            >
                                10th Score
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        sx={{
                            bgcolor: "background.paper",
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
                                    color: "text.secondary",
                                    textTransform: "uppercase",
                                    fontSize: "0.7rem",
                                    fontWeight: "600",
                                }}
                            >
                                12th Score
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        sx={{
                            bgcolor: "background.paper",
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
                                            (sum, a) => sum + a.percentageScore,
                                            0
                                        ) / assessmentHistory.length
                                    )
                                    : "N/A"}
                                %
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
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
                    bgcolor: "background.paper",
                    border: "1px solid #334155",
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        color: "text.primary",
                        mb: 3,
                        fontWeight: "bold",
                    }}
                >
                    Assessment History
                </Typography>

                {assessmentHistory.length === 0 ? (
                    <Typography
                        sx={{ color: "text.secondary", textAlign: "center", py: 3 }}
                    >
                        No assessment attempts yet
                    </Typography>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ borderBottom: "1px solid #334155" }}>
                                    <TableCell
                                        sx={{ color: "text.secondary", fontWeight: "bold" }}
                                    >
                                        Assessment
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ color: "text.secondary", fontWeight: "bold" }}
                                    >
                                        Score
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ color: "text.secondary", fontWeight: "bold" }}
                                    >
                                        Percentage
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ color: "text.secondary", fontWeight: "bold" }}
                                    >
                                        Status
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ color: "text.secondary", fontWeight: "bold" }}
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
                                            "&:hover": { bgcolor: "background.default" },
                                        }}
                                    >
                                        <TableCell sx={{ color: "text.primary", py: 2 }}>
                                            {attempt.title}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                color: "#10b981",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {attempt.overallScore}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                color: "#f59e0b",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {attempt.percentageScore}%
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={attempt.grade}
                                                sx={{
                                                    bgcolor: "#10b98120",
                                                    color: "#10b981",
                                                    textTransform: "capitalize",
                                                    fontWeight: "600",
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary" }}>
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
