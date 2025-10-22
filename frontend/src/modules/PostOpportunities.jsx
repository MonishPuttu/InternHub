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
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Upload as UploadIcon
} from "@mui/icons-material";
import axios from "axios";
import { CreateApplicationModal } from "../components/CreateApplicationModal";

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

export default function PostOpportunities() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    position: "",
    company_name: "",
    industry: "",
    package_offered: "",
    notes: "",
    status: "",
    media: "",
    location: "",
    job_type: "",
    contact_person: "",
    contact_email: "",
    job_link: "",
    application_date: "",
    application_deadline: "",
    interview_date: "",
    offer_date: "",
    rejection_date: "",
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  // Calculate statistics
  const stats = {
    total: applications.length,
    approved: applications.filter(app => app.approval_status === 'approved').length,
    pending: applications.filter(app => app.approval_status !== 'approved').length,
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/posts/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.ok) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setErrorMsg("Failed to load applications");
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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BACKEND_URL}/api/posts/applications/${selectedApp.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMsg("Application deleted successfully");
      fetchApplications();
    } catch (error) {
      setErrorMsg("Failed to delete application");
    }
    handleMenuClose();
  };

  const handleModalClose = () => {
    setOpenModal(false);
    fetchApplications();
  };

  const handleViewDetails = (app) => {
    router.push(`/postdetails/${app.id}`);
  };

  const handleOpenEditDialog = () => {
    if (!selectedApp) return;

    console.log("Opening edit dialog for:", selectedApp);

    setEditFormData({
      position: selectedApp.position || "",
      company_name: selectedApp.company_name || "",
      industry: selectedApp.industry || "",
      package_offered: selectedApp.package_offered || "",
      notes: selectedApp.notes || "",
      status: selectedApp.status || "applied",
      media: selectedApp.media || "",
      location: selectedApp.location || "",
      job_type: selectedApp.job_type || "",
      contact_person: selectedApp.contact_person || "",
      contact_email: selectedApp.contact_email || "",
      job_link: selectedApp.job_link || "",
      application_date: selectedApp.application_date ? selectedApp.application_date.split('T')[0] : "",
      application_deadline: selectedApp.application_deadline ? selectedApp.application_deadline.split('T')[0] : "",
      interview_date: selectedApp.interview_date ? selectedApp.interview_date.split('T')[0] : "",
      offer_date: selectedApp.offer_date ? selectedApp.offer_date.split('T')[0] : "",
      rejection_date: selectedApp.rejection_date ? selectedApp.rejection_date.split('T')[0] : "",
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    handleMenuClose();
    setEditFormData({
      position: "",
      company_name: "",
      industry: "",
      package_offered: "",
      notes: "",
      status: "",
      media: "",
      location: "",
      job_type: "",
      contact_person: "",
      contact_email: "",
      job_link: "",
      application_date: "",
      application_deadline: "",
      interview_date: "",
      offer_date: "",
      rejection_date: "",
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedApp) return;

    try {
      const token = localStorage.getItem("token");

      const updatePayload = {};

      Object.keys(editFormData).forEach(key => {
        const value = editFormData[key];
        if (value !== null && value !== undefined) {
          updatePayload[key] = value;
        }
      });

      console.log("Sending update payload:", updatePayload);

      const response = await axios.put(
        `${BACKEND_URL}/api/posts/applications/${selectedApp.id}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Update response:", response.data);

      if (response.data.ok) {
        setSuccessMsg("Post updated successfully!");
        handleCloseEditDialog();
        fetchApplications();
      } else {
        setErrorMsg(response.data.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      console.error("Error details:", error.response?.data);
      setErrorMsg(error.response?.data?.error || "Failed to update post");
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === "all") return true;
    if (filterStatus === "approved") return app.approval_status === 'approved';
    if (filterStatus === "pending") return app.approval_status !== 'approved';
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "#e2e8f0" }}>Loading opportunities...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}>
            Post Opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Manage your internship and job applications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{
            bgcolor: "#8b5cf6",
            "&:hover": { bgcolor: "#7c3aed" },
            fontWeight: 600,
            textTransform: "none",
            px: 3,
            py: 1.5,
          }}
        >
          Create Post
        </Button>
      </Box>

      {/* Statistics Section */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <Card
          onClick={() => setFilterStatus("all")}
          sx={{
            bgcolor: filterStatus === "all" ? "#8b5cf620" : "#1e293b",
            border: `2px solid ${filterStatus === "all" ? "#8b5cf6" : "#334155"}`,
            borderRadius: 2,
            p: 1.5,
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "#8b5cf6",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5, fontSize: "0.8rem" }}>
            Total Opportunities
          </Typography>
          <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
            {stats.total}
          </Typography>
        </Card>

        <Card
          onClick={() => setFilterStatus("approved")}
          sx={{
            bgcolor: filterStatus === "approved" ? "#10b98120" : "#1e293b",
            border: `2px solid ${filterStatus === "approved" ? "#10b981" : "#334155"}`,
            borderRadius: 2,
            p: 1.5,
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "#10b981",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5, fontSize: "0.8rem" }}>
            Approved Posts
          </Typography>
          <Typography variant="h6" sx={{ color: "#10b981", fontWeight: 600 }}>
            {stats.approved}
          </Typography>
        </Card>

        <Card
          onClick={() => setFilterStatus("pending")}
          sx={{
            bgcolor: filterStatus === "pending" ? "#fbbf2420" : "#1e293b",
            border: `2px solid ${filterStatus === "pending" ? "#fbbf24" : "#334155"}`,
            borderRadius: 2,
            p: 1.5,
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "#fbbf24",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5, fontSize: "0.8rem" }}>
            Pending Approval
          </Typography>
          <Typography variant="h6" sx={{ color: "#fbbf24", fontWeight: 600 }}>
            {stats.pending}
          </Typography>
        </Card>
      </Box>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
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
            {filterStatus === "all" ? "No opportunities posted yet" : `No ${filterStatus} opportunities`}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            {filterStatus === "all" ? "Start by creating your first opportunity post" : "Try a different filter"}
          </Typography>
          {filterStatus === "all" ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenModal(true)}
              sx={{
                bgcolor: "#8b5cf6",
                "&:hover": { bgcolor: "#7c3aed" },
                textTransform: "none",
              }}
            >
              Create Your First Post
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setFilterStatus("all")}
              sx={{
                borderColor: "#8b5cf6",
                color: "#8b5cf6",
                "&:hover": { bgcolor: "#8b5cf610" },
                textTransform: "none",
              }}
            >
              View All Opportunities
            </Button>
          )}
        </Box>
      ) : (
        <Stack spacing={3}>
          {filteredApplications.map((app) => (
            <Card
              key={app.id}
              elevation={0}
              sx={{
                bgcolor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 2,
                p: 2.5,
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#8b5cf6",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(139, 92, 246, 0.15)",
                },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {app.media && (
                  <Box
                    component="img"
                    src={app.media}
                    alt={app.company_name}
                    sx={{
                      width: "100%",
                      height: 180,
                      borderRadius: 2,
                      objectFit: "cover",
                      border: "2px solid #334155",
                    }}
                  />
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box />
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, app)}
                    sx={{ color: "#94a3b8" }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#e2e8f0",
                        fontWeight: 700,
                        mb: 0.5,
                        fontSize: "1.1rem",
                      }}
                    >
                      {app.position}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#94a3b8",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                      }}
                    >
                      {app.company_name}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      fontSize: "0.85rem",
                    }}
                  >
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      alignItems: "center",
                    }}
                  >
                    {app.package_offered && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AttachMoneyIcon sx={{ fontSize: 16, color: "#64748b" }} />
                        <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                          ₹{app.package_offered}L
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                        {app.industry}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                        Posted {new Date(app.application_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {app.approval_status === 'approved' ? (
                      <Chip
                        label="Approved"
                        size="small"
                        sx={{
                          bgcolor: "rgba(16, 185, 129, 0.1)",
                          color: "#10b981",
                          fontSize: "0.7rem",
                          height: 24,
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      />
                    ) : app.approval_status === 'disapproved' ? (
                      <Chip
                        label="Disapproved"
                        size="small"
                        sx={{
                          bgcolor: "rgba(239, 68, 68, 0.1)",
                          color: "#ef4444",
                          fontSize: "0.7rem",
                          height: 24,
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                      />
                    ) : (
                      <Chip
                        label="Pending Approval"
                        size="small"
                        sx={{
                          bgcolor: "rgba(251, 191, 36, 0.1)",
                          color: "#fbbf24",
                          fontSize: "0.7rem",
                          height: 24,
                          border: "1px solid rgba(251, 191, 36, 0.3)",
                        }}
                      />
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(app)}
                      sx={{
                        bgcolor: "rgba(139, 92, 246, 0.1)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        color: "#a78bfa",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 2,
                        "&:hover": {
                          bgcolor: "rgba(139, 92, 246, 0.2)",
                          borderColor: "#8b5cf6",
                        },
                      }}
                    >
                      View Details
                    </Button>
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
          sx: { bgcolor: "#1e293b", border: "1px solid #334155" },
        }}
      >
        <MenuItem onClick={handleOpenEditDialog}>
          <EditIcon sx={{ mr: 1, fontSize: 20, color: "#8b5cf6" }} />
          Edit Post
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "#ef4444" }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            color: "#e2e8f0",
            borderRadius: 2,
            maxHeight: "90vh",
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
          Edit Post
          <IconButton onClick={handleCloseEditDialog} sx={{ color: "#94a3b8" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#334155" }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Company Name */}
            <TextField
              fullWidth
              label="Company Name"
              value={editFormData.company_name}
              onChange={(e) => handleEditFormChange("company_name", e.target.value)}
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

            {/* Position and Industry - 2 columns */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <TextField
                fullWidth
                label="Position *"
                value={editFormData.position}
                onChange={(e) => handleEditFormChange("position", e.target.value)}
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

              <FormControl fullWidth>
                <InputLabel sx={{ color: "#94a3b8" }}>Industry *</InputLabel>
                <Select
                  value={editFormData.industry}
                  onChange={(e) => handleEditFormChange("industry", e.target.value)}
                  label="Industry *"
                  sx={{
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#8b5cf6" },
                    "& .MuiSvgIcon-root": { color: "#94a3b8" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#1e293b",
                        color: "#e2e8f0",
                        "& .MuiMenuItem-root": {
                          "&:hover": { bgcolor: "#334155" },
                          "&.Mui-selected": { bgcolor: "#8b5cf620" },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  <MenuItem value="Retail">Retail</MenuItem>
                  <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Application Date and Status - 2 columns */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <TextField
                fullWidth
                label="Application Date *"
                type="date"
                value={editFormData.application_date}
                onChange={(e) => handleEditFormChange("application_date", e.target.value)}
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

              <FormControl fullWidth>
                <InputLabel sx={{ color: "#94a3b8" }}>Status</InputLabel>
                <Select
                  value={editFormData.status}
                  onChange={(e) => handleEditFormChange("status", e.target.value)}
                  label="Status"
                  sx={{
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#8b5cf6" },
                    "& .MuiSvgIcon-root": { color: "#94a3b8" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#1e293b",
                        color: "#e2e8f0",
                        "& .MuiMenuItem-root": {
                          "&:hover": { bgcolor: "#334155" },
                          "&.Mui-selected": { bgcolor: "#8b5cf620" },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="applied">Applied</MenuItem>
                  <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                  <MenuItem value="interviewed">Interviewed</MenuItem>
                  <MenuItem value="offer">Offer Received</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Package Offered */}
            <TextField
              fullWidth
              label="Package Offered (in Lakhs)"
              type="number"
              value={editFormData.package_offered}
              onChange={(e) => handleEditFormChange("package_offered", e.target.value)}
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

            {/* Deadline Date */}
            <TextField
              fullWidth
              label="Deadline Date"
              type="date"
              value={editFormData.application_deadline}
              onChange={(e) => handleEditFormChange("application_deadline", e.target.value)}
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

            {/* Additional Notes */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Notes"
              value={editFormData.notes}
              onChange={(e) => handleEditFormChange("notes", e.target.value)}
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

            {/* Media Section with Preview and Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 1.5, fontWeight: 600 }}>
                Upload Poster/Media (Optional)
              </Typography>

              {editFormData.media ? (
                <Box sx={{ position: "relative", mb: 2 }}>
                  {/* Image Preview */}
                  <Box
                    component="img"
                    src={editFormData.media}
                    alt="Post media"
                    sx={{
                      width: "100%",
                      height: 200,
                      borderRadius: 2,
                      objectFit: "cover",
                      border: "2px solid #334155",
                    }}
                  />

                  {/* Remove Button */}
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={() => handleEditFormChange("media", "")}
                      sx={{
                        borderColor: "#ef4444",
                        color: "#ef4444",
                        "&:hover": {
                          bgcolor: "rgba(239, 68, 68, 0.1)",
                          borderColor: "#ef4444",
                        },
                        textTransform: "none",
                      }}
                    >
                      Remove Image
                    </Button>
                  </Box>
                </Box>
              ) : (
                // Upload Area
                <Box
                  component="label"
                  htmlFor="upload-media-edit"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    border: "2px dashed #8b5cf6",
                    borderRadius: 2,
                    bgcolor: "#0f172a",
                    color: "#a78bfa",
                    py: 6,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#a78bfa",
                      bgcolor: "#1e293b",
                    },
                  }}
                >
                  <UploadIcon sx={{ fontSize: 48, color: "#a78bfa" }} />
                  <Typography variant="body1" sx={{ color: "#e2e8f0", fontWeight: 500 }}>
                    Click to upload image
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    Images only (JPG, PNG, GIF, WebP) — Max 50 MB
                  </Typography>
                  <input
                    id="upload-media-edit"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => handleEditFormChange("media", reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #334155" }}>
          <Button
            onClick={handleCloseEditDialog}
            sx={{ color: "#94a3b8", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Modal */}
      <CreateApplicationModal open={openModal} onClose={handleModalClose} />

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