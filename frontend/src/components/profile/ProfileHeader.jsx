import { Box, Typography, Button, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function ProfileHeader({ onSave, showSave }) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{ color: "text.primary", fontWeight: 700 }}
        >
          Profile & Resume
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
