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
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { CreateApplicationModal } from "@/components/Post/CreateApplicationModal";
import {
  BACKEND_URL,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/constants/postConstants";

export default function RecruiterPost() {
  const router = useRouter();
  const theme = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const stats = {
    total: applications.length,
    approved: applications.filter((app) => app.approval_status === "approved")
      .length,
    pending: applications.filter((app) => app.approval_status === "pending")
      .length,
    disapproved: applications.filter(
      (app) => app.approval_status === "disapproved"
    ).length,
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      await axios.delete(
        `${BACKEND_URL}/api/posts/applications/${selectedApp.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    router.push(`/Post/postdetails/${app.id}`);
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "approved") return app.approval_status === "approved";
    if (filterStatus === "pending") return app.approval_status === "pending";
    if (filterStatus === "disapproved")
      return app.approval_status === "disapproved";
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "text.primary" }}>
          Loading opportunities...
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
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ color: "text.primary", fontWeight: 700, mb: 0.5 }}
            >
              Post Opportunities
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
        <Box sx={{ mt: 2, display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box
            onClick={() => setFilterStatus("all")}
            sx={{
              cursor: "pointer",
              p: 2,
              borderRadius: 1,
              bgcolor: "background.paper",
              border: "2px solid",
              borderColor:
                filterStatus === "all"
                  ? "#8b5cf6"
                  : theme.palette.mode === "dark"
                  ? "#334155"
                  : "#e2e8f0",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#8b5cf6",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Total Opportunities
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 700 }}
            >
              {stats.total}
            </Typography>
          </Box>

          <Box
            onClick={() => setFilterStatus("approved")}
            sx={{
              cursor: "pointer",
              p: 2,
              borderRadius: 1,
              bgcolor: "background.paper",
              border: "2px solid",
              borderColor:
                filterStatus === "approved"
                  ? "#10b981"
                  : theme.palette.mode === "dark"
                  ? "#334155"
                  : "#e2e8f0",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#10b981",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Approved Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#10b981", fontWeight: 700 }}>
              {stats.approved}
            </Typography>
          </Box>

          <Box
            onClick={() => setFilterStatus("pending")}
            sx={{
              cursor: "pointer",
              p: 2,
              borderRadius: 1,
              bgcolor: "background.paper",
              border: "2px solid",
              borderColor:
                filterStatus === "pending"
                  ? "#fbbf24"
                  : theme.palette.mode === "dark"
                  ? "#334155"
                  : "#e2e8f0",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#fbbf24",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Pending Review
            </Typography>
            <Typography variant="h6" sx={{ color: "#fbbf24", fontWeight: 700 }}>
              {stats.pending}
            </Typography>
          </Box>

          <Box
            onClick={() => setFilterStatus("disapproved")}
            sx={{
              cursor: "pointer",
              p: 2,
              borderRadius: 1,
              bgcolor: "background.paper",
              border: "2px solid",
              borderColor:
                filterStatus === "disapproved"
                  ? "#ef4444"
                  : theme.palette.mode === "dark"
                  ? "#334155"
                  : "#e2e8f0",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#ef4444",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Disapproved Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#ef4444", fontWeight: 700 }}>
              {stats.disapproved}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
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
            {filterStatus === "all"
              ? "No opportunities posted yet"
              : `No ${filterStatus} opportunities`}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            {filterStatus === "all"
              ? "Start by creating your first opportunity post"
              : "Try a different filter"}
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
                "&:hover": {
                  bgcolor: "rgba(139, 92, 246, 0.1)",
                  borderColor: "#7c3aed",
                },
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
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
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
                      border: "2px solid",
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    }}
                  />
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.primary",
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
                        color: "text.secondary",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                      }}
                    >
                      {app.company_name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, app)}
                    sx={{ color: "text.secondary" }}
                  >
                    <MoreVertIcon />
                  </IconButton>
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
                      flexWrap: "wrap",
                    }}
                  >
                    {app.package_offered && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <AttachMoneyIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                        >
                          ₹{app.package_offered}L
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <LocationOnIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                      >
                        {app.industry}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <AccessTimeIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                      >
                        Posted{" "}
                        {new Date(app.application_date).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {app.application_deadline &&
                      !isNaN(new Date(app.application_deadline).getTime()) && (
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.85rem",
                            }}
                          >
                            Deadline{" "}
                            {new Date(
                              app.application_deadline
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {app.approval_status === "approved" ? (
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
                    ) : app.approval_status === "disapproved" ? (
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
          sx: {
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            "& .MuiMenuItem-root": {
              color: "text.primary",
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(239, 68, 68, 0.05)",
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleDelete} sx={{ color: "#ef4444 !important" }}>
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
