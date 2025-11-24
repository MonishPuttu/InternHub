"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Card,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon, // NEW IMPORT
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { CreateApplicationModal } from "@/components/Post/CreateApplicationModal"; // NEW IMPORT
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [openCreateModal, setOpenCreateModal] = useState(false); // NEW STATE

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

  // NEW HANDLER
  const handleModalClose = () => {
    setOpenCreateModal(false);
    fetchAllApplications(); // Refresh the list
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

  const handleEdit = (app) => {
    setSelectedApp(app);
    setEditFormData({
      company_name: app.company_name,
      position: app.position,
      industry: app.industry,
      package_offered: app.package_offered || "",
      notes: app.notes || "",
    });
    setEditDialogOpen(true);
    handleMenuClose();
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

  const handleMenuOpen = (event, app) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      {/* Header - MODIFIED TO ADD BUTTON */}
      <Box sx={{ mb: 4 }}>
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
              variant="h4"
              sx={{ color: "text.primary", fontWeight: 700, mb: 0.5 }}
            >
              Post Management
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Review and manage posted opportunities
            </Typography>
          </Box>

          {/* NEW: Create Post Button */}
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

        <Box sx={{ mt: 2, display: "flex", gap: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Pending Review
            </Typography>
            <Typography variant="h6" sx={{ color: "#fbbf24", fontWeight: 700 }}>
              {pendingPosts.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Approved Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#10b981", fontWeight: 700 }}>
              {approvedPosts.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Total Posts
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 700 }}
            >
              {applications.length}
            </Typography>
          </Box>
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

      {/* Posts List */}
      {currentPosts.length === 0 ? (
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
            {activeTab === 0
              ? "No pending posts"
              : activeTab === 1
              ? "No approved posts yet"
              : "No disapproved posts"}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {currentPosts.map((app) => (
            <Card
              key={app.id}
              elevation={0}
              sx={{
                bgcolor: "background.paper",
                border: activeTab === 0 ? "2px solid #fbbf24" : "1px solid",
                borderColor:
                  activeTab === 0
                    ? "#fbbf24"
                    : theme.palette.mode === "dark"
                    ? "#334155"
                    : "#e2e8f0",
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
                      border: "2px solid",
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    }}
                  />
                )}

                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    alignItems: "start",
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      alignItems: "center",
                      minWidth: 100,
                    }}
                  >
                    {activeTab === 0 && (
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
                    {activeTab === 1 && (
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
                    {activeTab === 2 && (
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
                            color: "text.primary",
                            fontWeight: 700,
                            mb: 0.5,
                          }}
                        >
                          {app.position}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          {app.company_name}
                        </Typography>
                      </Box>
                    </Box>

                    {app.notes && (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 2, lineHeight: 1.6 }}
                      >
                        {app.notes.length > 150
                          ? `${app.notes.substring(0, 150)}...`
                          : app.notes}
                      </Typography>
                    )}

                    <Box
                      sx={{ display: "flex", gap: 3, mb: 2, flexWrap: "wrap" }}
                    >
                      {app.package_offered && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <AttachMoneyIcon
                            sx={{ fontSize: 18, color: "text.secondary" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            ₹{app.package_offered}L
                          </Typography>
                        </Box>
                      )}

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <LocationOnIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {app.industry}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <AccessTimeIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Posted{" "}
                          {new Date(app.application_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {app.application_deadline &&
                        !isNaN(
                          new Date(app.application_deadline).getTime()
                        ) && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: 18, color: "#ef4444" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              Deadline{" "}
                              {new Date(
                                app.application_deadline
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
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
                    {activeTab === 0 && (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => {
                            setSelectedApp(app);
                            setActionType("approve");
                            setActionDialogOpen(true);
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
                            setActionType("disapprove");
                            setActionDialogOpen(true);
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
                    {activeTab !== 2 && (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            router.push(`/Post/postdetails/${app.id}`)
                          }
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
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            "& .MuiMenuItem-root": {
              color: "text.primary",
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(139, 92, 246, 0.1)"
                    : "rgba(139, 92, 246, 0.05)",
              },
            },
          },
        }}
      >
        <MenuItem onClick={() => handleEdit(selectedApp)}>
          <EditIcon sx={{ mr: 1, fontSize: 20, color: "#8b5cf6" }} />
          Edit Post
        </MenuItem>
      </Menu>

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
          <Stack spacing={2}>
            <Typography sx={{ color: "text.secondary" }}>
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
          </Stack>
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
          <Stack spacing={2.5}>
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
          </Stack>
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

      {/* NEW: Create Post Modal */}
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
