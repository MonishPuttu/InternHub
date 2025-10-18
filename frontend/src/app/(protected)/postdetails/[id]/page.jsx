"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Box,
    Typography,
    Button,
    Card,
    Chip,
    Stack,
    IconButton,
    Divider,
    Grid,
    CircularProgress,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    AttachMoney as AttachMoneyIcon,
    LocationOn as LocationOnIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Link as LinkIcon,
    Business as BusinessIcon,
    Work as WorkIcon,
    CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const statusColors = {
    applied: "#64748b",
    interview_scheduled: "#0ea5e9",
    interviewed: "#8b5cf6",
    offer: "#10b981",
    rejected: "#ef4444",
};

const statusLabels = {
    applied: "Applied",
    interview_scheduled: "Interview Scheduled",
    interviewed: "Interviewed",
    offer: "Offer Received",
    rejected: "Rejected",
};

export default function PostDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const postId = params?.id;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (postId) {
            fetchPostDetails();
        }
    }, [postId]);

    const fetchPostDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${BACKEND_URL}/api/posts/applications/${postId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.ok) {
                setPost(response.data.application);
            } else {
                setError("Post not found");
            }
        } catch (error) {
            console.error("Error fetching post details:", error);
            setError("Failed to load post details");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
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
                <CircularProgress sx={{ color: "#8b5cf6" }} />
            </Box>
        );
    }

    if (error || !post) {
        return (
            <Box sx={{ p: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                        color: "#94a3b8",
                        mb: 3,
                        "&:hover": { bgcolor: "rgba(139, 92, 246, 0.1)" },
                    }}
                >
                    Back
                </Button>
                <Card
                    sx={{
                        bgcolor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: 2,
                        p: 6,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h6" sx={{ color: "#ef4444", mb: 2 }}>
                        {error || "Post not found"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        The post you're looking for doesn't exist or has been removed.
                    </Typography>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{
                    color: "#94a3b8",
                    mb: 3,
                    "&:hover": { bgcolor: "rgba(139, 92, 246, 0.1)" },
                    textTransform: "none",
                    fontWeight: 600,
                }}
            >
                Back to Opportunities
            </Button>

            {/* Main Content Card */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                {/* Header Image */}
                {post.media && (
                    <Box
                        component="img"
                        src={post.media}
                        alt={post.company_name}
                        sx={{
                            width: "100%",
                            maxHeight: 400,
                            objectFit: "cover",
                            borderBottom: "2px solid #334155",
                        }}
                    />
                )}

                {/* Content */}
                <Box sx={{ p: 4 }}>
                    {/* Title Section */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "start", gap: 2, mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="h4"
                                    sx={{ color: "#e2e8f0", fontWeight: 700, mb: 1 }}
                                >
                                    {post.position}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#94a3b8", fontWeight: 600, mb: 2 }}
                                >
                                    {post.company_name}
                                </Typography>
                            </Box>

                            {/* Status Badges */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <Chip
                                    label={statusLabels[post.status]}
                                    sx={{
                                        bgcolor: `${statusColors[post.status]}30`,
                                        color: statusColors[post.status],
                                        fontWeight: 600,
                                        border: `1px solid ${statusColors[post.status]}`,
                                    }}
                                />
                                <Chip
                                    label={post.is_approved ? "Approved" : "Pending Approval"}
                                    sx={{
                                        bgcolor: post.is_approved
                                            ? "rgba(16, 185, 129, 0.1)"
                                            : "rgba(251, 191, 36, 0.1)",
                                        color: post.is_approved ? "#10b981" : "#fbbf24",
                                        fontWeight: 600,
                                        border: `1px solid ${post.is_approved
                                            ? "rgba(16, 185, 129, 0.3)"
                                            : "rgba(251, 191, 36, 0.3)"
                                            }`,
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ bgcolor: "#334155", mb: 4 }} />

                    {/* Key Information Grid */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Industry */}
                        {post.industry && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <BusinessIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                                            Industry
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                        {post.industry}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {/* Package */}
                        {post.package_offered && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <AttachMoneyIcon sx={{ fontSize: 20, color: "#10b981" }} />
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                                            Package Offered
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                        ₹{post.package_offered}L per annum
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {/* Location */}
                        {post.location && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <LocationOnIcon sx={{ fontSize: 20, color: "#0ea5e9" }} />
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                                            Location
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                        {post.location}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {/* Job Type */}
                        {post.job_type && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <WorkIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                                            Job Type
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                        {post.job_type}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {/* Application Date */}
                        {post.application_date && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <CalendarIcon sx={{ fontSize: 20, color: "#64748b" }} />
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                                            Posted Date
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                        {new Date(post.application_date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {/* Application Deadline */}
                        {post.application_deadline && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <AccessTimeIcon sx={{ fontSize: 20, color: "#ef4444" }} />
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                                            Application Deadline
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                        {new Date(post.application_deadline).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {/* Interview Date */}
                        {post.interview_date && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <CalendarIcon sx={{ fontSize: 20, color: "#0ea5e9" }} />
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                                            Interview Date
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                        {new Date(post.interview_date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>

                    {/* Contact Information Section */}
                    {(post.contact_person || post.contact_email) && (
                        <>
                            <Divider sx={{ bgcolor: "#334155", mb: 3 }} />
                            <Box sx={{ mb: 4 }}>
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#e2e8f0", fontWeight: 700, mb: 3 }}
                                >
                                    Contact Information
                                </Typography>
                                <Grid container spacing={3}>
                                    {post.contact_person && (
                                        <Grid item xs={12} sm={6}>
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    bgcolor: "#0f172a",
                                                    borderRadius: 2,
                                                    border: "1px solid #334155",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                    <PersonIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                                                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                                                        Contact Person
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                                    {post.contact_person}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}

                                    {post.contact_email && (
                                        <Grid item xs={12} sm={6}>
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    bgcolor: "#0f172a",
                                                    borderRadius: 2,
                                                    border: "1px solid #334155",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                    <EmailIcon sx={{ fontSize: 20, color: "#10b981" }} />
                                                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                                                        Contact Email
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    component="a"
                                                    href={`mailto:${post.contact_email}`}
                                                    sx={{
                                                        color: "#8b5cf6",
                                                        fontWeight: 600,
                                                        textDecoration: "none",
                                                        "&:hover": { textDecoration: "underline" },
                                                    }}
                                                >
                                                    {post.contact_email}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </>
                    )}

                    {/* Job Link */}
                    {post.job_link && (
                        <>
                            <Divider sx={{ bgcolor: "#334155", mb: 3 }} />
                            <Box sx={{ mb: 4 }}>
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#e2e8f0", fontWeight: 700, mb: 2 }}
                                >
                                    Application Link
                                </Typography>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <LinkIcon sx={{ color: "#8b5cf6" }} />
                                    <Typography
                                        component="a"
                                        href={post.job_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            color: "#8b5cf6",
                                            fontWeight: 600,
                                            textDecoration: "none",
                                            wordBreak: "break-all",
                                            "&:hover": { textDecoration: "underline" },
                                        }}
                                    >
                                        {post.job_link}
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Description/Notes Section */}
                    {post.notes && (
                        <>
                            <Divider sx={{ bgcolor: "#334155", mb: 3 }} />
                            <Box sx={{ mb: 4 }}>
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#e2e8f0", fontWeight: 700, mb: 2 }}
                                >
                                    Description
                                </Typography>
                                <Box
                                    sx={{
                                        p: 3,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: "#94a3b8",
                                            lineHeight: 1.8,
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {post.notes}
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Skills Required Section */}
                    {post.skills_required && post.skills_required.length > 0 && (
                        <>
                            <Divider sx={{ bgcolor: "#334155", mb: 3 }} />
                            <Box sx={{ mb: 4 }}>
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#e2e8f0", fontWeight: 700, mb: 2 }}
                                >
                                    Skills Required
                                </Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                                    {post.skills_required.map((skill, index) => (
                                        <Chip
                                            key={index}
                                            label={skill}
                                            sx={{
                                                bgcolor: "#334155",
                                                color: "#e2e8f0",
                                                fontWeight: 600,
                                                fontSize: "0.875rem",
                                                px: 1,
                                                "&:hover": {
                                                    bgcolor: "#475569",
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Additional Information */}
                    <Divider sx={{ bgcolor: "#334155", mb: 3 }} />
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{ color: "#e2e8f0", fontWeight: 700, mb: 2 }}
                        >
                            Additional Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 2,
                                        border: "1px solid #334155",
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 0.5 }}>
                                        Created At
                                    </Typography>
                                    <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                        {new Date(post.created_at || post.application_date).toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Typography>
                                </Box>
                            </Grid>

                            {post.updated_at && (
                                <Grid item xs={12} sm={6}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: "#0f172a",
                                            borderRadius: 2,
                                            border: "1px solid #334155",
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 0.5 }}>
                                            Last Updated
                                        </Typography>
                                        <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                            {new Date(post.updated_at).toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Box>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{
                        borderColor: "#334155",
                        color: "#94a3b8",
                        "&:hover": {
                            borderColor: "#8b5cf6",
                            bgcolor: "rgba(139, 92, 246, 0.1)",
                        },
                        textTransform: "none",
                        fontWeight: 600,
                        px: 4,
                    }}
                >
                    Back to List
                </Button>
                {post.job_link && (
                    <Button
                        variant="contained"
                        href={post.job_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            bgcolor: "#8b5cf6",
                            "&:hover": { bgcolor: "#7c3aed" },
                            textTransform: "none",
                            fontWeight: 600,
                            px: 4,
                        }}
                    >
                        Apply Now
                    </Button>
                )}
            </Box>
        </Box>
    );
}