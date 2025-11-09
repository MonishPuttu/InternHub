import { Box, Stack, Typography, IconButton, Chip } from "@mui/material";
import { School, Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function EducationCard({ education, onEdit, onDelete }) {
  const theme = useTheme();

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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
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
            <School sx={{ color: "#8b5cf6", fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
            >
              {education.degree}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 0.5 }}
            >
              {education.institution}
            </Typography>
            {education.field_of_study && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                {education.field_of_study}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 1 }}
            >
              {education.start_date} - {education.end_date || "Present"}
            </Typography>
            {education.grade && (
              <Chip
                label={education.grade}
                size="small"
                sx={{
                  bgcolor: "#10b981",
                  color: "#fff",
                  fontWeight: 600,
                  height: 24,
                }}
              />
            )}
            {education.coursework && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 2, lineHeight: 1.6 }}
              >
                <strong style={{ color: theme.palette.text.primary }}>
                  Relevant coursework:
                </strong>{" "}
                {education.coursework}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
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
  );
}
