"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/session";
import { Box, CircularProgress } from "@mui/material";

export default function CalendarPage() {
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
        router.push("/calendar/student");
        break;
      case "placement":
        router.push("/calendar/placement");
        break;
      case "recruiter":
        router.push("/calendar/recruiter");
        break;
      default:
        router.push("/calendar/student");
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
