"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/session";
import { Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function TrainingPage() {
  const router = useRouter();
  const user = getUser();
  const theme = useTheme();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Role-based routing for Training section
    switch (user.role) {
      case "student":
        router.push("/training/student");
        break;
      case "placement":
        router.push("/training/placement");
        break;
      //   case "recruiter":
      //     router.push("/training/recruiter"); // optional
      //     break;
      default:
        router.push("/training/student");
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
