"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import axios from "axios";
import { BACKEND_URL } from "@/constants/postConstants";
import ApplyDialog from "@/components/Post/ApplyDialog";
import useApplyToPost from "@/hooks/useApplyToPost";
import { useTheme } from "@mui/material/styles";
import { getUser } from "@/lib/session";

export default function PostDetails({ postId, showApplyButtons = true }) {
  const router = useRouter();
  const theme = useTheme();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getUser();

  const {
    applyDialogOpen,
    setApplyDialogOpen,
    hasApplied,
    snackbar,
    checkApplicationStatus,
    handleApply,
    handleCloseSnackbar,
  } = useApplyToPost(postId);

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
      checkApplicationStatus();
    }
    // eslint-disable-next-line
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/applications/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.ok) {
        setPost(response.data.application);
      } else {
        setError("Post not found");
      }
    } catch (error) {
      setError("Failed to load post details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.back();

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );

  if (error || !post)
    return (
      <Box sx={{ p: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            color: "text.secondary",
            mb: 3,
            "&:hover": { bgcolor: "rgba(139, 92, 246, 0.1)" },
          }}
        >
          Back
        </Button>
        <Card
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            borderRadius: 2,
            p: 6,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ef4444", mb: 2 }}>
            {error || "Post not found"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            The post you're looking for doesn't exist or has been removed.
          </Typography>
        </Card>
      </Box>
    );

  // Positions array from backend
  const positions = Array.isArray(post.positions) ? post.positions : [];
  const mainTitle =
    positions.length === 1
      ? positions[0].title
      : `${positions.length} Open Positions`;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          color: "text.secondary",
          mb: 3,
          "&:hover": { bgcolor: "rgba(139, 92, 246, 0.1)" },
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        Back to Opportunities
      </Button>

      <Card
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* HEADER WITH BACKGROUND IMAGE */}
        <Box
          sx={{
            position: "relative",
            minHeight: 280,
            backgroundImage: post.media
              ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${post.media})`
              : `linear-gradient(135deg, ${
                  theme.palette.mode === "dark" ? "#1e293b" : "#8b5cf6"
                } 0%, ${
                  theme.palette.mode === "dark" ? "#334155" : "#a78bfa"
                } 100%)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 1,
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {mainTitle}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "rgba(255, 255, 255, 0.95)",
                fontWeight: 600,
                mb: 2,
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              {post.company_name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 4 }}>
          {/* QUICK INFO GRID */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {post.industry && (
              <Grid item xs={12} sm={6} md={4}>
                <InfoBox
                  icon={
                    <BusinessIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                  }
                  label="Industry"
                  value={post.industry}
                  theme={theme}
                />
              </Grid>
            )}

            {post.application_date && (
              <Grid item xs={12} sm={6} md={4}>
                <InfoBox
                  icon={
                    <CalendarIcon
                      sx={{ fontSize: 20, color: "text.secondary" }}
                    />
                  }
                  label="Posted Date"
                  value={new Date(post.application_date).toLocaleDateString(
                    "en-IN",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                  theme={theme}
                />
              </Grid>
            )}

            {post.application_deadline && (
              <Grid item xs={12} sm={6} md={4}>
                <InfoBox
                  icon={
                    <AccessTimeIcon sx={{ fontSize: 20, color: "#ef4444" }} />
                  }
                  label="Deadline"
                  value={new Date(post.application_deadline).toLocaleDateString(
                    "en-IN",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                  theme={theme}
                />
              </Grid>
            )}

            {post.target_departments && post.target_departments.length > 0 && (
              <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "transparent",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                      height: "100%",
                    }}
                  >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Target Departments
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {post.target_departments.map(
                      (dept, idx) =>
                        typeof dept === "string" &&
                        dept.trim() && (
                          <Chip
                            key={idx}
                            label={dept}
                            size="small"
                            sx={{
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "#334155"
                                  : "#e2e8f0",
                              color: "text.primary",
                              fontSize: "0.75rem",
                              height: 24,
                              fontWeight: 600,
                            }}
                          />
                        )
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* DESCRIPTION / NOTES */}
          {post.notes && (
            <>
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 700, mb: 2 }}
              >
                Description & Notes
              </Typography>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "transparent",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  mb: 4,
                }}
              >
                <Typography
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {post.notes}
                </Typography>
              </Box>
            </>
          )}

          <Divider
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
              mb: 4,
            }}
          />

          {/* POSITIONS & ROLES */}
          {positions.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{ color: "text.primary", fontWeight: 700, mb: 3 }}
              >
                Positions & Roles
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {positions.map((pos, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                      borderRadius: 2,
                      minHeight: 140,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      flex: '1 1 30%',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}
                    >
                      {pos.title}
                    </Typography>
                    {pos.package && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AttachMoneyIcon sx={{ fontSize: 18, color: "#10b981" }} />
                        <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                          {pos.package}
                        </Typography>
                      </Box>
                    )}
                    {typeof pos.openings !== "undefined" && (
                      <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
                        Openings: {pos.openings}
                      </Typography>
                    )}
                    {pos.description && (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {pos.description}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
              <Divider
                sx={{
                  bgcolor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  mb: 4,
                }}
              />

              {/* APPLICATION STAGES / TIMELINE */}
              {Array.isArray(post.stages) && post.stages.length > 0 && (
                <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{ color: "text.primary", fontWeight: 700, mb: 0 }}
                  >
                    Application Stages
                  </Typography>
                  {post.stages.map((stage, idx) => {
                    const status = stage.status || "pending";
                    const statusColor =
                      status === "completed"
                        ? "#10b981"
                        : status === "in_progress"
                        ? "#8b5cf6"
                        : theme.palette.text.secondary;

                    return (
                      <Paper
                        key={idx}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                          borderRadius: 2,
                          width: '100%',
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          backgroundColor: 'transparent',
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{stage.name}</Typography>
                          {stage.date && (
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                              {new Date(stage.date).toLocaleString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              px: 1.2,
                              py: 0.4,
                              borderRadius: 1,
                              bgcolor:
                                status === "completed"
                                  ? "rgba(16,185,129,0.12)"
                                  : status === "in_progress"
                                  ? "rgba(139,92,246,0.12)"
                                  : "transparent",
                              color: statusColor,
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            {status.replace("_", " ").toUpperCase()}
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}

          {/* POSTER / MEDIA -- ONLY IF MEDIA EXISTS */}
          {post.media && (
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Box sx={{ position: "relative", mb: 3 }}>
                <Chip
                  label="POSTER / MEDIA"
                  sx={{
                    position: "relative",
                    bgcolor:
                      theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
                    color: "text.secondary",
                    fontWeight: 600,
                    zIndex: 1,
                  }}
                />
              </Box>
              <Button
                component="a"
                href={post.media}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LinkIcon />}
                sx={{
                  bgcolor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  mb: 4,
                }}
              />
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 700, mb: 2 }}
              >
                Description & Notes
              </Typography>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "background.default",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  mb: 4,
                }}
              >
                <Typography
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {post.notes}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Card>

      <ApplyDialog
        open={applyDialogOpen}
        post={post}
        onClose={() => setApplyDialogOpen(false)}
        onSubmit={handleApply}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Action Buttons */}
      {showApplyButtons &&
        user &&
        user.role !== "recruiter" &&
        user.role !== "placement" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mt: 4,
              mb: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{
                borderColor:
                  theme.palette.mode === "dark" ? "#334155" : "#cbd5e1",
                color: "text.secondary",
                "&:hover": {
                  borderColor: "#8b5cf6",
                  bgcolor: "rgba(139, 92, 246, 0.1)",
                },
                textTransform: "none",
                fontWeight: 600,
                px: 4,
              }}
            >
              Back to List
            </Button>
            {hasApplied ? (
              <Button
                variant="contained"
                disabled
                sx={{
                  bgcolor: "#10b981",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  "&.Mui-disabled": {
                    bgcolor: "rgba(16, 185, 129, 0.5)",
                    color: "white",
                  },
                }}
              >
                Applied
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setApplyDialogOpen(true)}
                sx={{
                  bgcolor: "#8b5cf6",
                  "&:hover": { bgcolor: "#7c3aed" },
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                }}
              >
                Apply Now
              </Button>
            )}
          </Box>
        )}
    </Box>
  );
}

// Reusable InfoBox component for highlights
function InfoBox({ icon, label, value, theme }) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "transparent",
        borderRadius: 2,
        border: "1px solid",
        borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        {icon}
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
      </Box>
      <Typography
        component="div"
        sx={{ color: "text.primary", fontWeight: 600 }}
      >
        {value}
      </Typography>
    </Box>
  );
}