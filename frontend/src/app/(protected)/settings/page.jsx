"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import { getUser, logout } from "@/lib/session";

export default function Settings() {
  const router = useRouter();
  const user = getUser();

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleResetPassword = () => {
    router.push("/change-password");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{ color: "#e2e8f0", fontWeight: 700, mb: 4 }}
      >
        Settings
      </Typography>

      {/* Profile Info Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          p: 3,
          bgcolor: "#1e293b",
          borderRadius: 2,
          border: "1px solid #334155",
          mb: 4,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#8b5cf6",
            width: 80,
            height: 80,
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          {getInitials(user?.name)}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{ color: "#e2e8f0", fontWeight: 600, mb: 1 }}
          >
            {user?.name || "User"}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#8b5cf6", textTransform: "capitalize", mb: 1 }}
          >
            {user?.role}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            {user?.email}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#334155", mb: 4 }} />

      {/* Actions Section */}
      <Stack spacing={2} sx={{ maxWidth: 400 }}>
        <Button
          variant="outlined"
          onClick={handleResetPassword}
          sx={{
            color: "#8b5cf6",
            borderColor: "#8b5cf6",
            "&:hover": {
              borderColor: "#7c3aed",
              bgcolor: "rgba(139, 92, 246, 0.04)",
            },
            textTransform: "none",
            fontSize: "1rem",
            py: 1.5,
          }}
        >
          Reset Password
        </Button>

        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
            bgcolor: "#ef4444",
            color: "#fff",
            "&:hover": { bgcolor: "#dc2626" },
            textTransform: "none",
            fontSize: "1rem",
            py: 1.5,
          }}
        >
          Logout
        </Button>
      </Stack>
    </Box>
  );
}
