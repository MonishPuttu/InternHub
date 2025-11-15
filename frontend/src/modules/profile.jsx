"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Avatar,
  IconButton,
  LinearProgress,
  Chip,
  TextField,
  Pagination,
} from "@mui/material";
import {
  Edit,
  Language,
  LinkedIn,
  GitHub,
  CheckCircle,
  Warning,
  Add,
  Work,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ExperienceCard from "@/components/profile/ExperienceCard";
import EducationCard from "@/components/profile/EducationCard";
import { useTheme } from "@mui/material/styles";
import EditEducationDialog from "@/components/profile/EditEducationDialog";
import OfferLettersSection from "@/components/profile/OfferLettersSection";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const ITEMS_PER_PAGE = 3;

export default function ProfilePage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({
    profile: null,
    socialLinks: null,
    recentExperience: [],
    completeness: { percentage: 0 },
  });
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [experiencePage, setExperiencePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);
  const [formData, setFormData] = useState({});
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === "education") fetchEducation();
    if (activeTab === "experience") fetchExperience();
    if (activeTab === "personal") fetchPersonal();
  }, [activeTab]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/profile/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
      if (response.data.profile?.role) {
        setUserRole(response.data.profile.role);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonal = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/profile/personal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(response.data.profile || {});
    } catch (error) {
      console.error("Error fetching personal info:", error);
    }
  };

  const fetchEducation = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/profile/education`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEducation(response.data.education || []);
    } catch (error) {
      console.error("Error fetching education:", error);
    }
  };

  const fetchExperience = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/profile/experience`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExperience(response.data.experience || []);
    } catch (error) {
      console.error("Error fetching experience:", error);
    }
  };

  const handleSavePersonal = async () => {
    try {
      const token = getToken();
      await axios.put(`${BACKEND_URL}/api/profile/personal`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Personal information updated successfully!");
      fetchOverview();
    } catch (error) {
      console.error("Error updating personal info:", error);
      alert("Failed to update personal information");
    }
  };

  const handleSaveEducation = async (educationData) => {
    try {
      const token = getToken();
      if (educationData.id) {
        await axios.put(
          `${BACKEND_URL}/api/profile/education/${educationData.id}`,
          educationData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${BACKEND_URL}/api/profile/education`,
          educationData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      setEditDialogOpen(false);
      setCurrentEducation(null);
      fetchEducation();
      fetchOverview();
    } catch (error) {
      console.error("Error saving education:", error);
      alert("Failed to save education");
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!confirm("Are you sure you want to delete this education record?"))
      return;
    try {
      const token = getToken();
      await axios.delete(`${BACKEND_URL}/api/profile/education/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEducation();
      fetchOverview();
    } catch (error) {
      console.error("Error deleting education:", error);
    }
  };

  const handleEditEducation = (edu) => {
    setCurrentEducation(edu);
    setEditDialogOpen(true);
  };

  const handleAddEducation = () => {
    setCurrentEducation(null);
    setEditDialogOpen(true);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "personal", label: "Personal" },
    { id: "education", label: "Education" },
    { id: "experience", label: "Experience" },
    { id: "offers", label: "Offer Letters" },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const paginatedExperience = experience.slice(
    (experiencePage - 1) * ITEMS_PER_PAGE,
    experiencePage * ITEMS_PER_PAGE
  );

  const totalExperiencePages = Math.ceil(experience.length / ITEMS_PER_PAGE);
  const canEditPersonalInfo =
    userRole === "placement" || userRole === "recruiter";

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "text.primary" }}>
          Loading profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ProfileHeader
        onSave={
          activeTab === "personal" && canEditPersonalInfo
            ? handleSavePersonal
            : null
        }
        showSave={activeTab === "personal" && canEditPersonalInfo}
      />

      {/* Profile Completeness Card */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          p: 3,
          mb: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              Profile Completeness
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Complete your profile to increase visibility
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h4" sx={{ color: "#8b5cf6", fontWeight: 700 }}>
              {data.completeness.percentage}%
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Complete
            </Typography>
          </Box>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={data.completeness.percentage}
          sx={{
            mt: 2,
            height: 8,
            borderRadius: 1,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
            "& .MuiLinearProgress-bar": { bgcolor: "#8b5cf6" },
          }}
        />
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
        >
          {data.completeness.personalInfo && (
            <Chip
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label="Personal Info"
              size="small"
              sx={{ bgcolor: "#10b981", color: "#fff" }}
            />
          )}
          {data.completeness.education && (
            <Chip
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label="Education"
              size="small"
              sx={{ bgcolor: "#10b981", color: "#fff" }}
            />
          )}
          {data.completeness.experience && (
            <Chip
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label="Experience"
              size="small"
              sx={{ bgcolor: "#10b981", color: "#fff" }}
            />
          )}
          {!data.completeness.projects && (
            <Chip
              icon={<Warning sx={{ fontSize: 16 }} />}
              label="Add more projects"
              size="small"
              sx={{ bgcolor: "#f59e0b", color: "#fff" }}
            />
          )}
        </Stack>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          gap: 0,
          mb: 3,
          borderBottom: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        }}
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            sx={{
              color: activeTab === tab.id ? "#8b5cf6" : "text.secondary",
              bgcolor:
                activeTab === tab.id
                  ? theme.palette.mode === "dark"
                    ? "#1e293b"
                    : "rgba(139, 92, 246, 0.05)"
                  : "transparent",
              borderRadius: 0,
              borderBottom: activeTab === tab.id ? "2px solid #8b5cf6" : "none",
              py: 1.5,
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(139, 92, 246, 0.1)"
                    : "rgba(139, 92, 246, 0.05)",
                color: "#8b5cf6",
              },
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
            gap: 3,
          }}
        >
          {/* Profile Card */}
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor:
                theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
              p: 3,
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "#8b5cf6",
                    fontSize: "2rem",
                    fontWeight: 600,
                  }}
                >
                  {getInitials(data.profile?.full_name)}
                </Avatar>
              </Box>

              <Box sx={{ textAlign: "center", width: "100%" }}>
                <Typography
                  variant="h5"
                  sx={{ color: "text.primary", fontWeight: 600 }}
                >
                  {data.profile?.full_name || "User Name"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.5 }}
                >
                  {data.profile?.branch || "Software Engineering Student"}
                </Typography>
              </Box>

              <Stack spacing={1.5} sx={{ width: "100%", mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    sx={{ color: "text.secondary", fontSize: "1.1rem" }}
                  >
                    📧
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {data.profile?.email}
                  </Typography>
                </Box>
                {data.profile?.contact_number && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      sx={{ color: "text.secondary", fontSize: "1.1rem" }}
                    >
                      📱
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {data.profile?.contact_number}
                    </Typography>
                  </Box>
                )}
                {data.profile?.college_name && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      sx={{ color: "text.secondary", fontSize: "1.1rem" }}
                    >
                      📍
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {data.profile?.college_name}
                    </Typography>
                  </Box>
                )}
              </Stack>

              {(data.socialLinks?.portfolio_website ||
                data.socialLinks?.linkedin_profile ||
                data.socialLinks?.github_profile) && (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {data.socialLinks?.portfolio_website && (
                    <IconButton
                      sx={{ color: "#8b5cf6" }}
                      href={data.socialLinks.portfolio_website}
                      target="_blank"
                    >
                      <Language />
                    </IconButton>
                  )}
                  {data.socialLinks?.linkedin_profile && (
                    <IconButton
                      sx={{ color: "#06b6d4" }}
                      href={data.socialLinks.linkedin_profile}
                      target="_blank"
                    >
                      <LinkedIn />
                    </IconButton>
                  )}
                  {data.socialLinks?.github_profile && (
                    <IconButton
                      sx={{ color: "text.primary" }}
                      href={data.socialLinks.github_profile}
                      target="_blank"
                    >
                      <GitHub />
                    </IconButton>
                  )}
                </Stack>
              )}
            </Stack>
          </Box>

          {/* About & Experience */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                p: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "text.primary", fontWeight: 600 }}
                >
                  About
                </Typography>
                <IconButton size="small" sx={{ color: "#8b5cf6" }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Stack>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", lineHeight: 1.7 }}
              >
                {data.profile?.bio ||
                  "Passionate software engineer with experience in full-stack development. Looking for opportunities to contribute to innovative products and grow my technical expertise."}
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
              >
                Recent Experience
              </Typography>
              {data.recentExperience.length > 0 ? (
                <Stack spacing={3}>
                  {data.recentExperience.map((exp, idx) => (
                    <Stack key={idx} direction="row" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#334155"
                              : "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Work sx={{ color: "#8b5cf6", fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{ color: "text.primary", fontWeight: 600 }}
                        >
                          {exp.job_title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mb: 0.5 }}
                        >
                          {exp.company_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {formatDate(exp.start_date)} -{" "}
                          {formatDate(exp.end_date)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", textAlign: "center", py: 3 }}
                >
                  No experience added yet
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Personal Tab */}
      {activeTab === "personal" && (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            p: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}
          >
            Personal Information
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Update your personal details and contact information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            {/* Full Name */}
            {canEditPersonalInfo ? (
              <TextField
                label="Full Name"
                value={formData.full_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {formData.full_name || "N/A"}
                </Typography>
              </Box>
            )}

            {/* Email */}
            {canEditPersonalInfo ? (
              <TextField
                label="Email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {formData.email || "N/A"}
                </Typography>
              </Box>
            )}

            {/* Phone */}
            {canEditPersonalInfo ? (
              <TextField
                label="Phone Number"
                value={formData.contact_number || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {formData.contact_number || "N/A"}
                </Typography>
              </Box>
            )}

            {/* College */}
            {canEditPersonalInfo ? (
              <TextField
                label="College Name"
                value={formData.college_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, college_name: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  College Name
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {formData.college_name || "N/A"}
                </Typography>
              </Box>
            )}

            {/* Branch */}
            {canEditPersonalInfo ? (
              <TextField
                label="Branch"
                value={formData.branch || ""}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Branch
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {formData.branch || "N/A"}
                </Typography>
              </Box>
            )}

            {/* Semester */}
            {canEditPersonalInfo ? (
              <TextField
                label="Current Semester"
                type="number"
                value={formData.current_semester || ""}
                onChange={(e) =>
                  setFormData({ ...formData, current_semester: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Current Semester
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {formData.current_semester || "N/A"}
                </Typography>
              </Box>
            )}

            {/* CGPA */}
            {canEditPersonalInfo ? (
              <TextField
                label="CGPA"
                type="number"
                value={formData.cgpa || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cgpa: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  CGPA
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {formData.cgpa || "N/A"}
                </Typography>
              </Box>
            )}

            {/* 10th */}
            {canEditPersonalInfo ? (
              <TextField
                label="10th Score (%)"
                type="number"
                value={formData.tenth_score || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tenth_score: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  10th Score (%)
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {formData.tenth_score || "N/A"}
                </Typography>
              </Box>
            )}

            {/* 12th */}
            {canEditPersonalInfo ? (
              <TextField
                label="12th Score (%)"
                type="number"
                value={formData.twelfth_score || ""}
                onChange={(e) =>
                  setFormData({ ...formData, twelfth_score: e.target.value })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  12th Score (%)
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {formData.twelfth_score || "N/A"}
                </Typography>
              </Box>
            )}

            {/* LinkedIn */}
            {canEditPersonalInfo ? (
              <TextField
                label="LinkedIn Profile"
                value={formData.linkedin_profile || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin_profile: e.target.value })
                }
                fullWidth
                placeholder="https://linkedin.com/in/yourprofile"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": {
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    "&.Mui-focused": { color: "#8b5cf6" },
                  },
                }}
              />
            ) : (
              (formData.linkedin_profile && formData.linkedin_profile !== "N/A") && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    LinkedIn Profile
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {formData.linkedin_profile}
                  </Typography>
                </Box>
              )
            )}
          </Box>

          {/* Skills */}
          {canEditPersonalInfo ? (
            <TextField
              label="Skills"
              value={formData.skills || ""}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              multiline
              rows={2}
              fullWidth
              placeholder="React, Node.js, Python, Machine Learning"
              sx={{
                mt: 3,
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  bgcolor: "background.default",
                  "& fieldset": {
                    borderColor:
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#8b5cf6",
                  },
                  "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "#8b5cf6" },
                },
              }}
            />
          ) : (
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Skills
              </Typography>
              <Typography variant="body1" color="text.primary">
                {formData.skills || "N/A"}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Education Tab */}
      {activeTab === "education" && (
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              Education
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddEducation}
              sx={{
                bgcolor: "#8b5cf6",
                textTransform: "none",
                "&:hover": { bgcolor: "#7c3aed" },
              }}
            >
              Add Education
            </Button>
          </Stack>

          <Stack spacing={3}>
            {education.map((edu) => (
              <EducationCard
                key={edu.id}
                education={edu}
                onEdit={() => handleEditEducation(edu)}
                onDelete={() => handleDeleteEducation(edu.id)}
              />
            ))}

            {education.length === 0 && (
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  p: 6,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No education records added yet
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {/* Experience Tab */}
      {activeTab === "experience" && (
        <Box>
          <Typography
            variant="h6"
            sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
          >
            Work Experience
          </Typography>

          <Stack spacing={3}>
            {paginatedExperience.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}

            {experience.length === 0 && (
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  p: 6,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No work experience yet. Experience data comes from your
                  applications.
                </Typography>
              </Box>
            )}
          </Stack>

          {totalExperiencePages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalExperiencePages}
                page={experiencePage}
                onChange={(e, page) => setExperiencePage(page)}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "text.secondary",
                    borderColor:
                      theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  },
                  "& .Mui-selected": {
                    bgcolor: "#8b5cf6",
                    color: "#fff !important",
                  },
                  "& .MuiPaginationItem-root:hover": {
                    bgcolor: "rgba(139, 92, 246, 0.1)",
                  },
                }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Offer Letters Tab - NEW */}
      {activeTab === "offers" && <OfferLettersSection />}

      <EditEducationDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setCurrentEducation(null);
        }}
        education={currentEducation}
        onSave={handleSaveEducation}
      />
    </Box>
  );
}
