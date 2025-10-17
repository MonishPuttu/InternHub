import { Box, Stack, Typography, IconButton, Chip } from "@mui/material";
import { School, Edit, Delete } from "@mui/icons-material";

export default function EducationCard({ education, onEdit, onDelete }) {
  return (
    <Box
      sx={{
        bgcolor: "#1e293b",
        borderRadius: 2,
        border: "1px solid #334155",
        p: 3,
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
              bgcolor: "#334155",
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
              sx={{ color: "#e2e8f0", fontWeight: 600, mb: 0.5 }}
            >
              {education.degree}
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
              {education.institution}
            </Typography>
            {education.field_of_study && (
              <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                {education.field_of_study}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{ color: "#64748b", display: "block", mb: 1 }}
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
                sx={{ color: "#94a3b8", mt: 2, lineHeight: 1.6 }}
              >
                <strong style={{ color: "#e2e8f0" }}>
                  Relevant coursework:
                </strong>{" "}
                {education.coursework}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <IconButton size="small" sx={{ color: "#8b5cf6" }} onClick={onEdit}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "#ef4444" }} onClick={onDelete}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
