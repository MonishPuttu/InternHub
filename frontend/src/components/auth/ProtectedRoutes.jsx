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
    bgcolor: "background.paper";
    // Check if user has access to this route
    const hasAccess = canAccessRoute(pathname);
    const userRole = getUserRole();

    if (!hasAccess) {
      console.warn(`Access denied for role: ${userRole} to route: ${pathname}`);

      // Redirect to appropriate dashboard based on role, or signin if not logged in
      switch (userRole) {
        case "student":
          router.push("/dashboard/student");
          break;
        case "placement":
          router.push("/dashboard/placement");
          break;
        case "recruiter":
          router.push("/dashboard/recruiter");
          break;
        case null:
          router.push("/signin");
          break;
        default:
          router.push("/signin");
      }

      setIsAuthorized(false);
      setIsLoading(false);
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
          minHeight: "80vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  // If not authorized, show nothing (redirect is happening)
  if (!isAuthorized) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: "background.default",
          color: "text.primary",
          gap: 2,
        }}
      >
        <Typography variant="h5">Redirecting to your dashboard...</Typography>
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  // User is authorized, render children
  return <>{children}</>;
}
