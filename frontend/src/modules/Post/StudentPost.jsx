"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Stack,
  Snackbar,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Pagination,
} from "@mui/material";
import axios from "axios";
import { BACKEND_URL, INDUSTRIES } from "@/constants/postConstants";
import PostCard from "@/components/Post/PostCard";
import { useTheme } from "@mui/material/styles";
import ApplyDialog from "@/components/Post/ApplyDialog";

export default function StudentPosts() {
  const router = useRouter();
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedPosts, setSavedPosts] = useState([]);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [appliedPosts, setAppliedPosts] = useState([]);
  const [showAppliedOnly, setShowAppliedOnly] = useState(false);
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    fetchApprovedPosts();
    loadSavedPosts();
    loadAppliedPosts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterIndustry,
    searchQuery,
    showSavedOnly,
    showAppliedOnly,
    showHistoryOnly,
  ]);

  useEffect(() => {
    if (posts.length > 0) {
      fetchAppliedPostsFromBackend();
    }
  }, [posts]);

  const fetchApprovedPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/approved-posts?limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.ok) {
        const approvedPosts = response.data.posts.filter(
          (post) => post.approval_status === "approved"
        );
        setPosts(approvedPosts);
      }
    } catch (error) {
      console.error("Error fetching approved posts:", error);
      setErrorMsg("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPosts = () => {
    const saved = localStorage.getItem("savedPosts");
    if (saved) setSavedPosts(JSON.parse(saved));
  };

  const loadAppliedPosts = () => {
    const applied = localStorage.getItem("appliedPosts");
    if (applied) setAppliedPosts(JSON.parse(applied));
  };

  const fetchAppliedPostsFromBackend = async () => {
    try {
      const token = localStorage.getItem("token");
      const appliedIds = [];
      for (const post of posts) {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/api/student-applications/check-applied/${post.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data.ok && response.data.hasApplied) {
            appliedIds.push(post.id);
          }
        } catch (error) {
          console.error(
            `Error checking application for post ${post.id}:`,
            error
          );
        }
      }
      setAppliedPosts(appliedIds);
      localStorage.setItem("appliedPosts", JSON.stringify(appliedIds));
    } catch (error) {
      console.error("Error fetching applied posts:", error);
    }
  };

  const toggleSavePost = (postId) => {
    let updated = [...savedPosts];
    if (updated.includes(postId)) {
      updated = updated.filter((id) => id !== postId);
      setSuccessMsg("Post removed from saved");
    } else {
      updated.push(postId);
      setSuccessMsg("Post saved successfully");
    }
    setSavedPosts(updated);
    localStorage.setItem("savedPosts", JSON.stringify(updated));
  };

  const handleApplyClick = (post) => {
    setSelectedPost(post);
    setApplyDialogOpen(true);
  };

  const handleShare = async (post) => {
    const url = `${window.location.origin}/Post/postdetails/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setSuccessMsg("Post link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      setErrorMsg("Failed to copy link");
    }
  };

  const handleApplySubmit = async (coverLetter, resumeLink) => {
    if (!selectedPost) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/api/student-applications/apply/${selectedPost.id}`,
        { cover_letter: coverLetter, resume_link: resumeLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.ok) {
        setSuccessMsg("Application submitted successfully!");
        const updatedApplied = [...appliedPosts, selectedPost.id];
        setAppliedPosts(updatedApplied);
        localStorage.setItem("appliedPosts", JSON.stringify(updatedApplied));
        setApplyDialogOpen(false);
        setSelectedPost(null);
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.error || "Failed to submit application"
      );
    }
  };

  const isExpired = (post) => {
    if (!post.application_deadline) return true;
    const deadline = new Date(post.application_deadline);
    const now = new Date();
    return deadline < now;
  };

  const getFilteredPosts = () => {
    let filtered = posts;
    if (showAppliedOnly) {
      filtered = filtered.filter(
        (post) => appliedPosts.includes(post.id) && !isExpired(post)
      );
    } else if (showHistoryOnly) {
      filtered = filtered.filter(
        (post) => appliedPosts.includes(post.id) && isExpired(post)
      );
    } else {
      filtered = filtered.filter((post) => !appliedPosts.includes(post.id));
    }
    if (showSavedOnly) {
      filtered = filtered.filter((post) => savedPosts.includes(post.id));
    }
    return filtered.filter((post) => {
      const matchesIndustry =
        filterIndustry === "all" || post.industry === filterIndustry;
      const matchesSearch =
        post.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesIndustry && matchesSearch;
    });
  };

  const filteredPosts = getFilteredPosts();
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "text.primary" }}>
          Loading available opportunities...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ color: "text.primary", fontWeight: 700, mb: 0.5 }}
        >
          {showAppliedOnly
            ? "Applied Posts"
            : showHistoryOnly
            ? "Application History"
            : "Available Opportunities"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          {showAppliedOnly
            ? "View and track your applied internship and job opportunities"
            : showHistoryOnly
            ? "View your past applications that have expired or closed"
            : "Explore and apply to approved internship and job opportunities"}
        </Typography>

        {/* Stats */}
        <Stack direction="row" spacing={3} sx={{ mb: 3, flexWrap: "wrap" }}>
          <Box
            sx={{
              cursor: "pointer",
              p: 2,
              borderRadius: 1,
              border: "2px solid",
              borderColor:
                !showAppliedOnly && !showSavedOnly && !showHistoryOnly
                  ? "#8b5cf6"
                  : theme.palette.mode === "dark"
                  ? "#334155"
                  : "#e2e8f0",
              bgcolor: "background.paper",
              boxShadow:
                !showAppliedOnly && !showSavedOnly && !showHistoryOnly
                  ? "0 0 10px rgba(139, 92, 246, 0.5)"
                  : "none",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#8b5cf6",
              },
            }}
            onClick={() => {
              setShowAppliedOnly(false);
              setShowSavedOnly(false);
              setShowHistoryOnly(false);
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color:
                  !showAppliedOnly && !showSavedOnly && !showHistoryOnly
                    ? "#8b5cf6"
                    : "text.secondary",
              }}
            >
              Total Opportunities
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 700 }}
            >
              {posts.filter((post) => !appliedPosts.includes(post.id)).length}
            </Typography>
          </Box>

          <Box
            sx={{
              cursor: "pointer",
              p: 2,
              borderRadius: 1,
              border: "2px solid",
              borderColor: showSavedOnly
                ? "#a78bfa"
                : theme.palette.mode === "dark"
                ? "#334155"
                : "#e2e8f0",
              bgcolor: "background.paper",
              boxShadow: showSavedOnly
                ? "0 0 10px rgba(167, 139, 250, 0.5)"
                : "none",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#a78bfa",
              },
            }}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
          >
            <Typography
              variant="body2"
              sx={{
                color: showSavedOnly ? "#a78bfa" : "text.secondary",
              }}
            >
              Saved Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#a78bfa", fontWeight: 700 }}>
              {savedPosts.length}
            </Typography>
          </Box>

          <Box
            sx={{
              cursor: "pointer",
              p: 2,
              borderRadius: 1,
              border: "2px solid",
              borderColor: showAppliedOnly
                ? "#10b981"
                : theme.palette.mode === "dark"
                ? "#334155"
                : "#e2e8f0",
              bgcolor: "background.paper",
              boxShadow: showAppliedOnly
                ? "0 0 10px rgba(16, 185, 129, 0.5)"
                : "none",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#10b981",
              },
            }}
            onClick={() => {
              setShowAppliedOnly(true);
              setShowHistoryOnly(false);
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: showAppliedOnly ? "#10b981" : "text.secondary",
              }}
            >
              Applied Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#10b981", fontWeight: 700 }}>
              {
                appliedPosts.filter((id) => {
                  const post = posts.find((p) => p.id === id);
                  return post && !isExpired(post);
                }).length
              }
            </Typography>
          </Box>

          <Box
            sx={{
              cursor: "pointer",
              p: 2,
              borderRadius: 1,
              border: "2px solid",
              borderColor: showHistoryOnly
                ? "#f59e0b"
                : theme.palette.mode === "dark"
                ? "#334155"
                : "#e2e8f0",
              bgcolor: "background.paper",
              boxShadow: showHistoryOnly
                ? "0 0 10px rgba(245, 158, 11, 0.5)"
                : "none",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#f59e0b",
              },
            }}
            onClick={() => {
              setShowHistoryOnly(true);
              setShowAppliedOnly(false);
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: showHistoryOnly ? "#f59e0b" : "text.secondary",
              }}
            >
              Application History
            </Typography>
            <Typography variant="h6" sx={{ color: "#f59e0b", fontWeight: 700 }}>
              {
                appliedPosts.filter((id) => {
                  const post = posts.find((p) => p.id === id);
                  return post && isExpired(post);
                }).length
              }
            </Typography>
          </Box>
        </Stack>

        {/* Search and Filters */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <TextField
            placeholder="Search by position or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
                color: "text.primary",
                "& fieldset": {
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
                "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "text.secondary",
                opacity: 0.7,
              },
            }}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel
              sx={{
                color: "text.secondary",
                "&.Mui-focused": { color: "#8b5cf6" },
              }}
            >
              Filter by Industry
            </InputLabel>
            <Select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              label="Filter by Industry"
              sx={{
                backgroundColor: "background.paper",
                color: "text.primary",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b5cf6",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b5cf6",
                },
                "& .MuiSvgIcon-root": { color: "text.secondary" },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor:
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    "& .MuiMenuItem-root": {
                      color: "text.primary",
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(139, 92, 246, 0.1)"
                            : "rgba(139, 92, 246, 0.05)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(139, 92, 246, 0.15)",
                        "&:hover": {
                          bgcolor: "rgba(139, 92, 246, 0.2)",
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">All Industries</MenuItem>
              {INDUSTRIES.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant={showSavedOnly ? "contained" : "outlined"}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            sx={{
              bgcolor: showSavedOnly ? "#8b5cf6" : "transparent",
              color: showSavedOnly ? "white" : "#8b5cf6",
              borderColor: "#8b5cf6",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: showSavedOnly ? "#7c3aed" : "rgba(139, 92, 246, 0.1)",
                borderColor: "#7c3aed",
              },
            }}
          >
            Saved ({savedPosts.length})
          </Button>
          {(showAppliedOnly || showHistoryOnly) && (
            <Button
              variant="outlined"
              onClick={() => {
                setShowAppliedOnly(false);
                setShowHistoryOnly(false);
              }}
              sx={{
                color: "#10b981",
                borderColor: "#10b981",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "rgba(16, 185, 129, 0.1)",
                  borderColor: "#059669",
                },
              }}
            >
              Back to All Posts
            </Button>
          )}
        </Stack>
      </Box>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          }}
        >
          <Typography variant="h6" sx={{ color: "text.primary", mb: 1 }}>
            {showSavedOnly
              ? "No saved posts yet"
              : showAppliedOnly
              ? "No applied posts yet"
              : showHistoryOnly
              ? "No application history yet"
              : "No opportunities found"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {showSavedOnly
              ? "Save posts to view them here"
              : showAppliedOnly
              ? "Apply to posts to view them here"
              : showHistoryOnly
              ? "Expired or closed applications will appear here"
              : "Try adjusting your filters or search query"}
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={3}>
            {currentPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isSaved={savedPosts.includes(post.id)}
                onToggleSave={() => toggleSavePost(post.id)}
                onApply={() => handleApplyClick(post)}
                onViewDetails={() =>
                  router.push(`/Post/postdetails/${post.id}`)
                }
                onShare={() => handleShare(post)}
              />
            ))}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "text.primary",
                    borderColor:
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#8b5cf6 !important",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#7c3aed !important",
                    },
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Apply Dialog */}
      <ApplyDialog
        open={applyDialogOpen}
        post={selectedPost}
        onClose={() => setApplyDialogOpen(false)}
        onSubmit={handleApplySubmit}
      />

      {/* Notifications */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
      >
        <Alert severity="success">{successMsg}</Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={5000}
        onClose={() => setErrorMsg("")}
      >
        <Alert severity="error">{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
