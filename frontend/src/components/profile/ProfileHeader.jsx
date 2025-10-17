import { Box, Typography, Button, Stack } from "@mui/material";

export default function ProfileHeader({ onSave, showSave }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: 700 }}>
          Profile & Resume
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          Manage your profile information and build your professional resume
        </Typography>
      </Box>
      {showSave && (
        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            bgcolor: "#8b5cf6",
            textTransform: "none",
            "&:hover": { bgcolor: "#7c3aed" },
          }}
        >
          Save Changes
        </Button>
      )}
    </Stack>
  );
}
