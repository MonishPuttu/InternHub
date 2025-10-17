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
  Stack,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  StyledTextField,
  StyledSelect,
  roleOptions,
  genderOptions,
} from "@/components/auth/authcomp";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function SignUp() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profileData, setProfileData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role,
          profileData,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || "Sign up failed");
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

  const updateProfileData = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStudentFields = () => (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Full Name"
          value={profileData.full_name || ""}
          onChange={(e) => updateProfileData("full_name", e.target.value)}
          required
        />
        <StyledTextField
          label="Roll Number"
          value={profileData.roll_number || ""}
          onChange={(e) => updateProfileData("roll_number", e.target.value)}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Student ID"
          value={profileData.student_id || ""}
          onChange={(e) => updateProfileData("student_id", e.target.value)}
        />
        <StyledTextField
          label="Contact Number"
          value={profileData.contact_number || ""}
          onChange={(e) => updateProfileData("contact_number", e.target.value)}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledSelect
          label="Gender"
          value={profileData.gender || ""}
          onChange={(e) => updateProfileData("gender", e.target.value)}
          options={genderOptions}
        />
        <StyledTextField
          label="Date of Birth"
          type="date"
          value={profileData.date_of_birth || ""}
          onChange={(e) => updateProfileData("date_of_birth", e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="College Name"
          value={profileData.college_name || ""}
          onChange={(e) => updateProfileData("college_name", e.target.value)}
        />
        <StyledTextField
          label="Branch"
          value={profileData.branch || ""}
          onChange={(e) => updateProfileData("branch", e.target.value)}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Current Semester"
          value={profileData.current_semester || ""}
          onChange={(e) =>
            updateProfileData("current_semester", e.target.value)
          }
        />
        <StyledTextField
          label="CGPA"
          value={profileData.cgpa || ""}
          onChange={(e) => updateProfileData("cgpa", e.target.value)}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="10th Score"
          value={profileData.tenth_score || ""}
          onChange={(e) => updateProfileData("tenth_score", e.target.value)}
        />
        <StyledTextField
          label="12th Score"
          value={profileData.twelfth_score || ""}
          onChange={(e) => updateProfileData("twelfth_score", e.target.value)}
        />
      </Stack>

      <StyledTextField
        label="LinkedIn Profile"
        value={profileData.linkedin || ""}
        onChange={(e) => updateProfileData("linkedin", e.target.value)}
        placeholder="https://linkedin.com/in/username"
      />

      <StyledTextField
        label="Skills"
        value={profileData.skills || ""}
        onChange={(e) => updateProfileData("skills", e.target.value)}
        placeholder="e.g., JavaScript, Python, React"
        multiline
        rows={2}
      />
    </Stack>
  );

  const renderPlacementFields = () => (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Name"
          value={profileData.name || ""}
          onChange={(e) => updateProfileData("name", e.target.value)}
          required
        />
        <StyledTextField
          label="Employee ID"
          value={profileData.employee_id || ""}
          onChange={(e) => updateProfileData("employee_id", e.target.value)}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Contact Number"
          value={profileData.contact_number || ""}
          onChange={(e) => updateProfileData("contact_number", e.target.value)}
        />
        <StyledSelect
          label="Gender"
          value={profileData.gender || ""}
          onChange={(e) => updateProfileData("gender", e.target.value)}
          options={genderOptions}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Role/Designation"
          value={profileData.role_designation || ""}
          onChange={(e) =>
            updateProfileData("role_designation", e.target.value)
          }
        />
        <StyledTextField
          label="Department/Branch"
          value={profileData.department_branch || ""}
          onChange={(e) =>
            updateProfileData("department_branch", e.target.value)
          }
        />
      </Stack>

      <StyledTextField
        label="College Name"
        value={profileData.college_name || ""}
        onChange={(e) => updateProfileData("college_name", e.target.value)}
      />

      <StyledTextField
        label="LinkedIn Profile"
        value={profileData.linkedin || ""}
        onChange={(e) => updateProfileData("linkedin", e.target.value)}
        placeholder="https://linkedin.com/in/username"
      />
    </Stack>
  );

  const renderRecruiterFields = () => (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Full Name"
          value={profileData.full_name || ""}
          onChange={(e) => updateProfileData("full_name", e.target.value)}
          required
        />
        <StyledTextField
          label="Company Name"
          value={profileData.company_name || ""}
          onChange={(e) => updateProfileData("company_name", e.target.value)}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Role/Designation"
          value={profileData.role_designation || ""}
          onChange={(e) =>
            updateProfileData("role_designation", e.target.value)
          }
        />
        <StyledSelect
          label="Gender"
          value={profileData.gender || ""}
          onChange={(e) => updateProfileData("gender", e.target.value)}
          options={genderOptions}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Industry/Sector"
          value={profileData.industry_sector || ""}
          onChange={(e) => updateProfileData("industry_sector", e.target.value)}
        />
        <StyledTextField
          label="Website"
          value={profileData.website || ""}
          onChange={(e) => updateProfileData("website", e.target.value)}
          placeholder="https://company.com"
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="LinkedIn Profile"
          value={profileData.linkedin || ""}
          onChange={(e) => updateProfileData("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/username"
        />
        <StyledTextField
          label="Headquarters/Location"
          value={profileData.headquarters_location || ""}
          onChange={(e) =>
            updateProfileData("headquarters_location", e.target.value)
          }
        />
      </Stack>
    </Stack>
  );

  const renderRoleSpecificFields = () => {
    switch (role) {
      case "student":
        return renderStudentFields();
      case "placement":
        return renderPlacementFields();
      case "recruiter":
        return renderRecruiterFields();
      default:
        return null;
    }
  };

  const getRoleTitle = () => {
    const titles = {
      student: "Student Information",
      placement: "Placement Cell Information",
      recruiter: "Recruiter Information",
    };
    return titles[role] || "Select a role to continue";
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0f172a" }}>
      {/* Left Side - Basic Auth Fields */}
      <Box
        sx={{
          width: { xs: "100%", md: role ? "40%" : "100%" },
          bgcolor: "#0f172a",
          p: { xs: 3, md: 5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transition: "width 0.3s ease",
        }}
      >
        <Box sx={{ maxWidth: 480, mx: "auto", width: "100%" }}>
          <Typography
            variant="h4"
            sx={{ color: "#e2e8f0", fontWeight: 700, mb: 1 }}
          >
            Sign Up
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 4 }}>
            Create your account to get started
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", mb: 1, fontSize: "0.875rem" }}
                >
                  I am a...
                </Typography>
                <StyledSelect
                  label="Select Role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setProfileData({});
                  }}
                  options={roleOptions}
                  required
                />
              </Box>

              <StyledTextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

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

              <StyledTextField
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((s) => !s)}
                        edge="end"
                        sx={{ color: "#94a3b8" }}
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

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
                  mt: 1,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": { bgcolor: "#7c3aed" },
                  "&:disabled": { bgcolor: "#475569" },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "CREATE ACCOUNT"
                )}
              </Button>
            </Stack>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Already have an account?{" "}
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

      {/* Right Side - Role-Specific Questions */}
      {role && (
        <Box
          sx={{
            width: { xs: "0%", md: "60%" },
            bgcolor: "#1e293b",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            p: { xs: 3, md: 6 },
            overflowY: "auto",
            transition: "all 0.3s ease",
          }}
        >
          <Box sx={{ maxWidth: 800, mx: "auto", width: "100%" }}>
            <Typography
              variant="h5"
              sx={{ color: "#e2e8f0", fontWeight: 700, mb: 1 }}
            >
              {getRoleTitle()}
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 4 }}>
              Please provide additional information to complete your profile
            </Typography>

            {renderRoleSpecificFields()}
          </Box>
        </Box>
      )}
    </Box>
  );
}
