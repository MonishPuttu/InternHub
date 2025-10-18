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
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axios from "axios";
import { CreateApplicationModal } from "../components/CreateApplicationModal";
import { getUser } from "@/lib/session";

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
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

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
    setViewingApp(app);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setViewingApp(null);
  };

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
        {(() => {
          const user = typeof window !== "undefined" ? getUser() : null;
          const role = user ? user.role : null;
          // Only recruiters can create posts
          if (role === "recruiter") {
            return (
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
            );
          }
          return null;
        })()}
      </Box>

      {/* Applications List */}
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
            No opportunities posted yet
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            Start by creating your first opportunity post
          </Typography>
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
        </Box>
      ) : (
        <Stack spacing={3}>
          {applications.map((app) => (
            <Card
              key={app.id}
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

                {/* Bottom Section - Content */}
                <Box sx={{ display: "flex", gap: 3, alignItems: "start", flexWrap: "wrap" }}>
                  {/* Left Section - Status Badge */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
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
                        mb: 1,
                      }}
                    />
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
                  </Box>

                  {/* Middle Section - Main Content */}
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

                  {/* Right Section - Date & Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      minWidth: 120,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        mb: 2,
                      }}
                    >
                      Posted{" "}
                      {new Date(app.application_date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Typography>

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
        <MenuItem onClick={handleDelete} sx={{ color: "#ef4444" }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Details Dialog - FIXED */}
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
                <Typography variant="h6" sx={{ color: "#94a3b8", mb: 2 }}>
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
        <DialogActions sx={{ p: 2, borderTop: "1px solid #334155" }}>
          <Button onClick={handleCloseDetails} sx={{ color: "#94a3b8" }}>
            Close
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