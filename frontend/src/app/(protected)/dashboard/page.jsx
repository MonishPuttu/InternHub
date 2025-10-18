import { Typography, Box } from "@mui/material";

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ color: "#e2e8f0", mb: 2 }}>
        Dashboard
      </Typography>
      <Typography sx={{ color: "#94a3b8" }}>
        Welcome to your dashboard
      </Typography>
    </Box>
  );
}
