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
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../../modules/sidebar";
import UserMenu from "@/components/auth/userMenu";
import { isAuthenticated, startSessionChecker } from "@/lib/session";

const DRAWER_WIDTH = 240;

export default function ProtectedLayout({ children }) {
  const router = useRouter();
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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0f172a" }}>
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
            bgcolor: "#1e293b",
            borderBottom: "1px solid #334155",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#e2e8f0", flexGrow: 1 }}
            ></Typography>
            {/* User Menu */}
            <UserMenu />
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box>{children}</Box>
      </Box>
    </Box>
  );
}
