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
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Star as StarIcon,
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
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/analytics/applications`, {
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
      await axios.delete(`${BACKEND_URL}/api/analytics/applications/${selectedApp.id}`, {
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

      {/* Applications List - New Horizontal Layout */}
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
              <Box sx={{ display: "flex", gap: 3, alignItems: "start", flexWrap: "wrap" }}>
                {/* Left Section - Status Badge */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 80,
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
                  {/* Match Score - You can calculate this based on skills */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                    <StarIcon sx={{ color: "#fbbf24", fontSize: 18 }} />
                    <Typography
                      sx={{
                        color: "#10b981",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      95%
                    </Typography>
                  </Box>
                </Box>

                {/* Middle Section - Main Content */}
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  {/* Company & Position */}
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

                  {/* Description */}
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

                  {/* Info Row */}
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
                        6 months
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PeopleIcon sx={{ fontSize: 18, color: "#64748b" }} />
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        234 applicants
                      </Typography>
                    </Box>
                  </Box>

                  {/* Tags - If you have skills or tags stored */}
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {["React", "Node.js", "TypeScript"].map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: "rgba(139, 92, 246, 0.1)",
                          color: "#a78bfa",
                          fontSize: "0.75rem",
                          height: 24,
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                        }}
                      />
                    ))}
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