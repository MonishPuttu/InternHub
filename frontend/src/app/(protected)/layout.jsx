"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box } from "@mui/material";
import TopBar from "@/modules/topbar";
import GlobalSidebar from "@/modules/GlobalSidebar";
import UserMenu from "@/components/auth/userMenu";
import QuickActions from "@/components/QuickActions";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { isAuthenticated, startSessionChecker } from "@/lib/session";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }

    const cleanup = startSessionChecker(() => {
      alert("Your session has expired. Please login again.");
      router.push("/signin");
    });

    return cleanup;
  }, [router]);

  if (!mounted) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* TOP BAR */}
      <TopBar>
        <UserMenu />
      </TopBar>

      {/* QUICK ACTIONS - Bottom Left */}
      <QuickActions />

      {/* GLOBAL SIDEBAR + CONTENT */}
      <GlobalSidebar>{children}</GlobalSidebar>
    </Box>
  );
}
