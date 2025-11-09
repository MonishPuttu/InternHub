"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { ArrowBack, Code } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@mui/material/styles";

const SUBJECTS = [
  { id: "python", name: "Python Programming", icon: "🐍" },
  { id: "javascript", name: "JavaScript", icon: "📜" },
  { id: "databases", name: "Databases", icon: "🗄️" },
  { id: "general-programming", name: "General Programming", icon: "💻" },
];

const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];

export default function PremadeAssessments() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state - empty initially
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);

  const handleOpenDialog = (subject) => {
    setSelectedSubject(subject);
    setDialogOpen(true);

    // Reset to empty values
    setStartDate("");
    setEndDate("");
    setSelectedBranches([]);
    setError("");
  };

  const handleCreateAssessment = async () => {
    if (!selectedSubject) return;

    if (!startDate || !endDate) {
      setError("Please select start and end dates");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("End date must be after start date");
      return;
    }

    if (selectedBranches.length === 0) {
      setError("Please select at least one branch");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiRequest(
        "/api/training/premade-assessments/create-template",
        {
          method: "POST",
          body: JSON.stringify({
            subject: selectedSubject.id,
            difficulty: selectedDifficulty,
            numQuestions: 10,
            startDate,
            endDate,
            allowedBranches: selectedBranches,
          }),
        }
      );

      if (response.ok && response.data?.assessmentId) {
        router.push(`/training/placement/view/${response.data.assessmentId}`);
      } else {
        setError(response.error || "Failed to create assessment");
      }
    } catch (err) {
      console.error("Error creating premade assessment:", err);
      setError("Error creating assessment. Please try again.");
    } finally {
      setLoading(false);
      setDialogOpen(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/training/placement")}
        sx={{ mb: 3, color: "#8b5cf6", textTransform: "none" }}
      >
        Back to Assessments
      </Button>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Code sx={{ color: "#8b5cf6", fontSize: 32 }} />
          <Box>
            <Typography
              variant="h4"
              sx={{ color: "text.primary", fontWeight: "bold" }}
            >
              Create Premade Assessment
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              Select a programming topic to create an assessment
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && !dialogOpen && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Difficulty Selection */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 2,
            fontWeight: "600",
            textTransform: "uppercase",
            fontSize: "0.75rem",
          }}
        >
          Select Difficulty Level
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          {["easy", "medium", "hard"].map((level) => (
            <Chip
              key={level}
              label={level.charAt(0).toUpperCase() + level.slice(1)}
              onClick={() => setSelectedDifficulty(level)}
              sx={{
                bgcolor: selectedDifficulty === level ? "#8b5cf6" : "#334155",
                color: selectedDifficulty === level ? "#fff" : "#94a3b8",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: selectedDifficulty === level ? "#7c3aed" : "#494f5c",
                },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Subject Selection */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 3,
        }}
      >
        {SUBJECTS.map((subject) => (
          <Card
            key={subject.id}
            sx={{
              bgcolor: "background.paper",
              border: "1px solid #334155",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": {
                borderColor: "#8b5cf6",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h3">{subject.icon}</Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "text.primary", fontWeight: "bold" }}
                >
                  {subject.name}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 3 }}
              >
                10 Questions •{" "}
                {selectedDifficulty.charAt(0).toUpperCase() +
                  selectedDifficulty.slice(1)}{" "}
                Difficulty
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleOpenDialog(subject)}
                sx={{
                  bgcolor: "#8b5cf6",
                  color: "#fff",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#7c3aed" },
                }}
              >
                Create Assessment
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Schedule Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
        <DialogTitle sx={{ color: "text.primary", fontWeight: "bold", pb: 2 }}>
          Schedule Assessment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Start Date */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 1,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                }}
              >
                Start Date & Time
              </Typography>
              <TextField
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                placeholder="Select start date and time"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputBase-input": {
                    color: "text.primary",
                    "&::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)",
                      cursor: "pointer",
                    },
                  },
                }}
              />
            </Box>

            {/* End Date */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 1,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                }}
              >
                End Date & Time
              </Typography>
              <TextField
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                placeholder="Select end date and time"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputBase-input": {
                    color: "text.primary",
                    "&::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)",
                      cursor: "pointer",
                    },
                  },
                }}
              />
            </Box>

            {/* Branches */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 1,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                }}
              >
                Select Branches
              </Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={selectedBranches}
                  onChange={(e) => setSelectedBranches(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <em style={{ color: "text.secondary" }}>Select branches</em>
                      );
                    }
                    return selected.join(", ");
                  }}
                  sx={{
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#334155",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8b5cf6",
                    },
                    "& .MuiSvgIcon-root": { color: "text.primary" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "background.paper",
                        border: "1px solid #334155",
                        "& .MuiMenuItem-root": {
                          color: "text.primary",
                          "&:hover": { bgcolor: "#334155" },
                          "&.Mui-selected": {
                            bgcolor: "#8b5cf620",
                            "&:hover": { bgcolor: "#8b5cf630" },
                          },
                        },
                      },
                    },
                  }}
                >
                  {BRANCHES.map((branch) => (
                    <MenuItem key={branch} value={branch}>
                      {branch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              "&:hover": { bgcolor: "#334155" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateAssessment}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#8b5cf6",
              color: "#fff",
              textTransform: "none",
              px: 3,
              "&:hover": { bgcolor: "#7c3aed" },
              "&:disabled": { bgcolor: "text.secondary" },
            }}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
