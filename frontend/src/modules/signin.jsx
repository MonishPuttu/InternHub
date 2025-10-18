"use client";
import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import {
  StyledTextField,
  StyledSelect,
  roleOptions,
} from "@/components/auth/authcomp";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const roleContent = {
  student: {
    title: "Welcome to Student Portal",
    subtitle: "Login to access your account",
    icon: SchoolIcon,
    color: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
  },
  placement: {
    title: "Welcome to Placement Cell",
    subtitle: "Login to manage placements",
    icon: WorkIcon,
    color: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  },
  recruiter: {
    title: "Welcome Recruiters",
    subtitle: "Login to find top talent",
    icon: BusinessIcon,
    color: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
  },
};

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.role) {
      setError("Please select your role");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || "Sign in failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const getRoleDisplay = () => {
    if (!formData.role) {
      return {
        title: "Welcome to InternHub",
        subtitle: "Choose your role to continue",
        icon: SchoolIcon,
        color: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
      };
    }
    return roleContent[formData.role];
  };

  const currentRole = getRoleDisplay();
  const IconComponent = currentRole.icon;

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
            Login
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 4 }}>
            Enter your account details
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                I am a...
              </Typography>
              <StyledSelect
                label="Select Role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                options={roleOptions}
                required
              />
            </Box>

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

            <Box sx={{ mt: 2 }}>
              <StyledTextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
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

            <Box sx={{ textAlign: "right", mt: 1.5, mb: 2 }}>
              <Link
                component={NextLink}
                href="/forgot-password"
                underline="hover"
                sx={{ color: "#8b5cf6", fontSize: "0.875rem", fontWeight: 500 }}
              >
                Forgot Password?
              </Link>
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
                "&:hover": { bgcolor: "#7c3aed" },
                "&:disabled": { bgcolor: "#475569" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "LOGIN"
              )}
            </Button>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Don't have an account?{" "}
                <Link
                  component={NextLink}
                  href="/signup"
                  underline="hover"
                  sx={{ color: "#8b5cf6", fontWeight: 600 }}
                >
                  Sign Up
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
          background: currentRole.color,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
          transition: "background 0.5s ease",
        }}
      >
        <Box sx={{ textAlign: "center", color: "#fff", maxWidth: 600 }}>
          <IconComponent sx={{ fontSize: 120, mb: 3, opacity: 0.9 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            {currentRole.title}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.85 }}>
            {currentRole.subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
