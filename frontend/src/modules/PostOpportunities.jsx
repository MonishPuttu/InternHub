"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  LocalOffer as TagIcon,
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

      {/* Applications Grid */}
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
          <BusinessIcon sx={{ fontSize: 64, color: "#475569", mb: 2 }} />
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
        <Grid container spacing={3}>
          {applications.map((app) => (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#8b5cf6",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {app.media && (
                  <Box
                    sx={{
                      height: 180,
                      overflow: "hidden",
                      bgcolor: "#0f172a",
                    }}
                  >
                    <img
                      src={app.media}
                      alt={app.company_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                )}
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Chip
                      label={statusLabels[app.status]}
                      size="small"
                      sx={{
                        bgcolor: `${statusColors[app.status]}20`,
                        color: statusColors[app.status],
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, app)}
                      sx={{ color: "#94a3b8" }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{ color: "#e2e8f0", fontWeight: 700, mb: 1 }}
                  >
                    {app.company_name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "#94a3b8", mb: 2, fontWeight: 500 }}
                  >
                    {app.position}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TagIcon sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {app.industry}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {new Date(app.application_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {app.package_offered && (
                      <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 600 }}>
                        Package: ₹{app.package_offered}L
                      </Typography>
                    )}
                  </Box>

                  {app.notes && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        display: "block",
                        mt: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      {app.notes.substring(0, 100)}
                      {app.notes.length > 100 && "..."}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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