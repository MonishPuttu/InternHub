import { Box, Stack, Typography, IconButton } from "@mui/material";
import { Work, Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function ExperienceCard({ experience, onEdit, onDelete }) {
  const theme = useTheme();

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        p: 3,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "#8b5cf6",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)",
        },
      }}
    >
      <Stack direction="row" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            bgcolor: theme.palette.mode === "dark" ? "#334155" : "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Work sx={{ color: "#8b5cf6", fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="start"
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                {experience.job_title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 0.5 }}
              >
                {experience.company_name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 0.5 }}
              >
                {experience.location}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {formatDate(experience.start_date)} -{" "}
                {formatDate(experience.end_date)}
              </Typography>
              {experience.description && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 2, lineHeight: 1.6 }}
                >
                  {experience.description}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
              <IconButton
                size="small"
                sx={{
                  color: "#8b5cf6",
                  "&:hover": {
                    bgcolor: "rgba(139, 92, 246, 0.1)",
                  },
                }}
                onClick={onEdit}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "#ef4444",
                  "&:hover": {
                    bgcolor: "rgba(239, 68, 68, 0.1)",
                  },
                }}
                onClick={onDelete}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
