"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from "@mui/material";
import {
  Add,
  Leaderboard,
  Visibility,
  MoreVert,
  Delete,
} from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function PlacementTraining() {
  const router = useRouter();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    assessment: null,
  });
  const [menuAnchor, setMenuAnchor] = useState({
    element: null,
    assessmentId: null,
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await apiRequest("/api/training/assessments");
      setAssessments(response.data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setAlert({
        show: true,
        message: "Failed to load assessments",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, assessmentId) => {
    setMenuAnchor({ element: event.currentTarget, assessmentId });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ element: null, assessmentId: null });
  };

  const handleDeleteClick = (assessment) => {
    setDeleteDialog({ open: true, assessment });
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.assessment) return;

    setDeleting(true);
    try {
      await apiRequest(
        `/api/training/assessments/${deleteDialog.assessment.id}`,
        {
          method: "DELETE",
        }
      );

      setAssessments(
        assessments.filter((a) => a.id !== deleteDialog.assessment.id)
      );
      setAlert({
        show: true,
        message: "Assessment deleted successfully",
        severity: "success",
      });

      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    } catch (error) {
      console.error("Error deleting assessment:", error);
      setAlert({
        show: true,
        message: "Failed to delete assessment",
        severity: "error",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, assessment: null });
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" sx={{ color: "#e2e8f0" }}>
          Training & Assessments
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push("/training/placement/create-assessment")}
          sx={{
            bgcolor: "#8b5cf6",
            color: "#fff",
            "&:hover": { bgcolor: "#7c3aed" },
            textTransform: "none",
            fontSize: "1rem",
            flexShrink: 0,
          }}
        >
          Create Assessment
        </Button>
      </Box>

      {alert.show && (
        <Alert
          severity={alert.severity}
          sx={{ mb: 3 }}
          onClose={() =>
            setAlert({ show: false, message: "", severity: "success" })
          }
        >
          {alert.message}
        </Alert>
      )}

      {/* Cards Container - Using Box instead of Grid */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "100%",
        }}
      >
        {assessments.length === 0 ? (
          <Card
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              width: "100%",
            }}
          >
            <Typography variant="h6" sx={{ color: "#94a3b8" }}>
              No assessments created yet
            </Typography>
          </Card>
        ) : (
          assessments.map((assessment) => (
            <Card
              key={assessment.id}
              elevation={3}
              sx={{
                bgcolor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 2,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#8b5cf6",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)",
                },
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                }}
              >
                {/* Title and Controls Row */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                  gap={2}
                  sx={{ width: "100%" }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#e2e8f0",
                      flex: 1,
                      minWidth: 0,
                      wordBreak: "break-word",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {assessment.title}
                  </Typography>

                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{ flexShrink: 0 }}
                  >
                    <Chip
                      label={assessment.type.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: "#8b5cf620",
                        color: "#8b5cf6",
                      }}
                    />

                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, assessment.id)}
                      sx={{
                        color: "#94a3b8",
                        "&:hover": { color: "#e2e8f0", bgcolor: "#334155" },
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "#94a3b8",
                    mb: 2,
                    wordBreak: "break-word",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    textOverflow: "ellipsis",
                    minHeight: "2.5em",
                    width: "100%",
                  }}
                >
                  {assessment.description || "No description provided"}
                </Typography>

                {/* Action Buttons Row */}
                <Box
                  display="flex"
                  gap={2}
                  flexWrap="wrap"
                  mt="auto"
                  sx={{ width: "100%" }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Leaderboard />}
                    onClick={() =>
                      router.push(
                        `/training/placement/leaderboard/${assessment.id}`
                      )
                    }
                    sx={{
                      color: "#8b5cf6",
                      borderColor: "#8b5cf6",
                      flex: { xs: "1 1 100%", sm: "1 1 auto" },
                      minWidth: "140px",
                      textTransform: "none",
                      fontSize: "0.9rem",
                      "&:hover": {
                        bgcolor: "#8b5cf610",
                        borderColor: "#7c3aed",
                        color: "#e2e8f0",
                      },
                    }}
                  >
                    Leaderboard
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() =>
                      router.push(`/training/placement/view/${assessment.id}`)
                    }
                    sx={{
                      color: "#10b981",
                      borderColor: "#10b981",
                      flex: { xs: "1 1 100%", sm: "1 1 auto" },
                      minWidth: "140px",
                      textTransform: "none",
                      fontSize: "0.9rem",
                      "&:hover": {
                        bgcolor: "#10b98110",
                        borderColor: "#059669",
                        color: "#e2e8f0",
                      },
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor.element}
        open={Boolean(menuAnchor.element)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 1,
            "& .MuiMenuItem-root": {
              color: "#e2e8f0",
              "&:hover": {
                bgcolor: "#334155",
              },
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const assessment = assessments.find(
              (a) => a.id === menuAnchor.assessmentId
            );
            if (assessment) handleDeleteClick(assessment);
          }}
        >
          <ListItemIcon>
            <Delete sx={{ color: "#ef4444" }} />
          </ListItemIcon>
          <ListItemText>Delete Assessment</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, assessment: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: "#e2e8f0", fontWeight: "bold" }}>
          Delete Assessment
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: "#e2e8f0", mb: 2 }}>
            Are you sure you want to delete{" "}
            <strong>"{deleteDialog.assessment?.title}"</strong>?
          </Typography>
          <Alert
            severity="error"
            sx={{ bgcolor: "#ef444420", color: "#ef4444" }}
          >
            This action cannot be undone and will remove all associated data
            including student attempts, answers, and leaderboard entries.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, assessment: null })}
            disabled={deleting}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleting}
            sx={{
              bgcolor: "#ef4444",
              color: "#fff",
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
