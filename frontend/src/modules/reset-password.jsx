"use client";
import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SchoolIcon from "@mui/icons-material/School";
import {
  StyledTextField,
} from "@/components/auth/authcomp";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!token) {
      setError("Invalid reset token");
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess(data.message);
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0f172a" }}>
      {/* Left Side - Form */}
      <Box
        sx={{
          width: { xs: "100%", md: "45%" },
          bgcolor: "#0f172a",
          p: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box sx={{ maxWidth: 450, mx: "auto", width: "100%" }}>
          <Typography
            variant="h4"
            sx={{ color: "#e2e8f0", fontWeight: 700, mb: 1 }}
          >
            Reset Password
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 4 }}>
            Enter your new password below
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
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        sx={{ color: "#94a3b8" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
                        sx={{ color: "#94a3b8" }}
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
              disabled={loading || !token}
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
                "RESET PASSWORD"
              )}
            </Button>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Remember your password?{" "}
                <Link
                  component={NextLink}
                  href="/signin"
                  underline="hover"
                  sx={{ color: "#8b5cf6", fontWeight: 600 }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Dynamic Content */}
      <Box
        sx={{
          width: { xs: "0%", md: "55%" },
          background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
          transition: "background 0.5s ease",
        }}
      >
        <Box sx={{ textAlign: "center", color: "#fff", maxWidth: 600 }}>
          <SchoolIcon sx={{ fontSize: 120, mb: 3, opacity: 0.9 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Secure Your Account
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.85 }}>
            Create a strong password to protect your account
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
