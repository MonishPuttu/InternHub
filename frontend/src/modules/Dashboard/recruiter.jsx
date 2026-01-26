"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Paper, Button, Alert, Chip } from "@mui/material";
import {
  List as ListIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchRecruiterPosts();
  }, []);

  const fetchRecruiterPosts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/posts/my-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.ok) {
        // Filter only approved posts
        const approvedPosts = (response.data.posts || []).filter(
          (post) => post.approval_status === "approved"
        );
        setPosts(approvedPosts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setErrorMsg("Failed to load posts");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Posted today";
    if (diffDays === 1) return "Posted 1 day ago";
    return `Posted ${diffDays} days ago`;
  };

  const handleViewDetails = (postId) => {
    router.push(`/Post/postdetails/${postId}`);
  };

  const handleViewApplications = (postId, e) => {
    e.stopPropagation();
    router.push(`/dashboard/recruiter/applications/${postId}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading posts...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              My Job Posts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage applications for your job postings
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {posts.length} post{posts.length !== 1 ? "s" : ""} found
          </Typography>
        </Box>
      </Box>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" variant="h6">
            No approved posts yet
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Your job posts will appear here once approved by placement cell
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
            width: "100%",
          }}
        >
          {posts.map((post) => (
            <Box
              key={post.id}
              onClick={() => handleViewDetails(post.id)}
              sx={{
                display: "flex",
                flexDirection: "column",
                border: "2px solid",
                borderColor: "transparent",
                borderRadius: 2,
                transition: "all 0.3s ease",
                bgcolor: "background.paper",
                overflow: "hidden",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
                  borderColor: "#8b5cf6",
                },
              }}
            >
              {/* Card Content */}
              <Box sx={{ p: 3, flexGrow: 1 }}>
                {/* Icon and Status Badge */}
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 32, color: "white" }} />
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Chip
                      label="✓ APPROVED"
                      size="small"
                      sx={{
                        bgcolor: "rgba(16, 185, 129, 0.2)",
                        color: "#10b981",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        border: "1px solid #10b981",
                        height: 24,
                      }}
                    />

                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.7rem",
                      }}
                    >
                      {getRelativeTime(post.application_date)}
                    </Typography>
                  </Box>
                </Box>

                {/* Company Name */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {post.company_name}
                </Typography>

                {/* Position */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  {post.position}
                </Typography>

                {/* Package */}
                {post.package_offered && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#10b981",
                        mr: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#10b981",
                        fontWeight: 600,
                      }}
                    >
                      ₹{post.package_offered} LPA
                    </Typography>
                  </Box>
                )}

                {/* Industry Chip */}
                <Chip
                  label={post.industry}
                  size="small"
                  sx={{
                    bgcolor: "rgba(59, 130, 246, 0.15)",
                    color: "#3b82f6",
                    fontWeight: 500,
                    borderRadius: 1,
                    mb: 3,
                  }}
                />

                {/* Posted Date */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CalendarIcon
                    sx={{ fontSize: 18, color: "primary.main" }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                      }}
                    >
                      Posted On
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {new Date(post.application_date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Card Actions */}
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  startIcon={<ListIcon />}
                  onClick={(e) => handleViewApplications(post.id, e)}
                  sx={{
                    textTransform: "none",
                    bgcolor: "#a855f7",
                    color: "white",
                    fontWeight: 600,
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "#9333ea",
                    },
                  }}
                >
                  View Applications
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {errorMsg && (
        <Alert
          severity="error"
          sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}
        >
          {errorMsg}
        </Alert>
      )}
    </Box>
  );
}