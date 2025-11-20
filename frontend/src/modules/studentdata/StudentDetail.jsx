"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { ArrowBack, Email, Phone, LocationOn, School, Web, LinkedIn, GitHub } from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function StudentDetail({ studentId }) {
    const router = useRouter();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStudentDetail();
    }, [studentId]);

    const fetchStudentDetail = async () => {
        try {
            setLoading(true);
            const token = getToken();

            const response = await axios.get(
                `${BACKEND_URL}/api/studentdata/students/${studentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.ok) {
                setStudent(response.data.student);
            } else {
                setError(response.data.error || "Failed to fetch student details");
            }
        } catch (err) {
            setError("Failed to fetch student details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push("/studentdata")}
                    sx={{ color: "#8b5cf6" }}
                >
                    Back to Student Data
                </Button>
            </Box>
        );
    }

    if (!student) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Student not found
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push("/studentdata")}
                    sx={{ color: "#8b5cf6" }}
                >
                    Back to Student Data
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push("/studentdata")}
                sx={{ mb: 3, color: "#8b5cf6" }}
            >
                Back to Student Data
            </Button>

            {/* Header Section */}
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: "background.paper",
                    border: "1px solid #334155",
                    borderRadius: 2,
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <Avatar
                            src={student.profilePicture}
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: "#8b5cf6",
                                fontSize: "2rem",
                            }}
                        >
                            {student.fullName?.charAt(0)?.toUpperCase()}
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h4" sx={{ color: "text.primary", mb: 1 }}>
                            {student.fullName}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                            <Chip
                                icon={<Email />}
                                label={student.email}
                                size="small"
                                sx={{ bgcolor: "#8b5cf620", color: "#8b5cf6" }}
                            />
                            {student.rollNumber && (
                                <Chip
                                    label={`Roll: ${student.rollNumber}`}
                                    size="small"
                                    sx={{ bgcolor: "#10b98120", color: "#10b981" }}
                                />
                            )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            {student.branch && (
                                <Chip
                                    label={student.branch}
                                    size="small"
                                    sx={{ bgcolor: "#f59e0b20", color: "#f59e0b" }}
                                />
                            )}
                            {student.currentSemester && (
                                <Chip
                                    label={`Semester ${student.currentSemester}`}
                                    size="small"
                                    sx={{ bgcolor: "#ef444420", color: "#ef4444" }}
                                />
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                {/* Personal Details */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            bgcolor: "background.paper",
                            border: "1px solid #334155",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
                            Personal Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {student.dateOfBirth && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Date of Birth
                                    </Typography>
                                    <Typography sx={{ color: "text.primary" }}>
                                        {new Date(student.dateOfBirth).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            )}

                            {student.gender && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Gender
                                    </Typography>
                                    <Typography sx={{ color: "text.primary" }}>
                                        {student.gender}
                                    </Typography>
                                </Box>
                            )}

                            {student.contactNumber && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Contact Number
                                    </Typography>
                                    <Typography sx={{ color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
                                        <Phone sx={{ fontSize: 16 }} />
                                        {student.contactNumber}
                                    </Typography>
                                </Box>
                            )}

                            {student.permanentAddress && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Permanent Address
                                    </Typography>
                                    <Typography sx={{ color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
                                        <LocationOn sx={{ fontSize: 16 }} />
                                        {student.permanentAddress}
                                    </Typography>
                                </Box>
                            )}

                            {student.currentAddress && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Current Address
                                    </Typography>
                                    <Typography sx={{ color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
                                        <LocationOn sx={{ fontSize: 16 }} />
                                        {student.currentAddress}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Academic Details */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            bgcolor: "background.paper",
                            border: "1px solid #334155",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
                            Academic Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {student.collegeName && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        College
                                    </Typography>
                                    <Typography sx={{ color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
                                        <School sx={{ fontSize: 16 }} />
                                        {student.collegeName}
                                    </Typography>
                                </Box>
                            )}

                            {student.cgpa && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        CGPA
                                    </Typography>
                                    <Typography sx={{ color: "text.primary" }}>
                                        {student.cgpa}
                                    </Typography>
                                </Box>
                            )}

                            {student.tenthScore && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        10th Score
                                    </Typography>
                                    <Typography sx={{ color: "text.primary" }}>
                                        {student.tenthScore}%
                                    </Typography>
                                </Box>
                            )}

                            {student.twelfthScore && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        12th Score
                                    </Typography>
                                    <Typography sx={{ color: "text.primary" }}>
                                        {student.twelfthScore}%
                                    </Typography>
                                </Box>
                            )}

                            {student.skills && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Skills
                                    </Typography>
                                    <Typography sx={{ color: "text.primary" }}>
                                        {student.skills}
                                    </Typography>
                                </Box>
                            )}

                            {student.extraActivities && (
                                <Box>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Extra Activities
                                    </Typography>
                                    <Typography sx={{ color: "text.primary" }}>
                                        {student.extraActivities}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Social Links */}
                {(student.website || student.linkedin || student.socialLinks?.portfolioWebsite || student.socialLinks?.githubProfile) && (
                    <Grid item xs={12}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                bgcolor: "background.paper",
                                border: "1px solid #334155",
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
                                Online Presence
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                {student.website && (
                                    <Button
                                        startIcon={<Web />}
                                        href={student.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ color: "#8b5cf6" }}
                                    >
                                        Website
                                    </Button>
                                )}
                                {student.linkedin && (
                                    <Button
                                        startIcon={<LinkedIn />}
                                        href={student.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ color: "#0077b5" }}
                                    >
                                        LinkedIn
                                    </Button>
                                )}
                                {student.socialLinks?.portfolioWebsite && (
                                    <Button
                                        startIcon={<Web />}
                                        href={student.socialLinks.portfolioWebsite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ color: "#8b5cf6" }}
                                    >
                                        Portfolio
                                    </Button>
                                )}
                                {student.socialLinks?.githubProfile && (
                                    <Button
                                        startIcon={<GitHub />}
                                        href={student.socialLinks.githubProfile}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ color: "#333" }}
                                    >
                                        GitHub
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                )}

                {/* Report Cards */}
                {student.reportCards && student.reportCards.length > 0 && (
                    <Grid item xs={12}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                bgcolor: "background.paper",
                                border: "1px solid #334155",
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
                                Assessment Report Cards
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>
                                                Assessment
                                            </TableCell>
                                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>
                                                Score
                                            </TableCell>
                                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>
                                                Percentage
                                            </TableCell>
                                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>
                                                Grade
                                            </TableCell>
                                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>
                                                Date
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {student.reportCards.map((card) => (
                                            <TableRow key={card.id}>
                                                <TableCell sx={{ color: "text.primary" }}>
                                                    {card.assessmentTitle}
                                                </TableCell>
                                                <TableCell sx={{ color: "text.primary" }}>
                                                    {card.overallScore}
                                                </TableCell>
                                                <TableCell sx={{ color: "text.primary" }}>
                                                    {card.percentageScore}%
                                                </TableCell>
                                                <TableCell sx={{ color: "text.primary" }}>
                                                    <Chip
                                                        label={card.grade}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: card.grade === 'A+' || card.grade === 'A' ? "#10b98120" :
                                                                card.grade === 'B+' || card.grade === 'B' ? "#f59e0b20" :
                                                                    "#ef444420",
                                                            color: card.grade === 'A+' || card.grade === 'A' ? "#10b981" :
                                                                card.grade === 'B+' || card.grade === 'B' ? "#f59e0b" :
                                                                    "#ef4444",
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: "text.primary" }}>
                                                    {new Date(card.generatedAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                )}

                {/* Education */}
                {student.education && student.education.length > 0 && (
                    <Grid item xs={12}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                bgcolor: "background.paper",
                                border: "1px solid #334155",
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
                                Education
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                {student.education.map((edu) => (
                                    <Grid item xs={12} md={6} key={edu.id}>
                                        <Card sx={{ bgcolor: "background.default" }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ color: "text.primary" }}>
                                                    {edu.degree}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {edu.institution}
                                                </Typography>
                                                {edu.fieldOfStudy && (
                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                        {edu.fieldOfStudy}
                                                    </Typography>
                                                )}
                                                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                                                    {edu.startDate} - {edu.endDate || "Present"}
                                                </Typography>
                                                {edu.grade && (
                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                        Grade: {edu.grade}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>
                )}

                {/* Projects */}
                {student.projects && student.projects.length > 0 && (
                    <Grid item xs={12}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                bgcolor: "background.paper",
                                border: "1px solid #334155",
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
                                Projects
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                {student.projects.map((project) => (
                                    <Grid item xs={12} md={6} key={project.id}>
                                        <Card sx={{ bgcolor: "background.default" }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ color: "text.primary" }}>
                                                    {project.title}
                                                </Typography>
                                                {project.description && (
                                                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                                                        {project.description}
                                                    </Typography>
                                                )}
                                                {project.technologies && (
                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                        Technologies: {project.technologies}
                                                    </Typography>
                                                )}
                                                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                                                    {project.startDate} - {project.endDate || "Present"}
                                                </Typography>
                                                {project.projectUrl && (
                                                    <Button
                                                        href={project.projectUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        size="small"
                                                        sx={{ mt: 1, color: "#8b5cf6" }}
                                                    >
                                                        View Project
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}