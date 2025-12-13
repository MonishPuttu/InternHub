"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TopBar from "@/modules/sidebar";
import UserMenu from "@/components/auth/userMenu";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { isAuthenticated, startSessionChecker } from "@/lib/session";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

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
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Top Navigation Bar with User Menu */}
      <TopBar>
        <UserMenu />
      </TopBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
        }}
      >
        {/* Page Content with Role Protection */}
        <Box sx={{ p: 3 }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </Box>
    </Box>
  );
}