"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { CreateApplicationModal } from "@/components/Post/CreateApplicationModal";
import {
  BACKEND_URL,
  INDUSTRIES,
  STATUS_OPTIONS,
} from "@/constants/postConstants";

export default function PlacementPosts() {
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    fetchAllApplications();
  }, []);

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/applications?limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const handleModalClose = () => {
    setOpenCreateModal(false);
    fetchAllApplications();
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

  const handleApprove = async () => {
    if (!selectedApp) return;
    try {
      const token = localStorage.getItem("token");
      const payload = {
        approval_status: "approved",
        rejection_reason: null,
      };
      const response = await axios.put(
        `${BACKEND_URL}/api/posts/applications/${selectedApp.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.ok) {
        setSuccessMsg("Post approved successfully!");
        setActionDialogOpen(false);
        setSelectedApp(null);
        await fetchAllApplications();
      }
    } catch (error) {
      setErrorMsg("Failed to approve post");
    }
  };

  const handleDisapprove = async () => {
    if (!selectedApp) return;
    try {
      const token = localStorage.getItem("token");
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
      if (response.data.ok) {
        setSuccessMsg("Post disapproved successfully");
        setActionDialogOpen(false);
        setRejectionReason("");
        setSelectedApp(null);
        await fetchAllApplications();
      }
    } catch (error) {
      setErrorMsg("Failed to disapprove post");
    }
  };

  const handleEdit = (app, e) => {
    e.stopPropagation();
    setSelectedApp(app);
    setEditFormData({
      company_name: app.company_name,
      position: app.position,
      industry: app.industry,
      package_offered: app.package_offered || "",
      notes: app.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedApp) return;
    try {
      const token = localStorage.getItem("token");
      const updatePayload = { ...editFormData };
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === "" || updatePayload[key] === null) {
          delete updatePayload[key];
        }
      });
      await axios.put(
        `${BACKEND_URL}/api/posts/applications/${selectedApp.id}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg("Post updated successfully!");
      setEditDialogOpen(false);
      setSelectedApp(null);
      setEditFormData({});
      fetchAllApplications();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Failed to update post");
    }
  };

  const pendingPosts = applications.filter(
    (app) => app.approval_status === "pending"
  );
  const approvedPosts = applications.filter(
    (app) => app.approval_status === "approved"
  );
  const disapprovedPosts = applications.filter(
    (app) => app.approval_status === "disapproved"
  );

  const currentPosts =
    activeTab === 0
      ? pendingPosts
      : activeTab === 1
      ? approvedPosts
      : disapprovedPosts;

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "text.primary" }}>
          Loading posts for review...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            mb: 2,
          }}
        >
          

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Create Post
          </Button>
        </Box>

        
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          mb: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              color: "text.secondary",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              "&.Mui-selected": { color: "#8b5cf6" },
            },
            "& .MuiTabs-indicator": { backgroundColor: "#8b5cf6" },
          }}
        >
          <Tab label={`Pending Review (${pendingPosts.length})`} />
          <Tab label={`Approved Posts (${approvedPosts.length})`} />
          <Tab label={`Disapproved (${disapprovedPosts.length})`} />
        </Tabs>
      </Box>

      {/* Posts Grid */}
      {currentPosts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "text.primary", mb: 1 }}>
            {activeTab === 0
              ? "No pending posts"
              : activeTab === 1
              ? "No approved posts yet"
              : "No disapproved posts"}
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
          {currentPosts.map((app) => (
            <Box
              key={app.id}
              onClick={() => handleViewDetails(app.id)}
              sx={{
                display: "flex",
                flexDirection: "column",
                border: "2px solid",
                borderColor:
                  activeTab === 0
                    ? "#fbbf24"
                    : activeTab === 1
                    ? "#10b981"
                    : "#ef4444",
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
                      bgcolor:
                        activeTab === 0
                          ? "#fbbf24"
                          : activeTab === 1
                          ? "#10b981"
                          : "#ef4444",
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
                    {/* Status Badge */}
                    {activeTab === 0 && (
                      <Chip
                        label="⏳ PENDING"
                        size="small"
                        sx={{
                          bgcolor: "rgba(251, 191, 36, 0.2)",
                          color: "#fbbf24",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          border: "1px solid #fbbf24",
                          height: 24,
                        }}
                      />
                    )}
                    {activeTab === 1 && (
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
                    )}
                    {activeTab === 2 && (
                      <Chip
                        label="✕ DISAPPROVED"
                        size="small"
                        sx={{
                          bgcolor: "rgba(239, 68, 68, 0.2)",
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          border: "1px solid #ef4444",
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
                      {getRelativeTime(app.application_date)}
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
                  {app.company_name}
                </Typography>

                {/* Role/Position Section - UPDATED TO SHOW MULTIPLE ROLES */}
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
                       Positions
                    </Typography>
                  </Box>

                  {/* Display roles as chips */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {app.positions &&
                    Array.isArray(app.positions) &&
                    app.positions.length > 0 ? (
                      app.positions.map((pos, index) => (
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
                    ) : app.position ? (
                      <Chip
                        label={app.position}
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
                {app.package_offered && (
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
                      ₹{app.package_offered} LPA
                    </Typography>
                  </Box>
                )}

                {/* Industry Chip */}
                <Chip
                  label={app.industry}
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
                      {new Date(app.application_date).toLocaleDateString(
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

              {/* Card Actions - UPDATED */}
              <Box
                sx={{
                  p: 3,
                  pt: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {/* Pending Posts - Approve/Disapprove buttons */}
                {activeTab === 0 && (
                  <>
                    <Button
                      fullWidth
                      size="medium"
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApp(app);
                        setActionType("approve");
                        setActionDialogOpen(true);
                      }}
                      sx={{
                        textTransform: "none",
                        bgcolor: "#10b981",
                        color: "white",
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: "#059669",
                        },
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      fullWidth
                      size="medium"
                      variant="outlined"
                      startIcon={<CloseIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApp(app);
                        setActionType("disapprove");
                        setActionDialogOpen(true);
                      }}
                      sx={{
                        textTransform: "none",
                        color: "#ef4444",
                        borderColor: "#ef4444",
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: "rgba(239, 68, 68, 0.1)",
                          borderColor: "#ef4444",
                        },
                      }}
                    >
                      Disapprove
                    </Button>
                  </>
                )}

                {/* Approved Posts - NO BUTTONS, just a message */}
                {activeTab === 1 && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "rgba(16, 185, 129, 0.08)",
                      borderRadius: 1,
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#10b981",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Post is approved and live
                    </Typography>
                  </Box>
                )}

                {/* Disapproved Posts - Show rejection reason */}
                {activeTab === 2 && app.rejection_reason && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "rgba(239, 68, 68, 0.1)",
                      borderRadius: 1,
                      border: "1px solid #ef4444",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#ef4444",
                        fontWeight: 600,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Rejection Reason:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                    >
                      {app.rejection_reason}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            borderRadius: 2,
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary" }}
        >
          {actionType === "approve" ? "Approve Post" : "Disapprove Post"}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          }}
        >
          <Box sx={{ minWidth: 400 }}>
            <Typography sx={{ color: "text.secondary", mb: 2 }}>
              {actionType === "approve"
                ? `Are you sure you want to approve this post from ${selectedApp?.company_name}?`
                : `Are you sure you want to disapprove this post from ${selectedApp?.company_name}?`}
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
                    backgroundColor: "background.default",
                    color: "text.primary",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          }}
        >
          <Button
            onClick={() => setActionDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={
              actionType === "approve" ? handleApprove : handleDisapprove
            }
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

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            borderRadius: 2,
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary" }}
        >
          Edit Post
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          }}
        >
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
          >
            <TextField
              fullWidth
              label="Company Name"
              value={editFormData.company_name || ""}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  company_name: e.target.value,
                })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.default",
                  color: "text.primary",
                  "& fieldset": {
                    borderColor:
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                  "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "#8b5cf6" },
                },
              }}
            />

            <TextField
              fullWidth
              label="Position"
              value={editFormData.position || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, position: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.default",
                  color: "text.primary",
                  "& fieldset": {
                    borderColor:
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                  "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "#8b5cf6" },
                },
              }}
            />

            <TextField
              fullWidth
              label="Package Offered (in Lakhs)"
              type="number"
              value={editFormData.package_offered || ""}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  package_offered: e.target.value,
                })
              }
              inputProps={{ step: "0.01", min: "0" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.default",
                  color: "text.primary",
                  "& fieldset": {
                    borderColor:
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                  "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "#8b5cf6" },
                },
              }}
            />

            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={4}
              value={editFormData.notes || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, notes: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.default",
                  color: "text.primary",
                  "& fieldset": {
                    borderColor:
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                  "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "#8b5cf6" },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          }}
        >
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: "text.secondary" }}
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

      {/* Create Post Modal */}
      <CreateApplicationModal
        open={openCreateModal}
        onClose={handleModalClose}
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