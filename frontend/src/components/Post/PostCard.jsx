"use client";
import {
  Card,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
} from "@mui/material";
import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

// Individual PostCard Component
function PostCard({ post, isSaved, onToggleSave, onViewDetails, onApply }) {
  const theme = useTheme();

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
      {/* Header Section */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Icon and Bookmark */}
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
          <IconButton
            size="small"
            onClick={onToggleSave}
            sx={{
              color: isSaved ? "#8b5cf6" : "text.secondary",
              "&:hover": {
                bgcolor: "rgba(139, 92, 246, 0.1)",
              },
            }}
          >
            {isSaved ? (
              <BookmarkIcon sx={{ fontSize: 22 }} />
            ) : (
              <BookmarkBorderIcon sx={{ fontSize: 22 }} />
            )}
          </IconButton>
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

      {/* Apply Button */}
      <Box sx={{ p: 3, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onApply || onViewDetails}
          sx={{
            bgcolor: "#8b5cf6",
            "&:hover": {
              bgcolor: "#7c3aed",
              transform: "scale(1.02)",
            },
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.95rem",
            py: 1.5,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
            transition: "all 0.2s",
          }}
        >
          {onApply ? "Apply Now" : "View Details"}
        </Button>
      </Box>
    </Card>
  );
}

// Grid Container Component - Main Export
export default function PostsGrid({
  posts,
  savedPosts = [],
  onToggleSave,
  onViewDetails,
  onApply,
}) {
  return (
    <Box>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={post.id}>
            <PostCard
              post={post}
              isSaved={savedPosts.includes(post.id)}
              onToggleSave={() => onToggleSave && onToggleSave(post.id)}
              onViewDetails={() => onViewDetails && onViewDetails(post)}
              onApply={() => onApply && onApply(post)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Export both components
export { PostCard, PostsGrid };