"use client";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
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
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { CreateApplicationModal } from "@/components/Post/CreateApplicationModal";
import Portal from "@mui/material/Portal";
import VerticalInlineTimeline from "@/components/Timeline/VerticalInlineTimeline";
import {
  BACKEND_URL,
  INDUSTRIES,
  STATUS_OPTIONS,
} from "@/constants/postConstants";

// Header color palette and stable picker
const HEADER_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

const getHeaderColor = (key) => {
  if (!key) return HEADER_COLORS[0];
  const str = key.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return HEADER_COLORS[Math.abs(hash) % HEADER_COLORS.length];
};

const isLight = (theme) => theme.palette.mode === "light";

const PostCard = React.memo(function PostCard({
  app,
  activeTab,
  expanded,
  onToggleTimeline,
  onViewDetails,
  theme,
  openTimelinePostId,
  children,
}) {
  return (
    <Box
      onClick={() => onViewDetails(app.id)}
      sx={{
        breakInside: "avoid",
        mb: 3,
        display: "block",
        position: "relative",
        contain: "layout paint",
        border: "1px solid",
        borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        borderRadius: 2,
        transition: "all 0.3s ease",
        opacity:
          openTimelinePostId && openTimelinePostId !== app.id ? 0.85 : 1,
        filter:
          openTimelinePostId && openTimelinePostId !== app.id
            ? "saturate(0.9)"
            : "none",
        bgcolor: "background.default",
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
          borderColor: "#8b5cf6",
        },
      }}
    >
      {children}
    </Box>
  );
});

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

  // Timeline portal / anchor management (one open timeline at a time)
  const timelineAnchorRef = useRef(null);
  const [openTimelinePostId, setOpenTimelinePostId] = useState(null);
  const [portalStyle, setPortalStyle] = useState(null);

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

  // compute portal position when openTimelinePostId changes
  useLayoutEffect(() => {
    if (!openTimelinePostId || !timelineAnchorRef.current) {
      setPortalStyle(null);
      return;
    }

    const rect = timelineAnchorRef.current.getBoundingClientRect();
    setPortalStyle({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [openTimelinePostId]);

  // close timeline portal on scroll/resize
  useEffect(() => {
    if (!openTimelinePostId) return undefined;

    const close = () => setOpenTimelinePostId(null);

    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [openTimelinePostId]);

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
              color: isLight(theme) ? "#475569" : "text.secondary",
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
            columnCount: {
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
            },
            columnGap: 2,
            width: "100%",
          }}
        >
          {currentPosts.map((app) => {
            const headerColor =
              theme.palette.mode === "light"
                ? getHeaderColor(app.id || app.company_name)
                : "rgba(139,92,246,0.12)";
            return (
            <PostCard
              key={`post-${app.id}`}
              app={app}
              activeTab={activeTab}
              expanded={openTimelinePostId === app.id}
              openTimelinePostId={openTimelinePostId}
              onToggleTimeline={(e) => {
                // attach anchor and toggle single open timeline
                if (e && e.currentTarget) timelineAnchorRef.current = e.currentTarget;
                setOpenTimelinePostId((prev) => (prev === app.id ? null : app.id));
              }}
              onViewDetails={handleViewDetails}
              theme={theme}
            >
              {/* Company Logo Header */}
              <Box
                sx={{
                  height: 72,
                  px: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderBottom: "1px solid rgba(0,0,0,0.12)",
                  backgroundColor: headerColor,
                }}
              >
                {/* Logo */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    backgroundColor: headerColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(139,92,246,0.25)",
                    flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  }}
                >
                  {app.company_logo || app.company_logo_url ? (
                    <Box
                      component="img"
                      src={app.company_logo || app.company_logo_url}
                      alt={app.company_name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        p: 0.5,
                      bgcolor: "background.paper",
                      }}
                    />
                  ) : (
                    <WorkIcon sx={{ color: "white", fontSize: 26 }} />
                  )}
                </Box>

                {/* Company name (optional, looks good like img1) */}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: isLight(theme) ? "#0f172a" : "white",
                    textShadow: isLight(theme) ? "none" : "0 1px 2px rgba(0,0,0,0.4)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {app.company_name}
                </Typography>
              </Box>

              {/* Card Content */}
              <Box sx={{ p: 3, flexGrow: 1 }}>
                {/* Status Badge + Posted Time */}
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
                        color: isLight(theme) ? "#475569" : "text.secondary",
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
                        color: isLight(theme) ? "#475569" : "text.secondary",
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
                              bgcolor: isLight(theme) ? "rgba(139,92,246,0.12)" : "transparent",
                              color: isLight(theme) ? "#334155" : "white",
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
                          bgcolor: isLight(theme) ? "rgba(139,92,246,0.12)" : "rgba(139, 92, 246, 0.15)",
                          color: isLight(theme) ? "#334155" : "#8b5cf6",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                        }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: isLight(theme) ? "#475569" : "text.secondary", fontSize: "0.85rem" }}
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
                    bgcolor: isLight(theme) ? "rgba(59,130,246,0.2)" : "rgba(59, 130, 246, 0.15)",
                    color: isLight(theme) ? "#1e40af" : "#3b82f6",
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
                        color: isLight(theme) ? "#475569" : "text.secondary",
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
                        bgcolor: "#8b5cf6",
                        color: "white",
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: "#7c3aed",
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

                {/* Approved message removed (kept timeline below) */}

                {activeTab === 1 && (
                    <Box sx={{ mt: 2 }}>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        // attach anchor and toggle single open timeline
                        timelineAnchorRef.current = e.currentTarget;
                        setOpenTimelinePostId((prev) => (prev === app.id ? null : app.id));
                      }}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        bgcolor: "background.default",
                        border: "1px solid rgba(139,92,246,0.25)",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "rgba(139,92,246,0.08)" },
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, color: "#a78bfa" }}>
                        Timeline
                      </Typography>
                      <ExpandMoreIcon
                        sx={{
                          transform: openTimelinePostId === app.id ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 200ms",
                        }}
                      />
                    </Box>
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
                      sx={{ color: isLight(theme) ? "#475569" : "text.secondary", fontSize: "0.85rem" }}
                    >
                      {app.rejection_reason}
                    </Typography>
                  </Box>
                )}
              </Box>
            </PostCard>
          );
          })}
        </Box>
      )}

      {/* Portaled timeline (single instance outside the masonry/grid) */}
      {portalStyle && openTimelinePostId && (
        <Portal>
          <Box
            sx={{
              position: "absolute",
              top: portalStyle.top,
              left: portalStyle.left,
              width: portalStyle.width,
              zIndex: 1400,
              pointerEvents: "auto",
              backdropFilter: "blur(2px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Paper
              elevation={3}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(139,92,246,0.25)"
                    : "#e2e8f0",
                boxShadow: theme.palette.mode === "dark"
                  ? "0 10px 32px rgba(0,0,0,0.45)"
                  : "0 10px 32px rgba(0,0,0,0.12)",
                overflow: "visible",
              }}
            >
              <Box sx={{ px: 1, pt: 0.5, animation: "fadeUp 220ms cubic-bezier(0.16, 1, 0.3, 1)", "@keyframes fadeUp": { from: { opacity: 0, transform: "translateY(-6px)" }, to: { opacity: 1, transform: "translateY(0)" } } }}>
                <VerticalInlineTimeline postId={openTimelinePostId} />
              </Box>
            </Paper>
          </Box>
        </Portal>
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
            <Typography sx={{ color: isLight(theme) ? "#475569" : "text.secondary", mb: 2 }}>
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
                    color: isLight(theme) ? "#475569" : "text.secondary",
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
            sx={{ color: isLight(theme) ? "#475569" : "text.secondary" }}
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
                  color: isLight(theme) ? "#475569" : "text.secondary",
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
                  color: isLight(theme) ? "#475569" : "text.secondary",
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
                  color: isLight(theme) ? "#475569" : "text.secondary",
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
                  color: isLight(theme) ? "#475569" : "text.secondary",
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
            sx={{ color: isLight(theme) ? "#475569" : "text.secondary" }}
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