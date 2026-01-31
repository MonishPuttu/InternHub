"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlacementTrainingUI } from "@/modules/training/PlacementTrainingUIContext";
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
  LinearProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add,
  Leaderboard,
  Visibility,
  MoreVert,
  Delete,
  Edit,
  Lightbulb,
  NoteAdd,
} from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function PlacementTraining() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tab: contextTab, setTab: setContextTab } = usePlacementTrainingUI();

  const [assessments, setAssessments] = useState({
    recentlyCreated: [],
    ongoing: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [createAssessmentDialogOpen, setCreateAssessmentDialogOpen] =
    useState(false);
  const menuRef = useRef(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    assessment: null,
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

  // sync URL ?tab= value into context on mount / when search params change
  useEffect(() => {
    const param = searchParams?.get("tab");
    if (param && ["recent", "ongoing", "completed"].includes(param)) {
      setContextTab(param);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // derive numeric tab value for Tabs/TabPanel from context string
  const tabValue = contextTab === "recent" ? 0 : contextTab === "ongoing" ? 1 : 2;

  const fetchAssessments = async () => {
    try {
      const response = await apiRequest("/api/training/assessments");

      if (response.ok && response.data) {
        let allAssessments = [];

        if (Array.isArray(response.data)) {
          allAssessments = response.data;
        } else {
          const combinedAssessments = [
            ...(response.data.recentlyCreated || []),
            ...(response.data.ongoing || []),
            ...(response.data.completed || []),
            ...(response.data.upcoming || []),
          ];

          const seenIds = new Set();
          allAssessments = combinedAssessments.filter((assessment) => {
            if (seenIds.has(assessment.id)) {
              return false;
            }
            seenIds.add(assessment.id);
            return true;
          });
        }

        const recentlyCreatedAssessments = allAssessments.filter((a) =>
          response.data.recentlyCreated?.some((rc) => rc.id === a.id)
        );
        const ongoingAssessments = allAssessments.filter((a) =>
          response.data.ongoing?.some((og) => og.id === a.id)
        );
        const completedAssessments = allAssessments.filter((a) =>
          response.data.completed?.some((cm) => cm.id === a.id)
        );

        setAssessments({
          recentlyCreated: recentlyCreatedAssessments,
          ongoing: ongoingAssessments,
          completed: completedAssessments,
        });
        setError("");
      } else {
        setError(response.error || "Failed to load assessments");
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setError("Error loading assessments");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity = "success") => {
    setAlert({ show: true, message, severity });
    setTimeout(() => {
      setAlert({ show: false, message: "", severity: "success" });
    }, 3000);
  };

  const handleMenuToggle = (e, assessmentId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === assessmentId ? null : assessmentId);
  };

  const handleDeleteClick = (assessment) => {
    setDeleteDialog({ open: true, assessment });
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.assessment) return;

    setDeleting(true);
    try {
      await apiRequest(
        `/api/training/assessments/${deleteDialog.assessment.id}`,
        { method: "DELETE" }
      );

      setAssessments((prev) => ({
        recentlyCreated: prev.recentlyCreated.filter(
          (a) => a.id !== deleteDialog.assessment.id
        ),
        ongoing: prev.ongoing.filter(
          (a) => a.id !== deleteDialog.assessment.id
        ),
        completed: prev.completed.filter(
          (a) => a.id !== deleteDialog.assessment.id
        ),
      }));

      showAlert("Assessment deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting assessment:", error);
      showAlert("Failed to delete assessment", "error");
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, assessment: null });
    }
  };

  const AssessmentCard = ({ assessment }) => (
    <Card
      sx={{
        bgcolor: "background.paper",
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
          gap={2}
        >
          <Box flex={1} minWidth={0}>
            <Typography
              variant="h6"
              sx={{
                color: "text.primary",
                fontWeight: "bold",
                wordBreak: "break-word",
              }}
            >
              {assessment.title}
            </Typography>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ flexShrink: 0, position: "relative" }}
          >
            <Chip
              label={`${assessment.type?.toUpperCase()}`}
              size="small"
              sx={{
                bgcolor: "#8b5cf620",
                color: "#8b5cf6",
              }}
            />

            <Box sx={{ position: "relative" }}>
              <IconButton
                size="small"
                onClick={(e) => handleMenuToggle(e, assessment.id)}
                sx={{
                  color: "text.secondary",
                  padding: "8px",
                  "&:hover": {
                    color: "text.primary",
                    bgcolor: "#334155",
                  },
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>

              {openMenuId === assessment.id && (
                <Box
                  ref={menuRef}
                  sx={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    bgcolor: "background.paper",
                    border: "1px solid #334155",
                    borderRadius: 1,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    zIndex: 1000,
                    minWidth: "180px",
                    mt: 0.5,
                  }}
                >
                  <Button
                    fullWidth
                    onClick={() => {
                      // Add edit functionality later
                      setOpenMenuId(null);
                    }}
                    sx={{
                      color: "#8b5cf6",
                      textTransform: "none",
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1,
                      borderRadius: 0,
                      "&:hover": { bgcolor: "#334155" },
                      display: "flex",
                      gap: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    <Edit fontSize="small" />
                    Edit
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => handleDeleteClick(assessment)}
                    sx={{
                      color: "#ef4444",
                      textTransform: "none",
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1,
                      borderRadius: 0,
                      borderTop: "1px solid #334155",
                      "&:hover": { bgcolor: "#334155" },
                      display: "flex",
                      gap: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    <Delete fontSize="small" />
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 2,
            wordBreak: "break-word",
          }}
        >
          {assessment.description || "No description provided"}
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" mt="auto">
          <Button
            size="small"
            variant="outlined"
            startIcon={<Leaderboard />}
            onClick={() =>
              router.push(`/training/placement/leaderboard/${assessment.id}`)
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
                color: "text.primary",
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
                color: "text.primary",
              },
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

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
        <Typography
          variant="h4"
          sx={{ color: "text.primary", fontWeight: "bold" }}
        >
          Training & Assessments
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateAssessmentDialogOpen(true)}
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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

      <Tabs
        value={contextTab === "recent" ? 0 : contextTab === "ongoing" ? 1 : 2}
        onChange={(e, newValue) => {
          const mapping = ["recent", "ongoing", "completed"]; 
          const t = mapping[newValue] || "recent";
          setContextTab(t);
          // also update URL
          try {
            const base = router.pathname || "/training/placement";
            router.push(`${base}?tab=${t}`);
          } catch (e) {}
        }}
        sx={{
          bgcolor: "transparent",
          borderBottom: "1px solid #334155",
          mb: 3,
          "& .MuiTab-root": {
            color: "text.secondary",
            textTransform: "none",
            fontSize: "1rem",
            "&.Mui-selected": {
              color: "#8b5cf6",
            },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#8b5cf6",
          },
        }}
      >
        <Tab
          label={`Recently Created (${assessments.recentlyCreated.length})`}
          id="tab-0"
          aria-controls="tabpanel-0"
        />
        <Tab
          label={`Ongoing (${assessments.ongoing.length})`}
          id="tab-1"
          aria-controls="tabpanel-1"
        />
        <Tab
          label={`Completed (${assessments.completed.length})`}
          id="tab-2"
          aria-controls="tabpanel-2"
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {assessments.recentlyCreated.length === 0 ? (
            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid #334155",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" sx={{ color: "text.secondary" }}>
                No recently created assessments
              </Typography>
            </Card>
          ) : (
            assessments.recentlyCreated.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {assessments.ongoing.length === 0 ? (
            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid #334155",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" sx={{ color: "text.secondary" }}>
                No ongoing assessments
              </Typography>
            </Card>
          ) : (
            assessments.ongoing.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {assessments.completed.length === 0 ? (
            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid #334155",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" sx={{ color: "text.secondary" }}>
                No completed assessments
              </Typography>
            </Card>
          ) : (
            assessments.completed.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))
          )}
        </Box>
      </TabPanel>

      {/* Create Assessment Dialog */}
      <Dialog
        open={createAssessmentDialogOpen}
        onClose={() => setCreateAssessmentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: "text.primary", fontWeight: "bold" }}>
          Create Assessment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 3,
              textAlign: "center",
            }}
          >
            Choose how you want to create your assessment
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Premade Assessments Option */}
            <Card
              onClick={() => {
                setCreateAssessmentDialogOpen(false);
                router.push("/training/placement/premade-assessments");
              }}
              sx={{
                bgcolor: "background.default",
                border: "1px solid #334155",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.3s",
                p: 3,
                "&:hover": {
                  borderColor: "#8b5cf6",
                  boxShadow: "0 0 12px rgba(139, 92, 246, 0.2)",
                },
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Lightbulb
                  sx={{
                    color: "#f59e0b",
                    fontSize: 32,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "text.primary",
                      fontWeight: "bold",
                      mb: 0.5,
                    }}
                  >
                    Use Premade Assessment
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Choose from pre-built assessments based on specific topics
                    and skills
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Custom Assessment Option */}
            <Card
              onClick={() => {
                setCreateAssessmentDialogOpen(false);
                router.push("/training/placement/create-assessment");
              }}
              sx={{
                bgcolor: "background.default",
                border: "1px solid #334155",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.3s",
                p: 3,
                "&:hover": {
                  borderColor: "#10b981",
                  boxShadow: "0 0 12px rgba(16, 185, 129, 0.2)",
                },
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <NoteAdd
                  sx={{
                    color: "#10b981",
                    fontSize: 32,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "text.primary",
                      fontWeight: "bold",
                      mb: 0.5,
                    }}
                  >
                    Create Custom Assessment
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Build your own assessment from scratch with custom questions
                    and settings
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, assessment: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: "text.primary", fontWeight: "bold" }}>
          Delete Assessment
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: "text.primary", mb: 2 }}>
            Are you sure you want to delete{" "}
            <strong>"{deleteDialog.assessment?.title}"</strong>?
          </Typography>
          <Alert
            severity="error"
            sx={{ bgcolor: "#ef444420", color: "#ef4444" }}
          >
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, assessment: null })}
            disabled={deleting}
            sx={{ color: "text.secondary" }}
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
