// File: frontend/src/components/ProtectedRoute.jsx
// Wrapper component for role-based route protection

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Typography, CircularProgress } from "@mui/material";
import { canAccessRoute, getUserRole } from "@/lib/roleProtection";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has access to this route
    const hasAccess = canAccessRoute(pathname);
    const userRole = getUserRole();

    if (!hasAccess) {
      console.warn(`Access denied for role: ${userRole} to route: ${pathname}`);
      // Redirect to login if unauthorized
      router.push("/signin");
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [pathname, router]);

  // Show loading while checking authorization
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#0f172a",
        }}
      >
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  // If not authorized, show error (this shouldn't show due to redirect above)
  if (!isAuthorized) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#0f172a",
          color: "#e2e8f0",
        }}
      >
        <Typography variant="h5">
          You don't have permission to access this page
        </Typography>
      </Box>
    );
  }

  // User is authorized, render children
  return <>{children}</>;
}