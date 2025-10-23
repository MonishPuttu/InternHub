"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
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

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "interviewed", label: "Interviewed" },
  { value: "offer", label: "Offer Received" },
  { value: "rejected", label: "Rejected" },
];

export default function PostAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    const errorMessage = error.response?.data?.error || error.message || defaultMessage;
    setErrorMsg(errorMessage);
  };

  useEffect(() => {
    fetchAllApplications();
  }, []);

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/posts/applications?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.ok) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setErrorMsg("Failed to load posts for review");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, app) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApp(null);
  };

  const handleViewDetails = (app) => {
    setViewingApp(app);
    setDetailsOpen(true);
    handleMenuClose();
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setViewingApp(null);
  };

const openActionDialog = (type, app) => {
  setActionType(type);
  setSelectedApp(app);
  setRejectionReason("");
  setActionDialogOpen(true);
  // close context menu but keep selectedApp for the dialog actions
  setAnchorEl(null);
};

const handleApprovePost = async () => {
  if (!selectedApp) {
    console.error("❌ No app selected for approval");
    setErrorMsg("No post selected");
    return;
  }

  console.log("🔵 Approving post:", selectedApp.id);

  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setErrorMsg("Authentication required");
      return;
    }
    
    // Update both approval_status AND status
    const payload = {
      approval_status: "approved",
      rejection_reason: null,
    };
    
    console.log("🔵 Sending approval payload:", payload);
    
    const response = await axios.put(
      `${BACKEND_URL}/api/posts/applications/${selectedApp.id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Approve response:", response.data);

    if (response.data.ok) {
      setSuccessMsg("Post approved successfully!");
      setActionDialogOpen(false);
      setSelectedApp(null);
      await fetchAllApplications();
    } else {
      setErrorMsg(response.data.error || "Failed to approve post");
    }
  } catch (error) {
    console.error("❌ Error approving post:", error.response || error);
    handleError(error, "Failed to approve post");
  }
};
  const handleDisapprovePost = async () => {
    if (!selectedApp) {
      console.error("❌ No app selected for disapproval");
      setErrorMsg("No post selected");
      return;
    }

    console.log("🟠 Disapproving post:", selectedApp.id);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Authentication required");
        return;
      }

      const payload = {
        approval_status: "disapproved",
        status: "rejected",
        rejection_reason: rejectionReason || null,
      };

      const response = await axios.put(
        `${BACKEND_URL}/api/posts/applications/${selectedApp.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.ok) {
        setSuccessMsg("Post disapproved successfully");
        setActionDialogOpen(false);
        setRejectionReason("");
        setSelectedApp(null);
        await fetchAllApplications();
      } else {
        setErrorMsg(response.data?.error || "Failed to disapprove post");
      }
    } catch (error) {
      console.error("❌ Error disapproving post:", error.response || error);
      handleError(error, "Failed to disapprove post");
    }
  };

const handleActionConfirm = () => {
  if (actionType === "approve") {
    handleApprovePost();
  } else if (actionType === "disapprove") {
    handleDisapprovePost();
  }
};

  const handleEditPost = (app) => {
    setEditingApp(app);
    setEditFormData({
      company_name: app.company_name,
      position: app.position,
      industry: app.industry,
      application_date: app.application_date?.split('T')[0] || '',
      status: app.status,
      package_offered: app.package_offered || '',
      interview_date: app.interview_date?.split('T')[0] || '',
      offer_date: app.offer_date?.split('T')[0] || '',
      rejection_date: app.rejection_date?.split('T')[0] || '',
      notes: app.notes || '',
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

const handleSaveEdit = async () => {
  if (!editingApp) return;

  console.log("🟡 Editing post:", editingApp.id);
  console.log("🟡 Edit form data:", editFormData); 

  try {
    const token = localStorage.getItem("token");
    
    const updatePayload = { ...editFormData };
    
    // Remove empty fields
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === '' || updatePayload[key] === null) {
        delete updatePayload[key];
      }
    });

    // IMPORTANT: Don't overwrite approval_status if it's not in the form
    // The form only edits basic details, not approval status
    // So approval_status will remain unchanged

    await axios.put(
      `${BACKEND_URL}/api/posts/applications/${editingApp.id}`,
      updatePayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSuccessMsg("Post updated successfully!");
    setEditDialogOpen(false);
    setEditingApp(null);
    setEditFormData({});
    fetchAllApplications();
  } catch (error) {
    console.error("Error updating post:", error);
    setErrorMsg(error.response?.data?.error || "Failed to update post");
  }
};

  const getApprovalStatus = (app) => {
    return app.approval_status || "pending";
  };

  const pendingPosts = applications.filter(
    (app) => getApprovalStatus(app) === "pending"
  );

  const approvedPosts = applications.filter(
    (app) => getApprovalStatus(app) === "approved"
  );

  const disapprovedPosts = applications.filter(
    (app) => getApprovalStatus(app) === "disapproved"
  );

  const currentPosts = activeTab === 0 ? pendingPosts : activeTab === 1 ? approvedPosts : disapprovedPosts;

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "#e2e8f0" }}>Loading posts for review...</Typography>
      </Box>
    );
  }

  const renderPostCard = (app, isPending) => {
    return (
      <Card
        key={app.id}
        elevation={0}
        sx={{
          bgcolor: "#1e293b",
          border: isPending
            ? "2px solid #fbbf24"
            : "1px solid #334155",
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
          {app.media && (
            <Box
              component="img"
              src={app.media}
              alt={app.company_name}
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
              {/* Lifecycle status chip removed to avoid showing 'Rejected' etc. Only approval chips remain */}
              {isPending && (
                <Chip
                  label="Pending Review"
                  size="small"
                  sx={{
                    bgcolor: `rgba(251, 191, 36, 0.2)`,
                    color: "#fbbf24",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    border: `1px solid #fbbf24`,
                  }}
                />
              )}
              {!isPending && app.approval_status === "approved" && (
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
              {!isPending && app.approval_status === "disapproved" && (
                <Chip
                  label="✕ Disapproved"
                  size="small"
                  sx={{
                    bgcolor: "rgba(239, 68, 68, 0.2)",
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    border: "1px solid #ef4444",
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
                    {app.position}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#94a3b8",
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {app.company_name}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, app)}
                  sx={{ color: "#94a3b8" }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>

              {app.notes && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    mb: 2,
                    lineHeight: 1.6,
                  }}
                >
                  {app.notes.length > 150
                    ? `${app.notes.substring(0, 150)}...`
                    : app.notes}
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
                {app.package_offered && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AttachMoneyIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      ₹{app.package_offered}L
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    {app.industry}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    Posted {new Date(app.application_date).toLocaleDateString()}
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
                  onClick={() => openActionDialog("approve", app)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => openActionDialog("disapprove", app)}
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
              {activeTab !== 2 && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => router.push(`/postdetails/${app.id}`)}
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
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditPost(app)}
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
                    Edit
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}>
          Post Management
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          Review and manage posted opportunities
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
          <Box>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Total Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 700 }}>
              {applications.length}
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
              "&.Mui-selected": {
                color: "#8b5cf6",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#8b5cf6",
            },
          }}
        >
          <Tab label={`Pending Review (${pendingPosts.length})`} />
          <Tab label={`Approved Posts (${approvedPosts.length})`} />
          <Tab label={`Disapproved (${disapprovedPosts.length})`} />
        </Tabs>
      </Box>

      {/* Posts List */}
      {currentPosts.length === 0 ? (
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
            {activeTab === 0
              ? "No pending posts"
              : activeTab === 1
              ? "No approved posts yet"
              : "No disapproved posts"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            {activeTab === 0
              ? "All posts have been reviewed"
              : activeTab === 1
              ? "Approve posts from the Pending Review tab"
              : "Disapproved posts will appear here"}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {currentPosts.map((app) => renderPostCard(app, activeTab === 0))}
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
        <MenuItem onClick={() => handleViewDetails(selectedApp)}>
          View Details
        </MenuItem>
        {activeTab !== 2 && (
          <MenuItem onClick={() => handleEditPost(selectedApp)}>
            Edit Post
          </MenuItem>
        )}
      </Menu>

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
            color: "#e2e8f0",
          }}
        >
          Post Details
          <IconButton onClick={handleCloseDetails} sx={{ color: "#94a3b8" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#334155" }}>
          {viewingApp && (
            <Stack spacing={3}>
              {viewingApp.media && (
                <Box
                  component="img"
                  src={viewingApp.media}
                  alt={viewingApp.company_name}
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
                  {viewingApp.position}
                </Typography>
                <Typography variant="body1" sx={{ color: "#94a3b8", mb: 2 }}>
                  {viewingApp.company_name}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>Industry</Typography>
                  <Typography sx={{ color: "#e2e8f0" }}>{viewingApp.industry}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>Status</Typography>
                  <Typography sx={{ color: "#e2e8f0" }}>{statusLabels[viewingApp.status]}</Typography>
                </Box>
                {viewingApp.package_offered && (
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Package</Typography>
                    <Typography sx={{ color: "#e2e8f0" }}>₹{viewingApp.package_offered}L</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>Application Date</Typography>
                  <Typography sx={{ color: "#e2e8f0" }}>
                    {new Date(viewingApp.application_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {viewingApp.notes && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", mb: 1, display: "block" }}>
                    Description
                  </Typography>
                  <Typography sx={{ color: "#e2e8f0", lineHeight: 1.7 }}>
                    {viewingApp.notes}
                  </Typography>
                </Box>
              )}

              {viewingApp.rejection_reason && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#ef4444", mb: 1, display: "block" }}>
                    Disapproval Reason
                  </Typography>
                  <Typography sx={{ color: "#e2e8f0", lineHeight: 1.7 }}>
                    {viewingApp.rejection_reason}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

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
        <DialogTitle component="div" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
          Edit Post
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#334155" }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Company Name"
              value={editFormData.company_name || ""}
              onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
              }}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                fullWidth
                label="Position"
                value={editFormData.position || ""}
                onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                }}
              />
              <TextField
                fullWidth
                select
                label="Industry"
                value={editFormData.industry || ""}
                onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                }}
                SelectProps={{
                  native: true,
                }}
              >
                {INDUSTRIES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                fullWidth
                label="Application Date"
                type="date"
                value={editFormData.application_date || ""}
                onChange={(e) => setEditFormData({ ...editFormData, application_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                }}
              />
              <TextField
                fullWidth
                select
                label="Status"
                value={editFormData.status || ""}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                }}
                SelectProps={{
                  native: true,
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                fullWidth
                label="Interview Date"
                type="date"
                value={editFormData.interview_date || ""}
                onChange={(e) => setEditFormData({ ...editFormData, interview_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Setting this will automatically set deadline to 1 week before"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                  "& .MuiFormHelperText-root": { color: "#94a3b8" },
                }}
              />
              <TextField
                fullWidth
                label="Offer Date"
                type="date"
                value={editFormData.offer_date || ""}
                onChange={(e) => setEditFormData({ ...editFormData, offer_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Rejection Date"
              type="date"
              value={editFormData.rejection_date || ""}
              onChange={(e) => setEditFormData({ ...editFormData, rejection_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
              }}
            />

            <TextField
              fullWidth
              label="Package Offered (in Lakhs)"
              type="number"
              value={editFormData.package_offered || ""}
              onChange={(e) => setEditFormData({ ...editFormData, package_offered: e.target.value })}
              inputProps={{ step: "0.01", min: "0" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                  "& fieldset": { borderColor: "#334155" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
              }}
            />

            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={4}
              value={editFormData.notes || ""}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
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
            onClick={handleSaveEdit}
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Save Changes
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
                ? `Are you sure you want to approve "${selectedApp?.position}" post from ${selectedApp?.company_name}?`
                : `Are you sure you want to disapprove "${selectedApp?.position}" post from ${selectedApp?.company_name}?`}
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