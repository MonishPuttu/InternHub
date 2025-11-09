"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/session";
import { Box, CircularProgress } from "@mui/material";

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Role-based routing
    switch (user.role) {
      case "student":
        router.push("/dashboard/student");
        break;
      case "placement":
        router.push("/dashboard/placement");
        break;
      case "recruiter":
        router.push("/dashboard/recruiter");
        break;
      default:
        router.push("/dashboard/student");
    }
  }, [user, router]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CircularProgress sx={{ color: "#8b5cf6" }} />
    </Box>
  );
}
