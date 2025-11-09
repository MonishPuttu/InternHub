"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ArrowBack, Assessment, Tune, Close } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";

export default function AllReportCards() {
  const router = useRouter();
  const [reportCards, setReportCards] = useState([]);
  const [filteredReportCards, setFilteredReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  useEffect(() => {
    fetchReportCards();
  }, []);

  useEffect(() => {
    filterReportCards();
  }, [selectedMonth, selectedYear, reportCards]);

  const fetchReportCards = async () => {
    try {
      const response = await apiRequest("/api/training/student/report-cards");
      setReportCards(response.data || []);
    } catch (error) {
      console.error("Error fetching report cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterReportCards = () => {
    let filtered = reportCards;

    if (selectedMonth || selectedYear) {
      filtered = reportCards.filter((report) => {
        const reportDate = new Date(report.generatedAt);
        const reportMonth = (reportDate.getMonth() + 1).toString();
        const reportYear = reportDate.getFullYear().toString();

        const monthMatch =
          !selectedMonth || reportMonth === selectedMonth.padStart(2, "0");
        const yearMatch = !selectedYear || reportYear === selectedYear;

        return monthMatch && yearMatch;
      });
    }

    setFilteredReportCards(filtered);
  };

  const handleResetFilters = () => {
    setSelectedMonth("");
    setSelectedYear("");
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  if (loading) {
    return <LinearProgress sx={{ mt: 4 }} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/training/student")}
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Assessment sx={{ color: "#8b5cf6", fontSize: 32 }} />
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "text.primary",
                  fontWeight: "bold",
                }}
              >
                All Report Cards
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", mt: 0.5 }}
              >
                View all your assessment results and performance reports
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={() => setFilterDialogOpen(true)}
            sx={{
              color: "#8b5cf6",
              bgcolor: "#8b5cf610",
              "&:hover": { bgcolor: "#8b5cf620" },
              position: "relative",
            }}
          >
            <Tune />
            {(selectedMonth || selectedYear) && (
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  bgcolor: "#10b981",
                  borderRadius: "50%",
                }}
              />
            )}
          </IconButton>
        </Box>
      </Paper>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
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
        <DialogTitle
          sx={{
            color: "text.primary",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Filter Report Cards
          <IconButton
            onClick={() => setFilterDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Month Filter */}
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
                Month
              </Typography>
              <TextField
                select
                fullWidth
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    "& fieldset": {
                      borderColor: "#334155",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#8b5cf6",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    bgcolor: "background.default",
                  },
                }}
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </TextField>
            </Box>

            {/* Year Filter */}
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
                Year
              </Typography>
              <TextField
                select
                fullWidth
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    "& fieldset": {
                      borderColor: "#334155",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8b5cf6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#8b5cf6",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    bgcolor: "background.default",
                  },
                }}
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </TextField>
            </Box>

            {/* Active Filters Display */}
            {(selectedMonth || selectedYear) && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  border: "1px solid #334155",
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Showing{" "}
                  <span style={{ color: "#8b5cf6", fontWeight: "bold" }}>
                    {filteredReportCards.length}
                  </span>{" "}
                  report card
                  {filteredReportCards.length !== 1 ? "s" : ""}{" "}
                  {selectedMonth &&
                    `for ${
                      months.find((m) => m.value === selectedMonth)?.label
                    }`}
                  {selectedMonth && selectedYear && " "}
                  {selectedYear && `in ${selectedYear}`}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleResetFilters}
            disabled={!selectedMonth && !selectedYear}
            sx={{
              color: "#8b5cf6",
              textTransform: "none",
              "&:disabled": {
                color: "text.secondary",
              },
            }}
          >
            Clear Filters
          </Button>
          <Button
            onClick={() => setFilterDialogOpen(false)}
            variant="contained"
            sx={{
              bgcolor: "#8b5cf6",
              color: "#fff",
              textTransform: "none",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Cards */}
      {filteredReportCards.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "text.secondary" }}>
            {reportCards.length === 0
              ? "No report cards available yet"
              : "No report cards found for the selected month and year"}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {filteredReportCards.map((report) => (
            <Paper
              key={report.id}
              onClick={() =>
                router.push(`/training/student/report-card/${report.attemptId}`)
              }
              elevation={3}
              sx={{
                p: 4,
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
              {/* Assessment Title */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={3}
                gap={2}
              >
                <Box flex={1} minWidth={0}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "text.primary",
                      fontWeight: "bold",
                      wordBreak: "break-word",
                      mb: 1,
                    }}
                  >
                    {report.assessmentTitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      wordBreak: "break-word",
                    }}
                  >
                    {report.assessmentType.toUpperCase()}
                  </Typography>
                </Box>
              </Box>

              {/* Score Cards - 3 Column Layout */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(3, 1fr)",
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                {/* Percentage Score */}
                <Card
                  elevation={2}
                  sx={{
                    bgcolor: "background.default",
                    border: "2px solid #8b5cf6",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Typography
                      variant="h3"
                      sx={{
                        color: "#8b5cf6",
                        fontWeight: "bold",
                        mb: 1,
                      }}
                    >
                      {report.percentageScore}%
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Percentage
                    </Typography>
                  </CardContent>
                </Card>

                {/* Total Score */}
                <Card
                  elevation={2}
                  sx={{
                    bgcolor: "background.default",
                    border: "2px solid #10b981",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Typography
                      variant="h3"
                      sx={{
                        color: "#10b981",
                        fontWeight: "bold",
                        mb: 1,
                      }}
                    >
                      {report.overallScore}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Score
                    </Typography>
                  </CardContent>
                </Card>

                {/* Grade */}
                <Card
                  elevation={2}
                  sx={{
                    bgcolor: "background.default",
                    border: "2px solid #f59e0b",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Typography
                      variant="h3"
                      sx={{
                        color: "#f59e0b",
                        fontWeight: "bold",
                        mb: 1,
                      }}
                    >
                      {report.grade}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Grade
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Generated Date */}
              <Box textAlign="left">
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Generated on:{" "}
                  <span style={{ color: "text.secondary", fontWeight: "bold" }}>
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </span>
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
}
