"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { getUser, logout } from "@/lib/session";

export default function Settings() {
  const router = useRouter();
  const user = getUser();
  const [profileData, setProfileData] = useState(null);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.ok) {
        setProfileData(response.data.user.profile);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Get department information based on role
  const getDepartmentInfo = () => {
    if (!profileData) return null;

    if (user?.role === "placement") {
      return {
        label: "Department",
        value: profileData.department_branch || "Not specified",
      };
    } else if (user?.role === "recruiter") {
      return {
        label: "Industry Sector",
        value: profileData.industry_sector || "Not specified",
      };
    }
    return null;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  const departmentInfo = getDepartmentInfo();

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{ color: "text.primary", fontWeight: 700, mb: 4 }}
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
          bgcolor: "background.paper",
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
            sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}
          >
            {user?.name || "User"}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#8b5cf6", textTransform: "capitalize", mb: 1 }}
          >
            {user?.role}
          </Typography>
          {departmentInfo && (
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              {departmentInfo.label}: {departmentInfo.value}
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
