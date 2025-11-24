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
  branchOptions,
  collegeOptions,
  semesterOptions,
} from "@/components/auth/authcomp";
import { signupSchema, studentProfileSchema } from "@/lib/validationUtils";

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
  const [profileData, setProfileData] = useState({
    career_path: "placement",
    entry_type: "regular",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Role:", role);
    console.log("FormData:", formData);
    console.log("ProfileData:", profileData);

    // Zod validation
    const authValidation = signupSchema.safeParse({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: role,
    });

    if (!authValidation.success) {
      // Fixed: Properly access Zod errors
      const firstError = authValidation.error.issues[0];
      console.error("Validation errors:", authValidation.error.issues);
      setError(firstError.message);
      return;
    }

    // Validate profile data for students
    if (role === "student") {
      const profileValidation = studentProfileSchema.safeParse(profileData);

      if (!profileValidation.success) {
        // Fixed: Properly access Zod errors
        const firstError = profileValidation.error.issues[0];
        console.error(
          "Profile validation errors:",
          profileValidation.error.issues
        );
        setError(`${firstError.path.join(".")}: ${firstError.message}`);
        return;
      }
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
      localStorage.setItem("sessionExpires", data.expiresAt);

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
      {/* Career Path Selection */}
      <StyledSelect
        label="Are you opting for Placements or Higher Education?"
        value={profileData.career_path || "placement"}
        onChange={(e) => updateProfileData("career_path", e.target.value)}
        options={[
          { value: "placement", label: "Opting for Placements" },
          { value: "higher_education", label: "Choosing Higher Education" },
          { value: "entrepreneurship", label: "Pursuing Entrepreneurship" },
        ]}
        required
      />

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
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            updateProfileData("roll_number", value);
          }}
          inputProps={{ maxLength: 15 }}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledTextField
          label="Student ID"
          value={profileData.student_id || ""}
          onChange={(e) => updateProfileData("student_id", e.target.value)}
          inputProps={{ maxLength: 20 }}
        />
        <StyledTextField
          label="Contact Number"
          value={profileData.contact_number || ""}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            updateProfileData("contact_number", value);
          }}
          inputProps={{ maxLength: 10, inputMode: "numeric" }}
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
          inputProps={{ max: new Date().toISOString().split("T")[0] }}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledSelect
          label="College Name"
          value={profileData.college_name || ""}
          onChange={(e) => updateProfileData("college_name", e.target.value)}
          options={collegeOptions}
        />
        <StyledSelect
          label="Branch/Department"
          value={profileData.branch || ""}
          onChange={(e) => updateProfileData("branch", e.target.value)}
          options={branchOptions}
          required
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StyledSelect
          label="Current Semester"
          value={profileData.current_semester || ""}
          onChange={(e) =>
            updateProfileData("current_semester", e.target.value)
          }
          options={semesterOptions}
        />
        <StyledTextField
          label="CGPA"
          value={profileData.cgpa || ""}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d.]/g, "");
            updateProfileData("cgpa", value);
          }}
          inputProps={{ maxLength: 4, inputMode: "decimal" }}
        />
      </Stack>

      {/* 10th Score, Entry Type, 12th/Diploma Score - FIXED ROW */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Box sx={{ flex: { xs: 1, sm: 1 } }}>
          <StyledSelect
            label="Entry Type"
            value={profileData.entry_type || "regular"}
            onChange={(e) => updateProfileData("entry_type", e.target.value)}
            options={[
              { value: "regular", label: "Regular (10+2)" },
              { value: "lateral", label: "Lateral (Diploma)" },
            ]}
          />
        </Box>

        <Box sx={{ flex: { xs: 1, sm: 0.8 } }}>
          <StyledTextField
            label="10th Score"
            value={profileData.tenth_score || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.]/g, "");
              updateProfileData("tenth_score", value);
            }}
            placeholder="%"
            inputProps={{ maxLength: 5, inputMode: "decimal" }}
          />
        </Box>

        <Box sx={{ flex: { xs: 1, sm: 0.8 } }}>
          <StyledTextField
            label={
              profileData.entry_type === "lateral"
                ? "Diploma Score"
                : "12th Score"
            }
            value={
              profileData.entry_type === "lateral"
                ? profileData.diploma_score || ""
                : profileData.twelfth_score || ""
            }
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.]/g, "");
              if (profileData.entry_type === "lateral") {
                updateProfileData("diploma_score", value);
              } else {
                updateProfileData("twelfth_score", value);
              }
            }}
            placeholder="%"
            inputProps={{ maxLength: 5, inputMode: "decimal" }}
          />
        </Box>
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
        inputProps={{ maxLength: 150 }}
        helperText={`${profileData.skills?.length || 0}/150 characters`}
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
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            updateProfileData("contact_number", value);
          }}
          inputProps={{ maxLength: 10 }}
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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Left Side - Basic Auth Fields */}
      <Box
        sx={{
          width: { xs: "100%", md: role ? "40%" : "100%" },
          bgcolor: "background.default",
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
            sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}
          >
            Sign Up
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
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
                  sx={{ color: "text.secondary", mb: 1, fontSize: "0.875rem" }}
                >
                  I am a...
                </Typography>
                <StyledSelect
                  label="Select Role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setProfileData({
                      career_path: "placement",
                      entry_type: "regular",
                    });
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
                        sx={{ color: "text.secondary" }}
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
                        sx={{ color: "text.secondary" }}
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
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
            bgcolor: "background.paper",
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
              sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}
            >
              {getRoleTitle()}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
              Please provide additional information to complete your profile
            </Typography>

            {renderRoleSpecificFields()}
          </Box>
        </Box>
      )}
    </Box>
  );
}
