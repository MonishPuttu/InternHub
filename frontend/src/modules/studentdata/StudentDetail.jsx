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
    Grid,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function StudentDetail({ studentId }) {
    const router = useRouter();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);

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
        return <LinearProgress sx={{ mt: 2 }} />;
    }

    if (!studentData) {
        return (
            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ color: "text.secondary" }}>
                    Student not found
                </Typography>
            </Container>
        );
    }

    const profile = studentData;
    const assessmentHistory = studentData.reportCards || [];
    const education = studentData.education || [];
    const projects = studentData.projects || [];
    const socialLinks = studentData.socialLinks || {};
    const applications = studentData.applications || [];
    const offers = studentData.offers || [];

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => router.back()}
                sx={{ mb: 2, color: "#8b5cf6" }}
            >
                Back
            </Button>

            {/* Profile & Academic Scores Combined */}
            <Paper elevation={0} sx={{ p: 3, mb: 2, bgcolor: "background.paper", border: "1px solid #e5e7eb", borderRadius: 1 }}>
                <Typography variant="h4" sx={{ color: "text.primary", fontWeight: 600, mb: 3, pb: 2, borderBottom: "1px solid #e5e7eb" }}>
                    {profile.fullName}
                </Typography>

                <TableContainer>
                    <Table size="small">
                        <TableBody>
                            {/* Profile Row */}
                            <TableRow>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>Roll Number</TableCell>
                                <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>{profile.rollNumber}</TableCell>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>Branch</TableCell>
                                <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>{profile.branch || "N/A"}</TableCell>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>Semester</TableCell>
                                <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>{profile.currentSemester || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>Email</TableCell>
                                <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                    {profile.email || "N/A"}
                                </TableCell>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>Phone</TableCell>
                                <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                    {profile.contactNumber || "N/A"}
                                </TableCell>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}></TableCell>
                                <TableCell sx={{ py: 1, borderBottom: "1px solid #e5e7eb" }}></TableCell>
                            </TableRow>
                            {/* Academic Scores Row */}
                            <TableRow>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>CGPA</TableCell>
                                <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>{profile.cgpa || "N/A"}</TableCell>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>10th Score</TableCell>
                                <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>{profile.tenthScore || "N/A"}%</TableCell>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>12th Score</TableCell>
                                <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>{profile.twelfthScore || "N/A"}%</TableCell>

                            </TableRow>


                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Assessment History */}
            <Paper elevation={2} sx={{ p: 2.5, mb: 2, bgcolor: "background.paper", border: "1px solid #334155" }}>
                <Typography variant="h6" sx={{ color: "text.primary", mb: 1.5, fontWeight: "bold" }}>
                    Assessment History
                </Typography>
                {assessmentHistory.length === 0 ? (
                    <Typography sx={{ color: "text.secondary", textAlign: "center", py: 2, fontSize: "0.9rem" }}>
                        No assessment attempts yet
                    </Typography>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ borderBottom: "1px solid #334155" }}>
                                    <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Assessment</TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Score</TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>%</TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Grade</TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assessmentHistory.map((attempt, index) => (
                                    <TableRow key={index} sx={{ borderBottom: "1px solid #334155", "&:hover": { bgcolor: "background.default" } }}>
                                        <TableCell sx={{ color: "text.primary", py: 1.5 }}>{attempt.title}</TableCell>
                                        <TableCell align="center" sx={{ color: "#10b981", fontWeight: "bold" }}>{attempt.overallScore}</TableCell>
                                        <TableCell align="center" sx={{ color: "#f59e0b", fontWeight: "bold" }}>{attempt.percentageScore}%</TableCell>
                                        <TableCell align="center">
                                            <Chip label={attempt.grade} size="small" sx={{ bgcolor: "#10b98120", color: "#10b981", fontWeight: 600, height: 22 }} />
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                            {new Date(attempt.attemptDate).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Applications & Offers */}
            <Paper elevation={2} sx={{ mb: 2, p: 2.5, bgcolor: "background.paper", border: "1px solid #334155" }}>
                <Typography variant="h6" sx={{ color: "text.primary", mb: 1.5, fontWeight: "bold" }}>
                    Applications & Offers
                </Typography>
                {applications.length === 0 && offers.length === 0 ? (
                    <Typography sx={{ color: "text.secondary", textAlign: "center", py: 2, fontSize: "0.9rem" }}>
                        No applications or offers yet
                    </Typography>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ borderBottom: "1px solid #334155" }}>
                                    <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Company</TableCell>
                                    <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Position</TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Status</TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Offer</TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Date</TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {applications.map((app, index) => {
                                    const relatedOffer = offers.find((offer) => offer.applicationId === app.id);
                                    return (
                                        <TableRow key={index} sx={{ borderBottom: "1px solid #334155", "&:hover": { bgcolor: "background.default" } }}>
                                            <TableCell sx={{ color: "text.primary", py: 1.5 }}>{app.companyName}</TableCell>
                                            <TableCell sx={{ color: "text.primary" }}>{app.position}</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={app.applicationStatus}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: app.applicationStatus === "applied" ? "#f59e0b20" : app.applicationStatus === "interview_scheduled" ? "#06b6d420" : app.applicationStatus === "interviewed" ? "#8b5cf620" : app.applicationStatus === "offer-pending" ? "#10b98120" : "#ef444420",
                                                        color: app.applicationStatus === "applied" ? "#f59e0b" : app.applicationStatus === "interview_scheduled" ? "#06b6d4" : app.applicationStatus === "interviewed" ? "#8b5cf6" : app.applicationStatus === "offer-pending" ? "#10b981" : "#ef4444",
                                                        fontWeight: 600,
                                                        height: 22,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {relatedOffer ? (
                                                    <Chip
                                                        label={relatedOffer.offerStatus}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: relatedOffer.offerStatus === "received" ? "#10b98120" : relatedOffer.offerStatus === "rejected" ? "#ef444420" : "#f59e0b20",
                                                            color: relatedOffer.offerStatus === "received" ? "#10b981" : relatedOffer.offerStatus === "rejected" ? "#ef4444" : "#f59e0b",
                                                            fontWeight: 600,
                                                            height: 22,
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>N/A</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                                {new Date(app.appliedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="center">
                                                {relatedOffer && relatedOffer.offerLetterUrl ? (
                                                    <Button
                                                        href={relatedOffer.offerLetterUrl}
                                                        target="_blank"
                                                        download={relatedOffer.fileName || "offer_letter.pdf"}
                                                        size="small"
                                                        sx={{ color: "#8b5cf6", textTransform: "none", fontSize: "0.8rem" }}
                                                    >
                                                        Download
                                                    </Button>
                                                ) : (
                                                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>N/A</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Education & Projects Side by Side */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Education */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2.5, bgcolor: "background.paper", border: "1px solid #334155", height: "100%" }}>
                        <Typography variant="h6" sx={{ color: "text.primary", mb: 1.5, fontWeight: "bold" }}>
                            Education
                        </Typography>
                        {education.length === 0 ? (
                            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>No education details</Typography>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                {education.map((edu, index) => (
                                    <Card key={index} sx={{ bgcolor: "background.default", border: "1px solid #334155", p: 1.5 }}>
                                        <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: "bold", mb: 0.5 }}>
                                            {edu.degree}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 0.5 }}>
                                            {edu.institution}
                                        </Typography>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                {edu.startDate ? new Date(edu.startDate).getFullYear() : "N/A"} - {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#10b981", fontWeight: "bold" }}>
                                                {edu.grade || "N/A"}
                                            </Typography>
                                        </Box>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Projects */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2.5, bgcolor: "background.paper", border: "1px solid #334155", height: "100%" }}>
                        <Typography variant="h6" sx={{ color: "text.primary", mb: 1.5, fontWeight: "bold" }}>
                            Projects
                        </Typography>
                        {projects.length === 0 ? (
                            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>No projects available</Typography>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                {projects.map((project, index) => (
                                    <Card key={index} sx={{ bgcolor: "background.default", border: "1px solid #334155", p: 1.5 }}>
                                        <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: "bold", mb: 0.5 }}>
                                            {project.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 1 }}>
                                            {project.description}
                                        </Typography>
                                        {project.technologies && project.technologies.length > 0 && (
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
                                                {project.technologies.map((tech, techIndex) => (
                                                    <Chip key={techIndex} label={tech} size="small" sx={{ bgcolor: "#8b5cf620", color: "#8b5cf6", fontSize: "0.7rem", height: 20 }} />
                                                ))}
                                            </Box>
                                        )}
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                {project.startDate ? new Date(project.startDate).getFullYear() : "N/A"} - {project.endDate ? new Date(project.endDate).getFullYear() : "Present"}
                                            </Typography>
                                            {project.projectUrl && (
                                                <Button href={project.projectUrl} target="_blank" size="small" sx={{ color: "#8b5cf6", textTransform: "none", p: 0, minWidth: "auto", fontSize: "0.8rem" }}>
                                                    View
                                                </Button>
                                            )}
                                        </Box>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Social Links */}
            <Paper elevation={2} sx={{ p: 2.5, mb: 2, bgcolor: "background.paper", border: "1px solid #334155" }}>
                <Typography variant="h6" sx={{ color: "text.primary", mb: 1.5, fontWeight: "bold" }}>
                    Social Links
                </Typography>
                {!socialLinks.portfolioWebsite && !socialLinks.linkedinProfile && !socialLinks.githubProfile ? (
                    <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>No social links available</Typography>
                ) : (
                    <Grid container spacing={1.5}>
                        {socialLinks.portfolioWebsite && (
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ bgcolor: "background.default", border: "1px solid #334155", textAlign: "center", p: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontWeight: 600, display: "block", mb: 0.5 }}>
                                        Portfolio
                                    </Typography>
                                    <Button href={socialLinks.portfolioWebsite} target="_blank" sx={{ color: "#8b5cf6", textTransform: "none", fontSize: "0.85rem", p: 0 }}>
                                        View Site
                                    </Button>
                                </Card>
                            </Grid>
                        )}
                        {socialLinks.linkedinProfile && (
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ bgcolor: "background.default", border: "1px solid #334155", textAlign: "center", p: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontWeight: 600, display: "block", mb: 0.5 }}>
                                        LinkedIn
                                    </Typography>
                                    <Button href={socialLinks.linkedinProfile} target="_blank" sx={{ color: "#8b5cf6", textTransform: "none", fontSize: "0.85rem", p: 0 }}>
                                        View Profile
                                    </Button>
                                </Card>
                            </Grid>
                        )}
                        {socialLinks.githubProfile && (
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ bgcolor: "background.default", border: "1px solid #334155", textAlign: "center", p: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontWeight: 600, display: "block", mb: 0.5 }}>
                                        GitHub
                                    </Typography>
                                    <Button href={socialLinks.githubProfile} target="_blank" sx={{ color: "#8b5cf6", textTransform: "none", fontSize: "0.85rem", p: 0 }}>
                                        View Profile
                                    </Button>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Paper>


        </Container >
    );
}