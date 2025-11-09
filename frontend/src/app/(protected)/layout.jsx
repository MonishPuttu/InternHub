"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "@/modules/sidebar";
import UserMenu from "@/components/auth/userMenu";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { isAuthenticated, startSessionChecker } from "@/lib/session";

const DRAWER_WIDTH = 240;

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const theme = useTheme(); // Add this
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check authentication
    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }

    // Start session checker
    const cleanup = startSessionChecker(() => {
      alert("Your session has expired. Please login again.");
      router.push("/signin");
    });

    return cleanup;
  }, [router]);

  if (!mounted) return null;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default", // Changed from hardcoded color
      }}
    >
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        <Sidebar
          variant="permanent"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: "none", md: "block" },
          }}
        />
        <Sidebar
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: "block", md: "none" },
          }}
        />
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "background.paper", // Changed from hardcoded color
            borderBottom: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{
                mr: 2,
                display: { md: "none" },
                color: "text.primary", // Added for theme support
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary", // Changed from hardcoded color
                flexGrow: 1,
              }}
            ></Typography>
            {/* User Menu */}
            <UserMenu />
          </Toolbar>
        </AppBar>

        {/* Page Content with Role Protection */}
        <Box>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </Box>
    </Box>
  );
}
