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
    ArrowBack,
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
    
    // Pagination states - ONLY for assessment history and applications
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
            // Backend returns { ok: true, student: {...} }
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

    // Backend structure: student object contains all profile data directly + nested arrays
    const profile = studentData || {};
    const applications = studentData?.applications || [];
    const offers = studentData?.offers || [];
    const assessmentHistory = studentData?.assessments || []; // Backend uses 'assessments' not 'assessmentHistory'
    const education = studentData?.education || [];
    const projects = studentData?.projects || [];
    const socialLinks = studentData?.socialLinks;

    // Pagination ONLY for applications and assessments
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
            {/* Header with Back Button */}
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={() => router.back()}
                    sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
                >
                    Back
                </Button>
                <Typography variant="h4" sx={{ color: "text.primary", fontWeight: 600 }}>
                    Student Overall Details
                </Typography>
            </Box>

            {/* Profile Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
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
                        Profile & Academic Scores
                    </Typography>
                </Stack>

                {profile ? (
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
                ) : (
                    <Typography sx={{ color: "text.secondary" }}>No profile data available</Typography>
                )}
            </Paper>

            {/* Assessment History Section - WITH PAGINATION */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
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
                        Assessment History
                    </Typography>
                </Stack>

                {assessmentHistory.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "150px",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            bgcolor: "#fafafa",
                        }}
                    >
                        <Typography sx={{ color: "text.secondary" }}>No assessment attempts yet</Typography>
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Assessment
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Score
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            %
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Grade
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Date
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedAssessments.map((attempt, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                borderBottom: "1px solid",
                                                borderColor: "divider",
                                                "&:hover": { bgcolor: "action.hover" },
                                                "&:last-child": { borderBottom: "none" },
                                            }}
                                        >
                                            <TableCell sx={{ color: "text.primary", py: 2, fontSize: "0.875rem" }}>
                                                {attempt.title || "N/A"}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: "#10b981", fontWeight: "bold", fontSize: "0.875rem" }}>
                                                {attempt.overallScore}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: "#f59e0b", fontWeight: "bold", fontSize: "0.875rem" }}>
                                                {attempt.percentageScore}%
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={attempt.grade}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#10b98120",
                                                        color: "#10b981",
                                                        fontWeight: 600,
                                                        fontSize: "0.75rem",
                                                        height: 24,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.875rem", py: 2 }}>
                                                {new Date(attempt.generatedAt).toLocaleDateString()}
                                            </TableCell>
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
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                sx={{
                                    borderTop: "1px solid",
                                    borderColor: "divider",
                                    mt: 1,
                                    ".MuiTablePagination-toolbar": { color: "text.secondary" },
                                    ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { fontSize: "0.875rem" },
                                }}
                            />
                        )}
                    </>
                )}
            </Paper>

            {/* Applications & Offers Section - WITH PAGINATION */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
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

                {applications.length === 0 && offers.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "150px",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            bgcolor: "#fafafa",
                        }}
                    >
                        <Typography sx={{ color: "text.secondary" }}>No applications or offers yet</Typography>
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Company
                                        </TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Position
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Status
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Offer
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Date
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedApplications.map((app, index) => {
                                        const relatedOffer = offers.find((offer) => offer.applicationId === app.id);
                                        // Handle positions - backend returns JSONB array of objects
                                        // Each position object has: {title, skills, duration, job_type, package_offered}
                                        const position = Array.isArray(app.positions) && app.positions.length > 0 
                                            ? (app.positions[0]?.title || "N/A")
                                            : "N/A";
                                        
                                        return (
                                            <TableRow
                                                key={app.id || index}
                                                sx={{
                                                    borderBottom: "1px solid",
                                                    borderColor: "divider",
                                                    "&:hover": { bgcolor: "action.hover" },
                                                    "&:last-child": { borderBottom: "none" },
                                                }}
                                            >
                                                <TableCell sx={{ color: "text.primary", py: 2, fontSize: "0.875rem" }}>
                                                    {app.companyName || "N/A"}
                                                </TableCell>
                                                <TableCell sx={{ color: "text.primary", py: 2, fontSize: "0.875rem" }}>
                                                    {position}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={app.applicationStatus}
                                                        size="small"
                                                        sx={{
                                                            bgcolor:
                                                                app.applicationStatus === "applied"
                                                                    ? "#f59e0b20"
                                                                    : app.applicationStatus === "interview_scheduled"
                                                                    ? "#06b6d420"
                                                                    : app.applicationStatus === "interviewed"
                                                                    ? "#8b5cf620"
                                                                    : app.applicationStatus === "offer-pending"
                                                                    ? "#10b98120"
                                                                    : "#ef444420",
                                                            color:
                                                                app.applicationStatus === "applied"
                                                                    ? "#f59e0b"
                                                                    : app.applicationStatus === "interview_scheduled"
                                                                    ? "#06b6d4"
                                                                    : app.applicationStatus === "interviewed"
                                                                    ? "#8b5cf6"
                                                                    : app.applicationStatus === "offer-pending"
                                                                    ? "#10b981"
                                                                    : "#ef4444",
                                                            fontWeight: 600,
                                                            fontSize: "0.75rem",
                                                            height: 24,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {relatedOffer ? (
                                                        <Chip
                                                            label={relatedOffer.offerStatus}
                                                            size="small"
                                                            sx={{
                                                                bgcolor:
                                                                    relatedOffer.offerStatus === "received"
                                                                        ? "#10b98120"
                                                                        : relatedOffer.offerStatus === "rejected"
                                                                        ? "#ef444420"
                                                                        : "#f59e0b20",
                                                                color:
                                                                    relatedOffer.offerStatus === "received"
                                                                        ? "#10b981"
                                                                        : relatedOffer.offerStatus === "rejected"
                                                                        ? "#ef4444"
                                                                        : "#f59e0b",
                                                                fontWeight: 600,
                                                                fontSize: "0.75rem",
                                                                height: 24,
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>N/A</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.875rem", py: 2 }}>
                                                    {new Date(app.appliedAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {relatedOffer && relatedOffer.offerLetterUrl ? (
                                                        <Button
                                                            href={relatedOffer.offerLetterUrl}
                                                            target="_blank"
                                                            download={relatedOffer.fileName || "offer_letter.pdf"}
                                                            size="small"
                                                            sx={{
                                                                color: "#8b5cf6",
                                                                textTransform: "none",
                                                                fontSize: "0.875rem",
                                                                fontWeight: 500,
                                                                "&:hover": { bgcolor: "#8b5cf610" },
                                                            }}
                                                        >
                                                            Download
                                                        </Button>
                                                    ) : (
                                                        <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>N/A</Typography>
                                                    )}
                                                </TableCell>
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
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                sx={{
                                    borderTop: "1px solid",
                                    borderColor: "divider",
                                    mt: 1,
                                    ".MuiTablePagination-toolbar": { color: "text.secondary" },
                                    ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { fontSize: "0.875rem" },
                                }}
                            />
                        )}
                    </>
                )}
            </Paper>

            {/* Education Section - NO PAGINATION */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
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

                <Stack spacing={3}>
                    {(!education || education.length === 0) ? (
                        <Box
                            sx={{
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                p: 6,
                                textAlign: "center",
                            }}
                        >
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                No education records added yet
                            </Typography>
                        </Box>
                    ) : (
                        education.map((edu) => (
                            <Box
                                key={edu.id || edu.degree}
                                sx={{
                                    bgcolor: "background.paper",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    p: 3,
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        borderColor: "#8b5cf6",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)",
                                    },
                                }}
                            >
                                <Stack direction="row" spacing={2}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 1,
                                            bgcolor: "#f1f5f9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <School sx={{ color: "#8b5cf6", fontSize: 24 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}>
                                            {edu.degree || "N/A"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                                            {edu.institution || "N/A"}
                                        </Typography>
                                        {edu.fieldOfStudy && (
                                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                                                {edu.fieldOfStudy}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                                            {edu.startDate
                                                ? new Date(edu.startDate).toLocaleDateString("en-US", { year: "numeric" })
                                                : "N/A"}{" "}
                                            - {edu.endDate ? new Date(edu.endDate).toLocaleDateString("en-US", { year: "numeric" }) : "Present"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 600 }}>
                                            {`CGPA/Percentage: ${edu.grade || "N/A"}`}
                                        </Typography>
                                        {edu.coursework && (
                                            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, lineHeight: 1.6 }}>
                                                <strong>Relevant coursework:</strong> {edu.coursework}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Box>
                        ))
                    )}
                </Stack>
            </Paper>

            {/* Projects Section - NO PAGINATION */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
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

                <Stack spacing={3}>
                    {projects.length === 0 ? (
                        <Box
                            sx={{
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                p: 6,
                                textAlign: "center",
                            }}
                        >
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                No projects available
                            </Typography>
                        </Box>
                    ) : (
                        projects.map((project, index) => (
                            <Box
                                key={index}
                                sx={{
                                    bgcolor: "background.paper",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    p: 3,
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        borderColor: "#8b5cf6",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)",
                                    },
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 1,
                                            bgcolor: "#f1f5f9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <FolderOpen sx={{ color: "#8b5cf6", fontSize: 24 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}>
                                            {project.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1, lineHeight: 1.5 }}>
                                            {project.description}
                                        </Typography>
                                        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                                                {project.technologies.map((tech, techIndex) => (
                                                    <Chip
                                                        key={techIndex}
                                                        label={tech}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#8b5cf620",
                                                            color: "#8b5cf6",
                                                            fontSize: "0.75rem",
                                                            height: 24,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                {project.startDate
                                                    ? new Date(project.startDate).toLocaleDateString("en-US", {
                                                          month: "short",
                                                          year: "numeric",
                                                      })
                                                    : "N/A"}{" "}
                                                -{" "}
                                                {project.endDate
                                                    ? new Date(project.endDate).toLocaleDateString("en-US", {
                                                          month: "short",
                                                          year: "numeric",
                                                      })
                                                    : "Present"}
                                            </Typography>
                                            {project.projectUrl && (
                                                <Button
                                                    href={project.projectUrl}
                                                    target="_blank"
                                                    size="small"
                                                    sx={{
                                                        color: "#8b5cf6",
                                                        textTransform: "none",
                                                        p: 0,
                                                        minWidth: "auto",
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Box>
                        ))
                    )}
                </Stack>
            </Paper>

            {/* Social Links Section - NO PAGINATION */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
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

                <Stack spacing={3}>
                    {!socialLinks?.portfolioWebsite && !socialLinks?.linkedinProfile && !socialLinks?.githubProfile ? (
                        <Box
                            sx={{
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                p: 6,
                                textAlign: "center",
                            }}
                        >
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                No social links available
                            </Typography>
                        </Box>
                    ) : (
                        [
                            {
                                key: "portfolioWebsite",
                                label: "Portfolio",
                                url: socialLinks?.portfolioWebsite,
                                icon: <LanguageIcon sx={{ fontSize: 28, color: "text.primary" }} />,
                                buttonLabel: "View Site",
                            },
                            {
                                key: "linkedinProfile",
                                label: "LinkedIn",
                                url: socialLinks?.linkedinProfile,
                                icon: <LinkedInIcon sx={{ fontSize: 28, color: "#0A66C2" }} />,
                                buttonLabel: "View Profile",
                            },
                            {
                                key: "githubProfile",
                                label: "GitHub",
                                url: socialLinks?.githubProfile,
                                icon: <GitHubIcon sx={{ fontSize: 28, color: "text.primary" }} />,
                                buttonLabel: "View Profile",
                            },
                        ]
                            .filter((item) => item.url)
                            .map((item) => (
                                <Box
                                    key={item.key}
                                    sx={{
                                        bgcolor: "background.paper",
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        p: 3,
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            borderColor: "#8b5cf6",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)",
                                        },
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 1,
                                                bgcolor: "#f1f5f9",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}>
                                                {item.label}
                                            </Typography>
                                            <Button
                                                href={item.url}
                                                target="_blank"
                                                sx={{
                                                    color: "#8b5cf6",
                                                    textTransform: "none",
                                                    fontSize: "0.9rem",
                                                    p: 0,
                                                }}
                                            >
                                                {item.buttonLabel}
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Box>
                            ))
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}