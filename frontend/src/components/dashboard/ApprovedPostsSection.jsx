"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Paper, Button, Alert, Chip } from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  List as ListIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function ApprovedPostsSection({
  searchQuery,
  filterPostedDate,
  filterIndustry,
}) {
  const router = useRouter();
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchApprovedPosts();
  }, [searchQuery, filterPostedDate, filterIndustry]);

  const fetchApprovedPosts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/approved-posts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        let posts = response.data.posts || [];

        if (searchQuery) {
          posts = posts.filter(
            (post) =>
              post.company_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              post.position?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (filterPostedDate) {
          posts = posts.filter((post) => {
            const postDate = new Date(post.application_date)
              .toISOString()
              .split("T")[0];
            return postDate === filterPostedDate;
          });
        }

        if (filterIndustry) {
          posts = posts.filter((post) => post.industry === filterIndustry);
        }

        setApprovedPosts(posts);
      }
    } catch (error) {
      console.error("Error fetching approved posts:", error);
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
    e.stopPropagation(); // Prevent card click from firing
    router.push(`/dashboard/placement/applications/${postId}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading posts...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Approved Posts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {approvedPosts.length} post{approvedPosts.length !== 1 ? "s" : ""}{" "}
          found
        </Typography>
      </Box>

      {approvedPosts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No approved posts found
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
          {approvedPosts.map((post) => (
            <Box
              key={post.id}
              onClick={() => handleViewDetails(post.id)}
              sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "all 0.3s ease",
                bgcolor: "background.paper",
                overflow: "hidden",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
                  borderColor: "primary.main",
                },
              }}
            >
              {/* Card Content */}
              <Box sx={{ p: 3, flexGrow: 1 }}>
                {/* Icon and Header */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 32, color: "white" }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: "text.secondary",
                      letterSpacing: 0.5,
                    }}
                  >
                    Latest Opportunity
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  >
                    {getRelativeTime(post.application_date)}
                  </Typography>
                </Box>

                {/* Company Name */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    lineHeight: 1.3,
                  }}
                >
                  {post.company_name}
                </Typography>

                {/* Openings Available */}
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
                      fontWeight: 500,
                    }}
                  >
                    {post.openings_available || "200"} Openings Available
                  </Typography>
                </Box>

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

              {/* Card Action */}
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