"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Button,
  Menu,
  MenuItem,
  Card,
  Chip,
  IconButton,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { CreateApplicationModal } from "@/components/Post/CreateApplicationModal";
import {
  BACKEND_URL,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/constants/postConstants";

// Recruiter Post Card Component
function RecruiterPostCard({ post, onViewDetails, onDelete }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  // Parse positions array - handle both old and new format
  const positions = Array.isArray(post.positions)
    ? post.positions
    : post.position
    ? [
        {
          title: post.position,
          job_type: post.job_type || "Full Time",
          package_offered: post.package_offered,
          duration: post.duration,
          skills: post.skills_required || [],
        },
      ]
    : [];

  // Get primary position for card display
  const primaryPosition = positions[0] || {};

  // Calculate days ago
  const getDaysAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Posted today";
    if (diffDays === 1) return "Posted 1 day ago";
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  // Mock application count (you can replace with real data from backend)
  const applicationCount = Math.floor(Math.random() * 100) + 1;

  // Get status badge
  const getStatusBadge = () => {
    if (post.approval_status === "approved") {
      return (
        <Chip
          label="✓ Approved"
          size="small"
          sx={{
            bgcolor: "rgba(16, 185, 129, 0.15)",
            color: "#10b981",
            fontWeight: 700,
            fontSize: "0.7rem",
            height: "24px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        />
      );
    } else if (post.approval_status === "pending") {
      return (
        <Chip
          label="⏳ Pending"
          size="small"
          sx={{
            bgcolor: "rgba(251, 191, 36, 0.15)",
            color: "#fbbf24",
            fontWeight: 700,
            fontSize: "0.7rem",
            height: "24px",
            border: "1px solid rgba(251, 191, 36, 0.3)",
          }}
        />
      );
    } else {
      return (
        <Chip
          label="✕ Disapproved"
          size="small"
          sx={{
            bgcolor: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            fontWeight: 700,
            fontSize: "0.7rem",
            height: "24px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        />
      );
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        "&:hover": {
          borderColor: "#8b5cf6",
          transform: "translateY(-4px)",
          boxShadow: "0 12px 28px rgba(139, 92, 246, 0.2)",
        },
      }}
    >
      {/* Header with Icon and Status */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Icon and Status Badge */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              bgcolor: "rgba(139, 92, 246, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WorkIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />
          </Box>
          {getStatusBadge()}
        </Box>

        {/* Latest Opportunity Label */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              fontSize: "0.85rem",
              mb: 0.3,
            }}
          >
            Latest Opportunity
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
            }}
          >
            {getDaysAgo(post.application_date)}
          </Typography>
        </Box>

        {/* Job Title */}
        <Typography
          variant="h6"
          sx={{
            color: "text.primary",
            fontWeight: 700,
            fontSize: "1.25rem",
            lineHeight: 1.3,
            mb: 0.5,
            cursor: "pointer",
            "&:hover": { color: "#8b5cf6" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
          onClick={onViewDetails}
        >
          {primaryPosition.title || post.position || "Position"}
        </Typography>

        {/* Company and Location */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {post.company_name} • {post.industry}
        </Typography>
      </Box>

      {/* Tags Section */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={primaryPosition.job_type || "Full Time"}
            size="small"
            sx={{
              bgcolor:
                primaryPosition.job_type === "Internship"
                  ? "rgba(34, 197, 94, 0.15)"
                  : primaryPosition.job_type === "Full Time"
                  ? "rgba(59, 130, 246, 0.15)"
                  : "rgba(139, 92, 246, 0.15)",
              color:
                primaryPosition.job_type === "Internship"
                  ? "#22c55e"
                  : primaryPosition.job_type === "Full Time"
                  ? "#3b82f6"
                  : "#8b5cf6",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: "28px",
            }}
          />
          {primaryPosition.duration && (
            <Chip
              label={primaryPosition.duration}
              size="small"
              sx={{
                bgcolor: "rgba(139, 92, 246, 0.1)",
                color: "#8b5cf6",
                fontWeight: 600,
                fontSize: "0.75rem",
                height: "28px",
              }}
            />
          )}
          {primaryPosition.package_offered && (
            <Chip
              label={`${primaryPosition.package_offered} ${
                primaryPosition.job_type === "Internship" ? "/mo" : "LPA"
              }`}
              size="small"
              sx={{
                bgcolor: "rgba(168, 85, 247, 0.15)",
                color: "#a855f7",
                fontWeight: 700,
                fontSize: "0.75rem",
                height: "28px",
              }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* Footer Info */}
      <Box
        sx={{
          px: 3,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          borderTop: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          pt: 2,
          mt: 2,
        }}
      >
        {/* Deadline */}
        {post.application_deadline &&
          !isNaN(new Date(post.application_deadline).getTime()) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.85rem" }}
              >
                Application Deadline:{" "}
                {new Date(post.application_deadline).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                )}
              </Typography>
            </Box>
          )}

        {/* Students Applied */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PeopleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.85rem" }}
          >
            {applicationCount} students applied
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons - For Recruiters */}
      <Box sx={{ p: 3, pt: 0, display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onViewDetails}
          startIcon={<VisibilityIcon />}
          sx={{
            bgcolor: "#8b5cf6",
            "&:hover": {
              bgcolor: "#7c3aed",
              transform: "scale(1.02)",
            },
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
            py: 1.5,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
            transition: "all 0.2s",
          }}
        >
          View Details
        </Button>
        {onDelete && (
          <IconButton
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
            }}
            sx={{
              color: "text.secondary",
              border: "1px solid",
              borderColor:
                theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
              borderRadius: 2,
              "&:hover": {
                bgcolor: "rgba(239, 68, 68, 0.1)",
                borderColor: "#ef4444",
                color: "#ef4444",
              },
            }}
          >
            <MoreVertIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>

      {/* Delete Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDelete();
          }}
          sx={{
            color: "#ef4444",
            "&:hover": {
              bgcolor: "rgba(239, 68, 68, 0.1)",
            },
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Post
        </MenuItem>
      </Menu>
    </Card>
  );
}

// Grid Container for Recruiter Posts
function RecruiterPostsGrid({ posts, onViewDetails, onDelete }) {
  return (
    <Box>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={post.id}>
            <RecruiterPostCard
              post={post}
              onViewDetails={() => onViewDetails && onViewDetails(post)}
              onDelete={() => onDelete && onDelete(post)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Main RecruiterPost Component
export default function RecruiterPost() {
  const router = useRouter();
  const theme = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
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

  const handleDelete = async (app) => {
    setSelectedApp(app);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${BACKEND_URL}/api/posts/applications/${app.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg("Application deleted successfully");
      fetchApplications();
    } catch (error) {
      setErrorMsg("Failed to delete application");
    }
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

      {/* Applications Grid */}
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
        <RecruiterPostsGrid
          posts={filteredApplications}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
        />
      )}

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