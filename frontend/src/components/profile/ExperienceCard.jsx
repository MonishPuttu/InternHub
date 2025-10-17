import { Box, Stack, Typography, IconButton } from "@mui/material";
import { Work, Edit, Delete } from "@mui/icons-material";

export default function ExperienceCard({ experience, onEdit, onDelete }) {
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <Box
      sx={{
        bgcolor: "#1e293b",
        borderRadius: 2,
        border: "1px solid #334155",
        p: 3,
      }}
    >
      <Stack direction="row" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            bgcolor: "#334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Work sx={{ color: "#8b5cf6", fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
            {experience.job_title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
            {experience.company_name}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
            {experience.location}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {formatDate(experience.start_date)} -{" "}
            {formatDate(experience.end_date)}
          </Typography>
          {experience.description && (
            <Typography
              variant="body2"
              sx={{ color: "#94a3b8", mt: 2, lineHeight: 1.6 }}
            >
              {experience.description}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
