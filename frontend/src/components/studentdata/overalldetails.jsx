"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Stack,
    Button,
    Chip,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
} from "@mui/material";
import {
    Person,
    Description,
    Work,
    School,
    FolderOpen,
    Link as LinkIcon,
    Language as LanguageIcon,
    LinkedIn as LinkedInIcon,
    GitHub as GitHubIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function OverallDetailsConsolidated({ studentId }) {
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [studentData, setStudentData] = useState(null);
    
    const [applicationsPage, setApplicationsPage] = useState(0);
    const [applicationsRowsPerPage, setApplicationsRowsPerPage] = useState(10);
    const [assessmentPage, setAssessmentPage] = useState(0);
    const [assessmentRowsPerPage, setAssessmentRowsPerPage] = useState(10);

    useEffect(() => {
        if (studentId) {
            fetchStudentData();
        }
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(
                `${BACKEND_URL}/api/studentdata/students/${studentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudentData(response.data.student);
        } catch (err) {
            setError("Failed to fetch student data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => router.back()} sx={{ mt: 2 }}>Go Back</Button>
            </Box>
        );
    }

    const profile = studentData || {};
    const applications = studentData?.applications || [];
    const offers = studentData?.offers || [];
    const assessmentHistory = studentData?.assessments || [];
    const education = studentData?.education || [];
    const projects = studentData?.projects || [];
    const socialLinks = studentData?.socialLinks;

    const paginatedApplications = applications.slice(
        applicationsPage * applicationsRowsPerPage,
        applicationsPage * applicationsRowsPerPage + applicationsRowsPerPage
    );

    const paginatedAssessments = assessmentHistory.slice(
        assessmentPage * assessmentRowsPerPage,
        assessmentPage * assessmentRowsPerPage + assessmentRowsPerPage
    );

    return (
        <Box sx={{ p: 3, backgroundColor: "background.default", minHeight: "100vh" }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Typography variant="h4" sx={{ color: "text.primary", fontWeight: 600 }}>
                    Student Overall Details
                </Typography>
            </Box>

            {/* ROW 1: Profile + (Projects/Education) - USING CSS GRID */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                    mb: 3,
                }}
            >
                {/* Profile - Left Column */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                bgcolor: "#8b5cf620",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Person sx={{ color: "#8b5cf6", fontSize: 28 }} />
                        </Box>
                        <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
                            Profile & Academic
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 3,
                        }}
                    >
                        {[
                            { label: "Full Name", value: profile.fullName || "N/A" },
                            { label: "Roll Number", value: profile.rollNumber || "N/A" },
                            { label: "Branch", value: profile.branch || "N/A" },
                            { label: "Semester", value: profile.currentSemester || "N/A" },
                            { label: "Email", value: profile.email || "N/A" },
                            { label: "Phone", value: profile.contactNumber || "N/A" },
                            { label: "CGPA", value: profile.cgpa || "N/A" },
                            { label: "10th Score", value: profile.tenthScore ? profile.tenthScore + "%" : "N/A" },
                            { label: "12th Score", value: profile.twelfthScore ? profile.twelfthScore + "%" : "N/A" },
                            { label: "Career Path", value: profile.careerPath || "N/A" },
                        ].map(({ label, value }, idx) => (
                            <Stack key={idx} spacing={0.5}>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                    {label}
                                </Typography>
                                <Typography variant="body1" sx={{ color: "text.primary" }}>
                                    {value}
                                </Typography>
                            </Stack>
                        ))}
                    </Box>
                </Paper>

                {/* Projects + Education - Right Column STACKED */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Projects - Top Half */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            flex: 1,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            minHeight: "250px",
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexShrink: 0 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1.5,
                                    bgcolor: "#ef444420",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <FolderOpen sx={{ color: "#ef4444", fontSize: 28 }} />
                            </Box>
                            <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
                                Projects
                            </Typography>
                        </Stack>

                        <Box sx={{ flex: 1, overflow: "auto" }}>
                            {projects.length === 0 ? (
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "150px" }}>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        No projects available
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={2}>
                                    {projects.map((project, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                bgcolor: "#fafafa",
                                                borderRadius: 2,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                p: 2,
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}>
                                                {project.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                                                {project.description}
                                            </Typography>
                                            {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                    {project.technologies.map((tech, techIndex) => (
                                                        <Chip
                                                            key={techIndex}
                                                            label={tech}
                                                            size="small"
                                                            sx={{ bgcolor: "#8b5cf620", color: "#8b5cf6", fontSize: "0.75rem" }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Paper>

                    {/* Education - Bottom Half */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            flex: 1,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            minHeight: "250px",
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexShrink: 0 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1.5,
                                    bgcolor: "#f59e0b20",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <School sx={{ color: "#f59e0b", fontSize: 28 }} />
                            </Box>
                            <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
                                Education
                            </Typography>
                        </Stack>

                        <Box sx={{ flex: 1, overflow: "auto" }}>
                            {(!education || education.length === 0) ? (
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "150px" }}>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        No education records added yet
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={2}>
                                    {education.map((edu) => (
                                        <Box
                                            key={edu.id || edu.degree}
                                            sx={{
                                                bgcolor: "#fafafa",
                                                borderRadius: 2,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                p: 2,
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}>
                                                {edu.degree || "N/A"}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                                                {edu.institution || "N/A"}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 600 }}>
                                                CGPA: {edu.grade || "N/A"}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* ROW 2: Assessment + Applications - USING CSS GRID */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                    mb: 3,
                }}
            >
                {/* Assessment - Left */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "400px",
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexShrink: 0 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                bgcolor: "#06b6d420",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Description sx={{ color: "#06b6d4", fontSize: 28 }} />
                        </Box>
                        <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
                            Assessment
                        </Typography>
                    </Stack>

                    {assessmentHistory.length === 0 ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                            <Typography sx={{ color: "text.secondary" }}>No assessment attempts yet</Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer sx={{ flex: 1, overflow: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Assessment</TableCell>
                                            <TableCell align="center">Score</TableCell>
                                            <TableCell align="center">%</TableCell>
                                            <TableCell align="center">Grade</TableCell>
                                            <TableCell align="center">Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedAssessments.map((attempt, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{attempt.title || "N/A"}</TableCell>
                                                <TableCell align="center">{attempt.overallScore}</TableCell>
                                                <TableCell align="center">{attempt.percentageScore}%</TableCell>
                                                <TableCell align="center">
                                                    <Chip label={attempt.grade} size="small" sx={{ bgcolor: "#10b98120", color: "#10b981" }} />
                                                </TableCell>
                                                <TableCell align="center">{new Date(attempt.generatedAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {assessmentHistory.length > 10 && (
                                <TablePagination
                                    component="div"
                                    count={assessmentHistory.length}
                                    page={assessmentPage}
                                    onPageChange={(e, newPage) => setAssessmentPage(newPage)}
                                    rowsPerPage={assessmentRowsPerPage}
                                    onRowsPerPageChange={(e) => {
                                        setAssessmentRowsPerPage(parseInt(e.target.value, 10));
                                        setAssessmentPage(0);
                                    }}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    sx={{ flexShrink: 0 }}
                                />
                            )}
                        </>
                    )}
                </Paper>

                {/* Applications - Right */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "400px",
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexShrink: 0 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                bgcolor: "#10b98120",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Work sx={{ color: "#10b981", fontSize: 28 }} />
                        </Box>
                        <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
                            Applications & Offers
                        </Typography>
                    </Stack>

                    {applications.length === 0 ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                            <Typography sx={{ color: "text.secondary" }}>No applications or offers yet</Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer sx={{ flex: 1, overflow: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Company</TableCell>
                                            <TableCell>Position</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                            <TableCell align="center">Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedApplications.map((app, index) => {
                                            const position = Array.isArray(app.positions) && app.positions.length > 0 
                                                ? (app.positions[0]?.title || "N/A")
                                                : "N/A";
                                            
                                            return (
                                                <TableRow key={app.id || index}>
                                                    <TableCell>{app.companyName || "N/A"}</TableCell>
                                                    <TableCell>{position}</TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={app.applicationStatus}
                                                            size="small"
                                                            sx={{ bgcolor: "#8b5cf620", color: "#8b5cf6" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {applications.length > 10 && (
                                <TablePagination
                                    component="div"
                                    count={applications.length}
                                    page={applicationsPage}
                                    onPageChange={(e, newPage) => setApplicationsPage(newPage)}
                                    rowsPerPage={applicationsRowsPerPage}
                                    onRowsPerPageChange={(e) => {
                                        setApplicationsRowsPerPage(parseInt(e.target.value, 10));
                                        setApplicationsPage(0);
                                    }}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    sx={{ flexShrink: 0 }}
                                />
                            )}
                        </>
                    )}
                </Paper>
            </Box>

            {/* ROW 3: Social Links (Full Width) */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            bgcolor: "#2563eb20",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <LinkIcon sx={{ color: "#2563eb", fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
                        Social Links
                    </Typography>
                </Stack>

                {!socialLinks?.portfolioWebsite && !socialLinks?.linkedinProfile && !socialLinks?.githubProfile ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            No social links available
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {[
                            {
                                key: "portfolioWebsite",
                                label: "Portfolio",
                                url: socialLinks?.portfolioWebsite,
                                icon: <LanguageIcon sx={{ fontSize: 28 }} />,
                            },
                            {
                                key: "linkedinProfile",
                                label: "LinkedIn",
                                url: socialLinks?.linkedinProfile,
                                icon: <LinkedInIcon sx={{ fontSize: 28, color: "#0A66C2" }} />,
                            },
                            {
                                key: "githubProfile",
                                label: "GitHub",
                                url: socialLinks?.githubProfile,
                                icon: <GitHubIcon sx={{ fontSize: 28 }} />,
                            },
                        ]
                            .filter((item) => item.url)
                            .map((item) => (
                                <Box
                                    key={item.key}
                                    sx={{
                                        bgcolor: "#fafafa",
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        p: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    {item.icon}
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {item.label}
                                        </Typography>
                                        <Button
                                            href={item.url}
                                            target="_blank"
                                            sx={{ color: "#8b5cf6", textTransform: "none", p: 0 }}
                                        >
                                            View Profile
                                        </Button>
                                    </Box>
                                </Box>
                            ))}
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}