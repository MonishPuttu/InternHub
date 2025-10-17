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
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIconMui,
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

const approvalStatusColors = {
  pending: "#fbbf24",
  approved: "#10b981",
  disapproved: "#ef4444",
};

const approvalStatusLabels = {
  pending: "Pending Review",
  approved: "Approved",
  disapproved: "Disapproved",
};

export default function PostAdminPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'disapprove'
  const [rejectionReason, setRejectionReason] = useState("");

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

  const openActionDialog = (type) => {
    setActionType(type);
    setRejectionReason("");
    setActionDialogOpen(true);
    handleMenuClose();
  };

  const handleApprovePost = async () => {
    if (!selectedApp) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BACKEND_URL}/api/posts/applications/${selectedApp.id}`,
        {
          approval_status: "approved",
          updated_at: new Date(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("Post approved successfully!");
      setActionDialogOpen(false);
      fetchAllApplications();
    } catch (error) {
      console.error("Error approving post:", error);
      setErrorMsg("Failed to approve post");
    }
  };

  const handleDisapprovePost = async () => {
    if (!selectedApp) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BACKEND_URL}/api/posts/applications/${selectedApp.id}`,
        {
          approval_status: "disapproved",
          rejection_reason: rejectionReason,
          updated_at: new Date(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("Post disapproved successfully!");
      setActionDialogOpen(false);
      fetchAllApplications();
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

  const getApprovalStatus = (app) => {
    return app.approval_status || "pending";
  };

  const pendingPosts = applications.filter(
    (app) => getApprovalStatus(app) === "pending"
  );

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "#e2e8f0" }}>Loading posts for review...</Typography>
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
          Review and approve/disapprove posted opportunities
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
              Total Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 700 }}>
              {applications.length}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Posts List */}
      {applications.length === 0 ? (
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
            No posts available for review
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Check back later for posts to review
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {applications.map((app) => {
            const approvalStatus = getApprovalStatus(app);
            return (
              <Card
                key={app.id}
                elevation={0}
                sx={{
                  bgcolor: "#1e293b",
                  border:
                    approvalStatus === "pending"
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
                  opacity: approvalStatus === "disapproved" ? 0.6 : 1,
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Top Section - Image Banner (if exists) */}
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

                  {/* Content Section */}
                  <Box sx={{ display: "flex", gap: 3, alignItems: "start", flexWrap: "wrap" }}>
                    {/* Status & Approval Badge */}
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
                        label={statusLabels[app.status]}
                        size="small"
                        sx={{
                          bgcolor: `${statusColors[app.status]}30`,
                          color: statusColors[app.status],
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          px: 1,
                        }}
                      />
                      <Chip
                        label={approvalStatusLabels[approvalStatus]}
                        size="small"
                        sx={{
                          bgcolor: `${approvalStatusColors[approvalStatus]}20`,
                          color: approvalStatusColors[approvalStatus],
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          border: `1px solid ${approvalStatusColors[approvalStatus]}`,
                        }}
                      />
                    </Box>

                    {/* Main Content */}
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
                          disabled={approvalStatus !== "pending"}
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

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        minWidth: 120,
                      }}
                    >
                      {approvalStatus === "pending" && (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => {
                              setSelectedApp(app);
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
                              setSelectedApp(app);
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
                      {approvalStatus === "approved" && (
                        <Chip
                          label="✓ Approved"
                          sx={{
                            bgcolor: "rgba(16, 185, 129, 0.2)",
                            color: "#10b981",
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {approvalStatus === "disapproved" && (
                        <Chip
                          label="✕ Disapproved"
                          sx={{
                            bgcolor: "rgba(239, 68, 68, 0.2)",
                            color: "#ef4444",
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Card>
            );
          })}
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
            </Stack>
          )}
        </DialogContent>
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