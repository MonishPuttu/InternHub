"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Assignment,
  Schedule,
  CheckCircle,
  PlayArrow,
  CalendarToday,
  Code,
  Psychology,
  Quiz,
  ExpandMore,
  OpenInNew,
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

// ✅ Helper function to format dates without timezone conversion
const formatDateUTC = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
};

export default function StudentTraining() {
  const [assessments, setAssessments] = useState({
    new: [],
    ongoing: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await apiRequest("/api/training/student/assessments");

      if (response.ok && response.data) {
        let allAssessments = [];

        if (Array.isArray(response.data)) {
          allAssessments = response.data;
        } else {
          allAssessments = [
            ...(response.data.new || []),
            ...(response.data.ongoing || []),
            ...(response.data.completed || []),
          ];
        }

        const newAssessments = allAssessments.filter(
          (a) => !a.isAttempted && !a.hasInProgress
        );
        const ongoingAssessments = allAssessments.filter(
          (a) => a.hasInProgress
        );
        const completedAssessments = allAssessments.filter(
          (a) => a.isAttempted && !a.hasInProgress
        );

        setAssessments({
          new: newAssessments,
          ongoing: ongoingAssessments,
          completed: completedAssessments,
        });
        setError("");
      } else {
        setError(response.error || "Failed to fetch assessments");
      }
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Error loading assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (assessment) => {
    if (assessment.hasInProgress && assessment.inProgressAttemptId) {
      router.push(
        `/training/student/take-assessment/${assessment.id}?attemptId=${assessment.inProgressAttemptId}`
      );
      return;
    }

    setSelectedAssessment(assessment);
    setOpenDialog(true);
  };

  const confirmStartAssessment = async () => {
    if (!selectedAssessment) return;

    try {
      setSubmitting(true);
      setError("");

      console.log("🔍 Starting assessment:", selectedAssessment.id);

      const response = await apiRequest(
        `/api/training/student/assessments/${selectedAssessment.id}/start`,
        { method: "POST" }
      );

      console.log("✅ Start response:", response);

      if (response.ok && response.data) {
        const attemptId = response.data.attempt.id;
        const storageKey = `attempt-${attemptId}`;

        console.log("💾 Storing in sessionStorage:", storageKey);

        // ✅ Store data in sessionStorage
        sessionStorage.setItem(storageKey, JSON.stringify(response.data));

        // ✅ Verify it was stored
        const stored = sessionStorage.getItem(storageKey);
        console.log("✅ Verified stored data:", stored ? "YES" : "NO");

        // ✅ Close dialog
        setOpenDialog(false);

        // ✅ Small delay before navigation to ensure storage completes
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("🚀 Navigating to assessment...");

        // Navigate to assessment
        router.push(
          `/training/student/take-assessment/${selectedAssessment.id}?attemptId=${attemptId}`
        );
      } else {
        console.error("❌ Start failed:", response.error);
        setError(response.error || "Failed to start assessment");
        setOpenDialog(false);
      }
    } catch (err) {
      console.error("❌ Error starting assessment:", err);
      setError("Error starting assessment. Please try again.");
      setOpenDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "daily":
        return "primary";
      case "weekly":
        return "secondary";
      case "monthly":
        return "success";
      default:
        return "default";
    }
  };

  const additionalTests = [
    {
      id: "coding",
      title: "Coding Challenges",
      icon: Code,
      color: "#8b5cf6",
      links: [
        {
          name: "HackerRank",
          description:
            "Large set of coding challenges in algorithms, data structures & more. Free to use.",
          url: "https://www.hackerrank.com/",
        },
        {
          name: "Exercism",
          description:
            "Free coding practice with real problems and mentor feedback across 70+ languages.",
          url: "https://exercism.org/",
        },
      ],
    },
    {
      id: "aptitude",
      title: "Aptitude Test",
      icon: Psychology,
      color: "#06b6d4",
      links: [
        {
          name: "IndiaBIX Online Aptitude Test",
          description:
            "Free online aptitude tests with detailed questions and explanations.",
          url: "https://www.indiabix.com/online-test/aptitude-test/",
        },
        {
          name: "Aptitude-Test.com",
          description:
            "Practice numerical, logical & verbal aptitude questions for free.",
          url: "https://www.aptitude-test.com/",
        },
      ],
    },
    {
      id: "quiz",
      title: "Core Quiz",
      icon: Quiz,
      color: "#10b981",
      links: [
        {
          name: "Testbook Free Online Quizzes",
          description:
            "A large quiz bank across subjects like GK, maths, science & reasoning.",
          url: "https://testbook.com/free-online-quizzes",
        },
        {
          name: "JustTutors – Test-Your-Knowledge",
          description:
            "Free MCQ tests on many topics to check your core understanding.",
          url: "https://www.justtutors.com/test-your-knowledge",
        },
      ],
    },
  ];

  const handleCardToggle = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
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
          sx={{ width: "100%" }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: "bold",
              flex: 1,
              minWidth: 0,
              wordBreak: "break-word",
            }}
          >
            {assessment.title}
          </Typography>
          <Chip
            label={assessment.type?.toUpperCase()}
            color={getTypeColor(assessment.type)}
            size="small"
            sx={{ flexShrink: 0 }}
          />
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

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Schedule fontSize="small" sx={{ color: "#8b5cf6", flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Duration: {assessment.duration} minutes
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Assignment
            fontSize="small"
            sx={{ color: "#8b5cf6", flexShrink: 0 }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Total Marks: {assessment.totalMarks}
          </Typography>
        </Box>
        <Box mt="auto">
          {assessment.isAttempted && !assessment.hasInProgress ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle sx={{ color: "#10b981" }} />
              <Chip
                label="Completed"
                sx={{
                  bgcolor: "#10b98120",
                  color: "#10b981",
                }}
              />
            </Box>
          ) : (
            <Button
              variant="contained"
              fullWidth
              startIcon={assessment.hasInProgress ? <PlayArrow /> : null}
              onClick={() => handleStartAssessment(assessment)}
              sx={{
                bgcolor: assessment.hasInProgress ? "#06b6d4" : "#8b5cf6",
                color: "#fff",
                "&:hover": {
                  bgcolor: assessment.hasInProgress ? "#0891b2" : "#7c3aed",
                },
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              {assessment.hasInProgress
                ? "Resume Assessment"
                : "Start Assessment"}
            </Button>
          )}
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
      <Box mb={4}>
        <Typography
          variant="h4"
          sx={{ color: "text.primary", fontWeight: "bold" }}
        >
          Training & Assessments
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
          Complete assessments to improve your placement readiness
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
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
          label={`Recently Posted (${assessments.new.length})`}
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
        <Tab
          label="Additional Tests"
          id="tab-3"
          aria-controls="tabpanel-3"
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {assessments.new.length === 0 ? (
          <Typography
            sx={{ color: "text.secondary", textAlign: "center", py: 4 }}
          >
            No recently posted assessments
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {assessments.new.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {assessments.ongoing.length === 0 ? (
          <Typography
            sx={{ color: "text.secondary", textAlign: "center", py: 4 }}
          >
            No ongoing assessments
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {assessments.ongoing.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {assessments.completed.length === 0 ? (
          <Typography
            sx={{ color: "text.secondary", textAlign: "center", py: 4 }}
          >
            No completed assessments yet
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {assessments.completed.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}
        >
          Practice with external platforms to boost your skills
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {additionalTests.map((test) => {
            const IconComponent = test.icon;
            const isExpanded = expandedCard === test.id;

            return (
              <Card
                key={test.id}
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid #334155",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: test.color,
                    boxShadow: `0 0 20px ${test.color}20`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    onClick={() => handleCardToggle(test.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${test.color}20`,
                        }}
                      >
                        <IconComponent sx={{ color: test.color, fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ color: "text.primary", fontWeight: "bold" }}
                        >
                          {test.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {test.links.length} free platforms available
                        </Typography>
                      </Box>
                    </Box>
                    <ExpandMore
                      sx={{
                        color: "text.secondary",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </Box>

                  {isExpanded && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
                      {test.links.map((link, index) => (
                        <Box
                          key={index}
                          sx={{
                            mb: index < test.links.length - 1 ? 3 : 0,
                            p: 3,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: test.color,
                              boxShadow: `0 0 20px ${test.color}20`,
                            },
                          }}
                        >
                          <Box
                            display="flex"
                            alignItems="flex-start"
                            justifyContent="space-between"
                            gap={2}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: "text.primary",
                                  fontWeight: 600,
                                  mb: 1,
                                }}
                              >
                                {link.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary", mb: 2 }}
                              >
                                {link.description}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="medium"
                                endIcon={<OpenInNew />}
                                onClick={() => window.open(link.url, "_blank")}
                                sx={{
                                  color: test.color,
                                  borderColor: test.color,
                                  textTransform: "none",
                                  "&:hover": {
                                    borderColor: test.color,
                                    bgcolor: `${test.color}10`,
                                  },
                                }}
                              >
                                Visit Platform
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </TabPanel>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
          Start Assessment
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: "text.primary", mb: 2 }}>
            Are you sure you want to start{" "}
            <strong>"{selectedAssessment?.title}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Duration: {selectedAssessment?.duration} minutes
          </Typography>
          <Alert
            severity="warning"
            sx={{ bgcolor: "#f59e0b20", color: "#f59e0b" }}
          >
            Once started, the timer cannot be paused. Make sure you have enough
            time to complete the assessment.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={submitting}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmStartAssessment}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#8b5cf6",
              color: "#fff",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            {submitting ? "Starting..." : "Start Now"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}