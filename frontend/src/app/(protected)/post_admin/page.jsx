"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

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

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "interviewed", label: "Interviewed" },
  { value: "offer", label: "Offer Received" },
  { value: "rejected", label: "Rejected" },
];

export default function ManagePostsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchAllPosts();
  }, []);

const fetchAllPosts = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BACKEND_URL}/api/analytics/all-posts?limit=1000`, // NEW ENDPOINT
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();

    if (data.ok) {
      const pending = data.applications.filter(
        (app) => !app.approval_status || app.approval_status === "pending"
      );
      const approved = data.applications.filter(
        (app) => app.approval_status === "approved"
      );

      setPendingPosts(pending);
      setApprovedPosts(approved);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    setErrorMsg("Failed to load posts");
  } finally {
    setLoading(false);
  }
};

  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleViewDetails = (post) => {
    setViewingPost(post);
    setDetailsOpen(true);
    handleMenuClose();
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setViewingPost(null);
  };

  const handleEditClick = (post) => {
    setEditFormData({
      company_name: post.company_name,
      position: post.position,
      industry: post.industry,
      application_date: post.application_date?.split("T")[0] || "",
      status: post.status,
      package_offered: post.package_offered || "",
      interview_date: post.interview_date?.split("T")[0] || "",
      offer_date: post.offer_date?.split("T")[0] || "",
      rejection_date: post.rejection_date?.split("T")[0] || "",
      notes: post.notes || "",
      media: post.media || "",
    });
    setSelectedPost(post);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BACKEND_URL}/api/analytics/applications/${selectedPost.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFormData),
        }
      );

      const data = await response.json();

      if (data.ok) {
        setSuccessMsg("Post updated successfully!");
        setEditDialogOpen(false);
        fetchAllPosts();
      } else {
        setErrorMsg(data.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setErrorMsg("Failed to update post");
    }
  };

  const openActionDialog = (type) => {
    setActionType(type);
    setRejectionReason("");
    setActionDialogOpen(true);
    handleMenuClose();
  };

  const handleApprovePost = async () => {
    if (!selectedPost) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BACKEND_URL}/api/analytics/applications/${selectedPost.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approval_status: "approved",
            updated_at: new Date().toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (data.ok) {
        setSuccessMsg("Post approved successfully!");
        setActionDialogOpen(false);
        fetchAllPosts();
      } else {
        setErrorMsg(data.error || "Failed to approve post");
      }
    } catch (error) {
      console.error("Error approving post:", error);
      setErrorMsg("Failed to approve post");
    }
  };

  const handleDisapprovePost = async () => {
    if (!selectedPost) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BACKEND_URL}/api/analytics/applications/${selectedPost.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approval_status: "disapproved",
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (data.ok) {
        setSuccessMsg("Post disapproved successfully!");
        setActionDialogOpen(false);
        fetchAllPosts();
      } else {
        setErrorMsg(data.error || "Failed to disapprove post");
      }
    } catch (error) {
      console.error("Error disapproving post:", error);
      setErrorMsg("Failed to disapprove post");
    }
  };

  const handleActionConfirm = () => {
    if (actionType === "approve") {
      handleApprovePost();
    } else if (actionType === "disapprove") {
      if (!rejectionReason.trim()) {
        setErrorMsg("Please provide a reason for disapproval");
        return;
      }
      handleDisapprovePost();
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BACKEND_URL}/api/analytics/applications/${selectedPost.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.ok) {
        setSuccessMsg("Post deleted successfully!");
        fetchAllPosts();
      } else {
        setErrorMsg(data.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setErrorMsg("Failed to delete post");
    }
    handleMenuClose();
  };

  const renderPostCard = (post, isPending = true) => (
    <Card
      key={post.id}
      elevation={0}
      sx={{
        bgcolor: "#1e293b",
        border: isPending ? "2px solid #fbbf24" : "1px solid #334155",
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
        {post.media && (
          <Box
            component="img"
            src={post.media}
            alt={post.company_name}
            sx={{
              width: "100%",
              height: 280,
              borderRadius: 2,
              objectFit: "cover",
              border: "2px solid #334155",
            }}
          />
        )}

        <Box sx={{ display: "flex", gap: 3, alignItems: "start", flexWrap: "wrap" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              alignItems: "center",
              minWidth: 100,
            }}
          >
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
            {isPending && (
              <Chip
                label="Pending Review"
                size="small"
                sx={{
                  bgcolor: "rgba(251, 191, 36, 0.2)",
                  color: "#fbbf24",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  border: "1px solid #fbbf24",
                }}
              />
            )}
            {!isPending && (
              <Chip
                label="✓ Approved"
                size="small"
                sx={{
                  bgcolor: "rgba(16, 185, 129, 0.2)",
                  color: "#10b981",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  border: "1px solid #10b981",
                }}
              />
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#e2e8f0",
                    fontWeight: 700,
                    mb: 0.5,
                  }}
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
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, post)}
                sx={{ color: "#94a3b8" }}
              >
                <MoreVertIcon />
              </IconButton>
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
                {post.notes.length > 150
                  ? `${post.notes.substring(0, 150)}...`
                  : post.notes}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                gap: 3,
                mb: 2,
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

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minWidth: 120,
            }}
          >
            {isPending && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    setSelectedPost(post);
                    openActionDialog("approve");
                  }}
                  sx={{
                    bgcolor: "#10b981",
                    "&:hover": { bgcolor: "#059669" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedPost(post);
                    openActionDialog("disapprove");
                  }}
                  sx={{
                    color: "#ef4444",
                    borderColor: "#ef4444",
                    "&:hover": {
                      bgcolor: "rgba(239, 68, 68, 0.1)",
                      borderColor: "#ef4444",
                    },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Disapprove
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleViewDetails(post)}
              sx={{
                color: "#8b5cf6",
                borderColor: "#8b5cf6",
                "&:hover": {
                  bgcolor: "rgba(139, 92, 246, 0.1)",
                  borderColor: "#8b5cf6",
                },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              View Details
            </Button>
          </Box>
        </Box>
      </Box>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "#e2e8f0" }}>Loading posts...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}>
          Post Management
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          Review and manage placement opportunities
        </Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Pending Review
            </Typography>
            <Typography variant="h6" sx={{ color: "#fbbf24", fontWeight: 700 }}>
              {pendingPosts.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Approved Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#10b981", fontWeight: 700 }}>
              {approvedPosts.length}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "#334155", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              color: "#94a3b8",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
            },
            "& .Mui-selected": {
              color: "#8b5cf6",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#8b5cf6",
            },
          }}
        >
          <Tab label={`Post Requests (${pendingPosts.length})`} />
          <Tab label={`Approved Posts (${approvedPosts.length})`} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Stack spacing={3}>
          {pendingPosts.length === 0 ? (
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
                No pending post requests
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                All posts have been reviewed
              </Typography>
            </Box>
          ) : (
            pendingPosts.map((post) => renderPostCard(post, true))
          )}
        </Stack>
      )}

      {activeTab === 1 && (
        <Stack spacing={3}>
          {approvedPosts.length === 0 ? (
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
                No approved posts yet
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Approved posts will appear here
              </Typography>
            </Box>
          ) : (
            approvedPosts.map((post) => renderPostCard(post, false))
          )}
        </Stack>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { bgcolor: "#1e293b", border: "1px solid #334155" },
        }}
      >
        <MenuItem onClick={() => handleViewDetails(selectedPost)}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleEditClick(selectedPost)}>
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Edit Post
        </MenuItem>
        <MenuItem onClick={handleDeletePost} sx={{ color: "#ef4444" }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete Post
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
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
          }}
        >
          Edit Post
          <IconButton
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: "#94a3b8" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#334155" }}>
          <Stack spacing={3}>
            <TextField
              label="Company Name"
              value={editFormData.company_name || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, company_name: e.target.value })
              }
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  bgcolor: "#0f172a",
                  "& fieldset": { borderColor: "#334155" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
              }}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Position"
                value={editFormData.position || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, position: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ color: "#94a3b8" }}>Industry</InputLabel>
                <Select
                  value={editFormData.industry || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, industry: e.target.value })
                  }
                  label="Industry"
                  sx={{
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#334155",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8b5cf6",
                    },
                    "& .MuiSvgIcon-root": { color: "#94a3b8" },
                  }}
                >
                  {INDUSTRIES.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Application Date"
                type="date"
                value={editFormData.application_date || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    application_date: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ color: "#94a3b8" }}>Status</InputLabel>
                <Select
                  value={editFormData.status || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  label="Status"
                  sx={{
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#334155",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8b5cf6",
                    },
                    "& .MuiSvgIcon-root": { color: "#94a3b8" },
                  }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Package Offered (in Lakhs)"
              type="number"
              value={editFormData.package_offered || ""}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  package_offered: e.target.value,
                })
              }
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  bgcolor: "#0f172a",
                  "& fieldset": { borderColor: "#334155" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
              }}
            />

            <TextField
              label="Additional Notes"
              multiline
              rows={3}
              value={editFormData.notes || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, notes: e.target.value })
              }
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  bgcolor: "#0f172a",
                  "& fieldset": { borderColor: "#334155" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #334155" }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
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
          }}
        >
          Post Details
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

              <Box
                sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}
              >
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
                    Application Date
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
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            color: "#e2e8f0",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle component="div" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
          {actionType === "approve" ? "Approve Post" : "Disapprove Post"}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#334155" }}>
          <Stack spacing={2}>
            <Typography sx={{ color: "#94a3b8" }}>
              {actionType === "approve"
                ? `Are you sure you want to approve "${selectedPost?.position}" post from ${selectedPost?.company_name}?`
                : `Are you sure you want to disapprove "${selectedPost?.position}" post from ${selectedPost?.company_name}?`}
            </Typography>
            {actionType === "disapprove" && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason for Disapproval"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for disapproving this post..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    "& fieldset": {
                      borderColor: "#334155",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#94a3b8",
                  },
                }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #334155" }}>
          <Button
            onClick={() => setActionDialogOpen(false)}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActionConfirm}
            sx={{
              bgcolor: actionType === "approve" ? "#10b981" : "#ef4444",
              "&:hover": {
                bgcolor: actionType === "approve" ? "#059669" : "#dc2626",
              },
            }}
          >
            {actionType === "approve" ? "Approve" : "Disapprove"}
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