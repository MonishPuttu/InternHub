import {
  Card,
  Box,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import useApplyToPost from "@/hooks/useApplyToPost";
import ApplyDialog from "./ApplyDialog";
import { useTheme } from "@mui/material/styles";

export default function PostCard({
  post,
  isSaved,
  onToggleSave,
  onApply,
  onViewDetails,
  onShare,
}) {
  const theme = useTheme();
  const {
    applyDialogOpen,
    setApplyDialogOpen,
    hasApplied,
    handleApply,
    snackbar,
    handleCloseSnackbar,
  } = useApplyToPost(post.id);

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

  return (
    <>
      <Card
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          borderRadius: 2,
          overflow: "hidden",
          transition: "all 0.2s",
          "&:hover": {
            borderColor: "#8b5cf6",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(139, 92, 246, 0.15)",
          },
        }}
      >
        {/* Media Banner */}
        {post.media && (
          <Box
            component="img"
            src={post.media}
            alt={post.company_name}
            sx={{
              width: "100%",
              height: 180,
              objectFit: "cover",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                opacity: 0.9,
              },
            }}
            onClick={onViewDetails}
          />
        )}

        <Box sx={{ p: 3 }}>
          {/* Company Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <BusinessIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.primary",
                    fontWeight: 700,
                    cursor: "pointer",
                    "&:hover": { color: "#8b5cf6" },
                  }}
                  onClick={onViewDetails}
                >
                  {post.company_name}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOnIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {post.industry}
                  </Typography>
                </Box>
                {/* NO departments, NO empty Box */}
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                size="small"
                onClick={onToggleSave}
                sx={{
                  color: isSaved ? "#a78bfa" : "text.secondary",
                  "&:hover": {
                    bgcolor: "rgba(139, 92, 246, 0.1)",
                  },
                }}
              >
                {isSaved ? (
                  <BookmarkIcon sx={{ fontSize: 20 }} />
                ) : (
                  <BookmarkBorderIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
              <IconButton
                size="small"
                onClick={onShare}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: "rgba(139, 92, 246, 0.1)",
                  },
                }}
              >
                <ShareIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Positions Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md:
                  positions.length === 1
                    ? "1fr"
                    : "repeat(auto-fit, minmax(280px, 1fr))",
              },
              gap: 2,
              mb: 2,
            }}
          >
            {positions.map((position, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 2.5,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(139, 92, 246, 0.05)"
                      : "rgba(139, 92, 246, 0.03)",
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark"
                      ? "rgba(139, 92, 246, 0.2)"
                      : "rgba(139, 92, 246, 0.15)",
                  borderRadius: 2,
                }}
              >
                {/* Position Title */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "text.primary",
                    fontWeight: 700,
                    mb: 1.5,
                    fontSize: "1rem",
                  }}
                >
                  {position.title}
                </Typography>

                {/* Position Details */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {/* Location & Job Type */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color:
                          position.job_type === "Internship"
                            ? "#10b981"
                            : "#8b5cf6",
                        bgcolor:
                          position.job_type === "Internship"
                            ? "rgba(16,185,129,0.10)"
                            : "rgba(139, 92, 246, 0.1)",
                        borderRadius: 1,
                        px: 1,
                        py: "2px",
                        fontSize: "0.78rem",
                        display: "inline-block",
                      }}
                    >
                      {position.job_type}
                    </Typography>
                    {position.duration && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <AccessTimeIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                        >
                          {position.duration}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Package */}
                  {position.package_offered && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <AttachMoneyIcon
                        sx={{ fontSize: 16, color: "#10b981" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "text.primary", fontWeight: 600 }}
                      >
                        ₹{position.package_offered}
                        {position.job_type === "Internship"
                          ? "/month"
                          : " per month"}
                      </Typography>
                    </Box>
                  )}
                  {/* NO skills, NO empty Box */}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Description */}
          {post.notes && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mb: 2,
                lineHeight: 1.6,
                fontSize: "0.875rem",
              }}
            >
              {post.notes.length > 150
                ? `${post.notes.substring(0, 150)}...`
                : post.notes}
            </Typography>
          )}

          {/* Footer - Dates and Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pt: 2,
              borderTop: "1px solid",
              borderColor:
                theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeIcon
                  sx={{ fontSize: 14, color: "text.secondary" }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                >
                  Posted {new Date(post.application_date).toLocaleDateString()}
                </Typography>
              </Box>
              {post.application_deadline &&
                !isNaN(new Date(post.application_deadline).getTime()) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: "#ef4444" }} />
                    <Typography
                      variant="caption"
                      sx={{ color: "#ef4444", fontSize: "0.75rem" }}
                    >
                      Deadline{" "}
                      {new Date(post.application_deadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onViewDetails}
                sx={{
                  borderColor: "#8b5cf6",
                  color: "#8b5cf6",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.813rem",
                  "&:hover": {
                    borderColor: "#7c3aed",
                    bgcolor: "rgba(139, 92, 246, 0.1)",
                  },
                }}
              >
                View Details
              </Button>
              {hasApplied ? (
                <Button
                  variant="contained"
                  size="small"
                  disabled
                  sx={{
                    bgcolor: "#10b981",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.813rem",
                  }}
                >
                  Applied
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setApplyDialogOpen(true)}
                  sx={{
                    bgcolor: "#10b981",
                    "&:hover": { bgcolor: "#059669" },
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.813rem",
                  }}
                >
                  Apply Now
                </Button>
              )}
            </Box>
          </Box>
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
    </>
  );
}
