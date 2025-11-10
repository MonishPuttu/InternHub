import {
  Card,
  Box,
  Typography,
  Button,
  Chip,
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

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
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
        {post.media && (
          <Box
            component="img"
            src={post.media}
            alt={post.company_name}
            sx={{
              width: "100%",
              height: 220,
              borderRadius: 2,
              objectFit: "cover",
              border: "2px solid",
              borderColor:
                theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#8b5cf6",
              },
            }}
            onClick={onViewDetails}
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
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "text.primary",
                  fontWeight: 700,
                  mb: 0.5,
                  cursor: "pointer",
                  "&:hover": { color: "#a78bfa" },
                }}
                onClick={onViewDetails}
              >
                {post.position}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {post.company_name}
              </Typography>
            </Box>

            {post.notes && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                {post.notes.length > 120
                  ? `${post.notes.substring(0, 120)}...`
                  : post.notes}
              </Typography>
            )}

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {post.package_offered && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AttachMoneyIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    ₹{post.package_offered}L
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationOnIcon
                  sx={{ fontSize: 18, color: "text.secondary" }}
                />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {post.industry}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeIcon
                  sx={{ fontSize: 18, color: "text.secondary" }}
                />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Posted {new Date(post.application_date).toLocaleDateString()}
                  {post.application_deadline &&
                    !isNaN(new Date(post.application_deadline).getTime()) && (
                      <>
                        {" "}
                        | Deadline{" "}
                        {new Date(
                          post.application_deadline
                        ).toLocaleDateString()}
                      </>
                    )}
                </Typography>
              </Box>
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
            <Button
              variant="contained"
              size="small"
              onClick={onViewDetails}
              sx={{
                bgcolor: "#8b5cf6",
                "&:hover": { bgcolor: "#7c3aed" },
                textTransform: "none",
                fontWeight: 600,
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
                }}
              >
                Apply Now
              </Button>
            )}
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                size="small"
                onClick={onToggleSave}
                sx={{
                  flex: 1,
                  color: isSaved ? "#a78bfa" : "text.secondary",
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  borderRadius: 1,
                  "&:hover": {
                    borderColor: "#8b5cf6",
                    bgcolor: "rgba(139, 92, 246, 0.1)",
                  },
                }}
              >
                {isSaved ? (
                  <BookmarkIcon sx={{ fontSize: 18 }} />
                ) : (
                  <BookmarkBorderIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
              <IconButton
                size="small"
                onClick={onShare}
                sx={{
                  flex: 1,
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  borderRadius: 1,
                  "&:hover": {
                    borderColor: "#8b5cf6",
                    bgcolor: "rgba(139, 92, 246, 0.1)",
                  },
                }}
              >
                <ShareIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

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
    </Card>
  );
}
