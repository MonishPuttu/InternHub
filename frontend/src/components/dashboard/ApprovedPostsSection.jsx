"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Paper, Button, Alert } from "@mui/material";
import {
  Visibility as VisibilityIcon,
  List as ListIcon,
  Business as BusinessIcon,
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

  // Import CSV function
  const handleImportCSV = async (event) => {
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

  const handleViewDetails = (postId) => {
    router.push(`/Post/postdetails/${postId}`);
  };

  const handleViewApplications = (postId) => {
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
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Approved Posts
      </Typography>

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
              md: "repeat(2, 1fr)",
            },
            gap: 3,
            width: "100%",
          }}
        >
          {approvedPosts.map((post) => (
            <Box
              key={post.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                transition: "all 0.3s ease",
                bgcolor: "background.paper",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px rgba(139, 92, 246, 0.2)",
                  borderColor: "primary.main",
                },
              }}
            >
              {/* Card Content */}
              <Box sx={{ p: 3, flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "white",
                      mr: 2,
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {post.company_name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      {post.position}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Industry:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {post.industry}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Posted:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(post.application_date).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {post.package_offered && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: "rgba(16, 185, 129, 0.1)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "success.dark", fontWeight: 600 }}
                      >
                        Package:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "success.dark", fontWeight: 700 }}
                      >
                        ₹{post.package_offered} LPA
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Card Actions */}
              <Box
                sx={{
                  p: 2,
                  pt: 0,
                  display: "flex",
                  gap: 1.5,
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewDetails(post.id)}
                  sx={{
                    flex: "1 1 0",
                    minWidth: 0,
                    textTransform: "none",
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                      borderColor: "primary.dark",
                      bgcolor: "rgba(139, 92, 246, 0.08)",
                    },
                  }}
                >
                  View Details
                </Button>
                <Button
                  size="medium"
                  variant="contained"
                  startIcon={<ListIcon />}
                  onClick={() => handleViewApplications(post.id)}
                  sx={{
                    flex: "1 1 0",
                    minWidth: 0,
                    textTransform: "none",
                    bgcolor: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.dark",
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
