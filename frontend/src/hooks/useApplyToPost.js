import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/constants/postConstants";

export default function useApplyToPost(postId) {
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (postId) {
      checkApplicationStatus();
    }
  }, [postId]);

  const checkApplicationStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/dashboard/student-application/check-applied/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setHasApplied(response.data.hasApplied);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleApply = async (coverLetter, resumeLink) => {
    setApplying(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/api/dashboard/student-application/apply/${postId}`,
        {
          cover_letter: coverLetter,
          resume_link: resumeLink,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setHasApplied(true);
        setApplyDialogOpen(false);
        setSnackbar({
          open: true,
          message: "Application submitted successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || "Failed to submit application",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to submit application",
        severity: "error",
      });
    } finally {
      setApplying(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return {
    applyDialogOpen,
    setApplyDialogOpen,
    hasApplied,
    applying,
    snackbar,
    checkApplicationStatus,
    handleApply,
    handleCloseSnackbar,
  };
}
