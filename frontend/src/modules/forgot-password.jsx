"use client";
import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { useTheme } from "@mui/material/styles";
import { StyledTextField } from "@/components/auth/authcomp";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function ForgotPassword() {
  const router = useRouter();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setSuccess(data.message);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Left Side - Form */}
      <Box
        sx={{
          width: { xs: "100%", md: "45%" },
          bgcolor: "background.default",
          p: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box sx={{ maxWidth: 450, mx: "auto", width: "100%" }}>
          <Typography
            variant="h4"
            sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}
          >
            Forgot Password
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
            Enter your email address and we'll send you a link to reset your
            password
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
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
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
                "SEND RESET LINK"
              )}
            </Button>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
            Reset Your Password
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.85 }}>
            Secure and easy password recovery
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
