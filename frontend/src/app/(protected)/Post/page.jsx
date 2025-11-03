"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/session";
import { Box, CircularProgress } from "@mui/material";

export default function PostPage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Role-based routing for Post section
    switch (user.role) {
      case "student":
        router.push("/post/student");
        break;
      case "placement":
        router.push("/post/placement");
        break;
      case "recruiter":
        router.push("/post/recruiter");
        break;
      default:
        router.push("/post/student");
    }
  }, [user, router]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        bgcolor: "#0f172a",
      }}
    >
      <CircularProgress sx={{ color: "#8b5cf6" }} />
    </Box>
  );
}
