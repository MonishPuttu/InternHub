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
  Chip,
  Paper,
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  CalendarMonth as CalendarIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import axios from "axios";
import { BACKEND_URL, INDUSTRIES } from "@/constants/postConstants";
import { useTheme } from "@mui/material/styles";
import ApplyDialog from "@/components/Post/ApplyDialog";
import { useStudentPostsUI } from "@/modules/Post/StudentPostsUIContext";

export default function StudentPosts() {
  const router = useRouter();
  const theme = useTheme();
  const postsUI = useStudentPostsUI();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedPosts, setSavedPosts] = useState([]);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [appliedPosts, setAppliedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  // Use context values if available, otherwise fallback to local state
  const activeTab = postsUI?.activeTab ?? "available";
  const setActiveTab = postsUI?.setActiveTab ?? (() => {});
  const filterIndustry = postsUI?.industry ?? "all";
  const setFilterIndustry = postsUI?.setIndustry ?? (() => {});
  const searchQuery = postsUI?.search ?? "";
  const setSearchQuery = postsUI?.setSearch ?? (() => {});
  const showSavedOnly = postsUI?.showSavedOnly ?? false;
  const setShowSavedOnly = postsUI?.setShowSavedOnly ?? (() => {});
  const setCounts = postsUI?.setCounts ?? (() => {});

  // Derive showAppliedOnly from activeTab
  const showAppliedOnly = activeTab === "applied";

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
    activeTab,
  ]);

  useEffect(() => {
    if (posts.length > 0) {
      fetchAppliedPostsFromBackend();
    }
  }, [posts]);

  // Update counts in context for sidebar
  useEffect(() => {
    const availableCount = posts.filter((post) => !appliedPosts.includes(post.id)).length;
    const appliedCount = appliedPosts.filter((id) => posts.find((p) => p.id === id)).length;
    setCounts({ available: availableCount, applied: appliedCount, history: 0 });
  }, [posts, appliedPosts, setCounts]);

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

  const toggleSavePost = (postId, e) => {
    e.stopPropagation();
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

  const handleApplyClick = (post, e) => {
    e.stopPropagation();
    setSelectedPost(post);
    setApplyDialogOpen(true);
  };

  const handleShare = async (post, e) => {
    e.stopPropagation();
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

  const getRelativeTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Posted today";
    if (diffDays === 1) return "Posted 1 day ago";
    return `Posted ${diffDays} days ago`;
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
      // Show all applied posts
      filtered = filtered.filter((post) => appliedPosts.includes(post.id));
    } else {
      // Show available posts (not applied)
      filtered = filtered.filter((post) => !appliedPosts.includes(post.id));
    }
    if (showSavedOnly) {
      filtered = filtered.filter((post) => savedPosts.includes(post.id));
    }
    return filtered.filter((post) => {
      const matchesIndustry =
        filterIndustry === "all" || filterIndustry === "" || post.industry === filterIndustry;

      const matchesSearch =
        (Array.isArray(post.positions) &&
          post.positions.some(
            (pos) =>
              pos.title &&
              pos.title.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
        (post.position &&
          post.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.company_name &&
          post.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            : "Available Opportunities"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          {showAppliedOnly
            ? "View and track your applied internship and job opportunities"
            : "Explore and apply to approved internship and job opportunities"}
        </Typography>

        {/* Stats - TAB STYLE */}
<Box
  sx={{
    borderBottom: 1,
    borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
    mb: 3,
  }}
>
  <Box
    sx={{
      display: "flex",
      gap: 4,
    }}
  >
    <Box
      sx={{
        cursor: "pointer",
        pb: 1.5,
        borderBottom: "3px solid",
        borderColor:
          activeTab === "available" && !showSavedOnly
            ? "#a855f7"
            : "transparent",
        transition: "all 0.3s ease",
      }}
      onClick={() => {
        setActiveTab("available");
        setShowSavedOnly(false);
      }}
    >
      <Typography
        sx={{
          color:
            activeTab === "available" && !showSavedOnly
              ? "#a855f7"
              : "text.secondary",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        Total Opportunities ({posts.filter((post) => !appliedPosts.includes(post.id)).length})
      </Typography>
    </Box>

    <Box
      sx={{
        cursor: "pointer",
        pb: 1.5,
        borderBottom: "3px solid",
        borderColor: activeTab === "applied" && !showSavedOnly ? "#a855f7" : "transparent",
        transition: "all 0.3s ease",
      }}
      onClick={() => {
        setActiveTab("applied");
        setShowSavedOnly(false);
      }}
    >
      <Typography
        sx={{
          color: activeTab === "applied" && !showSavedOnly ? "#a855f7" : "text.secondary",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        Applied Posts ({appliedPosts.filter((id) => posts.find((p) => p.id === id)).length})
      </Typography>
    </Box>
  </Box>
</Box>
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
            startIcon={showSavedOnly ? <BookmarkIcon /> : <BookmarkBorderIcon />}
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
          {activeTab === "applied" && (
            <Button
              variant="outlined"
              onClick={() => {
                setActiveTab("available");
              }}
              sx={{
                color: "text.primary",
                borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "rgba(139, 92, 246, 0.1)",
                  borderColor: "#8b5cf6",
                },
              }}
            >
              Back to All Posts
            </Button>
          )}
        </Stack>
      </Box>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <Paper
          sx={{
            textAlign: "center",
            py: 8,
            px: 4,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          }}
        >
          <Typography variant="h6" sx={{ color: "text.primary", mb: 1 }}>
            {showSavedOnly
              ? "No saved posts yet"
              : activeTab === "applied"
              ? "No applied posts yet"
              : "No opportunities found"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {showSavedOnly
              ? "Save posts to view them here"
              : activeTab === "applied"
              ? "Apply to posts to view them here"
              : "Try adjusting your filters or search query"}
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Custom Posts Grid */}
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
            {currentPosts.map((post) => {
              const isPostSaved = savedPosts.includes(post.id);
              const isPostApplied = appliedPosts.includes(post.id);

              return (
                <Box
                  key={post.id}
                  onClick={() => router.push(`/Post/postdetails/${post.id}`)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    border: "2px solid",
                    borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
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
                    {/* Icon and Applied Badge */}
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
                          bgcolor: isPostApplied ? "#10b981" : "#8b5cf6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isPostApplied ? (
                          <CheckCircleIcon sx={{ fontSize: 32, color: "white" }} />
                        ) : (
                          <CalendarIcon sx={{ fontSize: 32, color: "white" }} />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        {isPostApplied && (
                          <Chip
                            label="✓ APPLIED"
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
                        )}

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
                        mb: 2,
                        lineHeight: 1.3,
                      }}
                    >
                      {post.company_name}
                    </Typography>

                    {/* Roles Section */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <WorkIcon sx={{ fontSize: 16, color: "#8b5cf6" }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#8b5cf6",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        >
                          Roles & Positions
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {post.positions &&
                        Array.isArray(post.positions) &&
                        post.positions.length > 0 ? (
                          post.positions.map((pos, index) => (
                            <Chip
                              key={index}
                              label={pos.title || pos.position || pos}
                              size="small"
                              sx={{
                                bgcolor: "rgba(139, 92, 246, 0.15)",
                                color: "#8b5cf6",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                border: "1px solid rgba(139, 92, 246, 0.3)",
                              }}
                            />
                          ))
                        ) : post.position ? (
                          <Chip
                            label={post.position}
                            size="small"
                            sx={{
                              bgcolor: "rgba(139, 92, 246, 0.15)",
                              color: "#8b5cf6",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                          >
                            No roles specified
                          </Typography>
                        )}
                      </Box>
                    </Box>

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
                  <Box
                    sx={{
                      p: 3,
                      pt: 0,
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    {!isPostApplied && (
                      <Button
                        fullWidth
                        size="medium"
                        variant="contained"
                        onClick={(e) => handleApplyClick(post, e)}
                        sx={{
                          textTransform: "none",
                          bgcolor: "#8b5cf6",
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "#7c3aed",
                          },
                        }}
                      >
                        Apply Now
                      </Button>
                    )}

                    <Button
                      size="medium"
                      variant="outlined"
                      onClick={(e) => toggleSavePost(post.id, e)}
                      sx={{
                        minWidth: isPostApplied ? "50%" : "auto",
                        color: isPostSaved ? "#8b5cf6" : "text.secondary",
                        borderColor: isPostSaved
                          ? "#8b5cf6"
                          : theme.palette.mode === "dark"
                          ? "#334155"
                          : "#e2e8f0",
                        "&:hover": {
                          borderColor: "#8b5cf6",
                          bgcolor: "rgba(139, 92, 246, 0.1)",
                        },
                      }}
                    >
                      {isPostSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </Button>

                    <Button
                      size="medium"
                      variant="outlined"
                      onClick={(e) => handleShare(post, e)}
                      sx={{
                        minWidth: isPostApplied ? "50%" : "auto",
                        color: "text.secondary",
                        borderColor:
                          theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                        "&:hover": {
                          borderColor: "#8b5cf6",
                          bgcolor: "rgba(139, 92, 246, 0.1)",
                        },
                      }}
                    >
                      <ShareIcon />
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                size="large"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "text.primary",
                    borderColor:
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    "&:hover": {
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
                    },
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#8b5cf6 !important",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#7c3aed !important",
                    },
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