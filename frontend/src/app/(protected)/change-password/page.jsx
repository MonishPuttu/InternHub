"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { StyledTextField } from "@/components/auth/authcomp";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function ChangePassword() {
  const router = useRouter();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || "Failed to change password");
        setLoading(false);
        return;
      }

      setSuccess("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        router.push("/settings");
      }, 2000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Button
          onClick={() => router.push("/settings")}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: "#8b5cf6",
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(139, 92, 246, 0.04)" },
          }}
        >
          Back to Settings
        </Button>
      </Box>

      <Typography
        variant="h4"
        sx={{ color: "text.primary", fontWeight: 700, mb: 2 }}
      >
        Change Password
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
        Enter your current password and choose a new one
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mt: 2 }}>
          <StyledTextField
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword((s) => !s)}
                    edge="end"
                    sx={{ color: "text.secondary" }}
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <StyledTextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword((s) => !s)}
                    edge="end"
                    sx={{ color: "text.secondary" }}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <StyledTextField
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    edge="end"
                    sx={{ color: "text.secondary" }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            bgcolor: "#8b5cf6",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 1.5,
            py: 1.5,
            textTransform: "none",
            fontSize: "1rem",
            mt: 3,
            "&:hover": { bgcolor: "#7c3aed" },
            "&:disabled": { bgcolor: "#475569" },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "CHANGE PASSWORD"
          )}
        </Button>
      </Box>
    </Box>
  );
}
