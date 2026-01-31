"use client";

import { Box, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Brightness4, Brightness7, Logout } from "@mui/icons-material";
import { useColorMode } from "@/lib/themeRegistry";
import { logout } from "@/lib/session";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter();
  const colorMode = useColorMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleThemeToggle = () => {
    colorMode.toggleColorMode();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/signin");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        left: 20,
        zIndex: 1400,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        alignItems: "center",
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(255,255,255,0.08)"
            : "rgba(15,23,42,0.06)",
        borderRadius: 999,
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        px: 1.25,
        py: 1.5,
      }}
    >
      {/* Theme Toggle */}
      <Tooltip title={isDark ? "Light Mode" : "Dark Mode"} placement="right">
        <IconButton
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
          sx={{
            width: 42,
            height: 42,
            bgcolor: "transparent",
            color: (t) =>
              t.palette.mode === "dark" ? "#cbd5f5" : "#475569",
            "& svg": { fontSize: 20 },
            "&:hover": {
              bgcolor: "rgba(139,92,246,0.18)",
              color: "#8b5cf6",
            },
            transition: "all 160ms ease",
          }}
        >
          {isDark ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Tooltip>

      {/* Logout */}
      <Tooltip title="Logout" placement="right">
        <IconButton
          onClick={handleLogout}
          aria-label="Logout"
          sx={{
            width: 42,
            height: 42,
            bgcolor: "transparent",
            color: (t) =>
              t.palette.mode === "dark" ? "#cbd5f5" : "#475569",
            "& svg": { fontSize: 20 },
            "&:hover": {
              bgcolor: "rgba(239, 68, 68, 0.18)",
              color: "#ef4444",
            },
            transition: "all 160ms ease",
          }}
        >
          <Logout />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
