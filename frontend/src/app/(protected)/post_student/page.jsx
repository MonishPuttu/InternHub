"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
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

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Consulting",
  "Manufacturing",
  "Retail",
  "Education",
  "Other",
];

export default function PostStudentPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyingPost, setApplyingPost] = useState(null);
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    fetchApprovedPosts();
    loadSavedPosts();
  }, []);

const fetchApprovedPosts = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${BACKEND_URL}/api/posts/approved-posts?limit=1000`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (response.data.ok) {
      // Filter to only show approved posts
      const approvedPosts = response.data.posts.filter(
        (post) => post.approval_status === "approved"
      );
      setPosts(approvedPosts);
      console.log("✅ Approved posts:", approvedPosts.length);
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
    if (saved) {
      setSavedPosts(JSON.parse(saved));
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

  const isSaved = (postId) => savedPosts.includes(postId);

  const handleViewDetails = (post) => {
    setViewingPost(post);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setViewingPost(null);
  };

  const handleApplyClick = (post) => {
    setApplyingPost(post);
    setApplyDialogOpen(true);
  };

  const handleApplySubmit = async () => {
    if (!applyingPost) return;

    try {
      const token = localStorage.getItem("token");
      setSuccessMsg(`Successfully applied to ${applyingPost.company_name}`);
      setApplyDialogOpen(false);
      setApplyingPost(null);
      handleCloseDetails();
    } catch (error) {
      console.error("Error applying to post:", error);
      setErrorMsg("Failed to submit application");
    }
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    if (showSavedOnly) {
      filtered = filtered.filter((post) => isSaved(post.id));
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

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "#e2e8f0" }}>
          Loading available opportunities...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}>
          Available Opportunities
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
          Explore and apply to approved internship and job opportunities
        </Typography>

        {/* Stats */}
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Total Opportunities
            </Typography>
            <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 700 }}>
              {posts.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Saved Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#a78bfa", fontWeight: 700 }}>
              {savedPosts.length}
            </Typography>
          </Box>
        </Stack>

        {/* Search and Filters */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by position or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#1e293b",
                color: "#e2e8f0",
                "& fieldset": {
                  borderColor: "#334155",
                },
                "&:hover fieldset": {
                  borderColor: "#8b5cf6",
                },
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "#64748b",
                opacity: 1,
              },
            }}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel
              sx={{
                color: "#94a3b8",
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
                backgroundColor: "#1e293b",
                color: "#e2e8f0",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334155",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b5cf6",
                },
                "& .MuiSvgIcon-root": {
                  color: "#94a3b8",
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
              },
            }}
          >
            Saved ({savedPosts.length})
          </Button>
        </Stack>
      </Box>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "#1e293b",
            borderRadius: 2,
            border: "1px solid #334155",
          }}
        >
          <Typography variant="h6" sx={{ color: "#e2e8f0", mb: 1 }}>
            {showSavedOnly ? "No saved posts yet" : "No opportunities found"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            {showSavedOnly
              ? "Save posts to view them here"
              : "Try adjusting your filters or search query"}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              elevation={0}
              sx={{
                bgcolor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 2,
                p: 3,
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#8b5cf6",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(139, 92, 246, 0.15)",
                },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Image Banner (if exists) */}
                {post.media && (
                  <Box
                    component="img"
                    src={post.media}
                    alt={post.company_name}
                    sx={{
                      width: "100%",
                      height: 220,
                      borderRadius: 2,
                      objectFit: "cover",
                      border: "2px solid #334155",
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewDetails(post)}
                  />
                )}

                {/* Content Section */}
                <Box sx={{ display: "flex", gap: 3, alignItems: "start", flexWrap: "wrap" }}>
                  {/* Status Badge */}
                  <Box sx={{ minWidth: 100 }}>
                    <Chip
                      label={statusLabels[post.status]}
                      size="small"
                      sx={{
                        bgcolor: `${statusColors[post.status]}30`,
                        color: statusColors[post.status],
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        px: 1,
                      }}
                    />
                  </Box>

                  {/* Main Content */}
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#e2e8f0",
                          fontWeight: 700,
                          mb: 0.5,
                          cursor: "pointer",
                          "&:hover": { color: "#a78bfa" },
                        }}
                        onClick={() => handleViewDetails(post)}
                      >
                        {post.position}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          mb: 1,
                        }}
                      >
                        {post.company_name}
                      </Typography>
                    </Box>

                    {post.notes && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          mb: 2,
                          lineHeight: 1.6,
                        }}
                      >
                        {post.notes.length > 120
                          ? `${post.notes.substring(0, 120)}...`
                          : post.notes}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        gap: 3,
                        flexWrap: "wrap",
                      }}
                    >
                      {post.package_offered && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AttachMoneyIcon sx={{ fontSize: 18, color: "#64748b" }} />
                          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                            ₹{post.package_offered}L
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: "#64748b" }} />
                        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                          {post.industry}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: "#64748b" }} />
                        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                          Posted {new Date(post.application_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      minWidth: 120,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleApplyClick(post)}
                      sx={{
                        bgcolor: "#8b5cf6",
                        "&:hover": { bgcolor: "#7c3aed" },
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Apply Now
                    </Button>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleSavePost(post.id)}
                        sx={{
                          flex: 1,
                          color: isSaved(post.id) ? "#a78bfa" : "#64748b",
                          border: "1px solid #334155",
                          borderRadius: 1,
                          "&:hover": {
                            borderColor: "#8b5cf6",
                            bgcolor: "rgba(139, 92, 246, 0.1)",
                          },
                        }}
                      >
                        {isSaved(post.id) ? (
                          <BookmarkIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <BookmarkBorderIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          flex: 1,
                          color: "#64748b",
                          border: "1px solid #334155",
                          borderRadius: 1,
                          "&:hover": {
                            borderColor: "#8b5cf6",
                            bgcolor: "rgba(139, 92, 246, 0.1)",
                          },
                        }}
                      >
                        <ShareIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      {/* Post Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            color: "#e2e8f0",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#e2e8f0",
          }}
        >
          Opportunity Details
          <IconButton onClick={handleCloseDetails} sx={{ color: "#94a3b8" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#334155" }}>
          {viewingPost && (
            <Stack spacing={3}>
              {viewingPost.media && (
                <Box
                  component="img"
                  src={viewingPost.media}
                  alt={viewingPost.company_name}
                  sx={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "contain",
                    borderRadius: 2,
                    bgcolor: "#0f172a",
                  }}
                />
              )}

              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {viewingPost.position}
                </Typography>
                <Typography variant="body1" sx={{ color: "#94a3b8", mb: 2 }}>
                  {viewingPost.company_name}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Industry
                  </Typography>
                  <Typography sx={{ color: "#e2e8f0" }}>
                    {viewingPost.industry}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Status
                  </Typography>
                  <Typography sx={{ color: "#e2e8f0" }}>
                    {statusLabels[viewingPost.status]}
                  </Typography>
                </Box>
                {viewingPost.package_offered && (
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Package
                    </Typography>
                    <Typography sx={{ color: "#e2e8f0" }}>
                      ₹{viewingPost.package_offered}L
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Posted Date
                  </Typography>
                  <Typography sx={{ color: "#e2e8f0" }}>
                    {new Date(viewingPost.application_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {viewingPost.notes && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", mb: 1, display: "block" }}
                  >
                    Description
                  </Typography>
                  <Typography sx={{ color: "#e2e8f0", lineHeight: 1.7 }}>
                    {viewingPost.notes}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #334155" }}>
          <Button onClick={handleCloseDetails} sx={{ color: "#94a3b8" }}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => handleApplyClick(viewingPost)}
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Apply Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Apply Confirmation Dialog */}
      <Dialog
        open={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            color: "#e2e8f0",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle component="div" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
          Confirm Application
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#334155" }}>
          <Stack spacing={2}>
            <Typography sx={{ color: "#94a3b8" }}>
              You are about to apply for:
            </Typography>
            <Box sx={{ bgcolor: "rgba(139, 92, 246, 0.1)", p: 2, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ color: "#e2e8f0", mb: 0.5 }}>
                {applyingPost?.position}
              </Typography>
              <Typography sx={{ color: "#94a3b8" }}>
                {applyingPost?.company_name}
              </Typography>
            </Box>
            <Typography sx={{ color: "#64748b", fontSize: "0.875rem" }}>
              Make sure your profile is complete before applying. You can track
              your applications in the dashboard.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #334155" }}>
          <Button
            onClick={() => setApplyDialogOpen(false)}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApplySubmit}
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Confirm Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={5000}
        onClose={() => setErrorMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}