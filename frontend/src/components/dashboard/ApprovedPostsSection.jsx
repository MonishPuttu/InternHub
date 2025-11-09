"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import PostDetails from "@/modules/Post/postDetails";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Snackbar,
  Alert,
  TablePagination,
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const statusColors = {
  applied: "#64748b",
  interview_scheduled: "#0ea5e9",
  interviewed: "#8b5cf6",
  offer: "#10b981",
  rejected: "#ef4444",
};

const statusLabels = {
  applied: "Applied",
  interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed",
  offer: "Offer",
  rejected: "Rejected",
};

export default function ApprovedPostsSection(props) {
  const router = useRouter();
  const theme = useTheme();
  const {
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    anchorEl,
    setAnchorEl,
    selectedApp,
    setSelectedApp,
    editDialogOpen,
    setEditDialogOpen,
    editStatus,
    setEditStatus,
    editNotes,
    setEditNotes,
    successMsg,
    setSuccessMsg,
    errorMsg,
    setErrorMsg,
    filterStatus,
    setFilterStatus,
    handleMenuOpen,
    handleMenuClose,
    handleOpenEdit,
    handleSaveEdit,
    searchQuery,
    filterPostedDate,
    filterIndustry,
  } = props;
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postApplications, setPostApplications] = useState([]);
  const [postAppLoading, setPostAppLoading] = useState(false);
  const [viewApplicationsDialogOpen, setViewApplicationsDialogOpen] =
    useState(false);
  const [viewPostDialogOpen, setViewPostDialogOpen] = useState(false);
  const [sendListDialogOpen, setSendListDialogOpen] = useState(false);
  const [sentLists, setSentLists] = useState(new Set()); // Track sent posts

  // Stats state
  const [overallStats, setOverallStats] = useState({
    totalPosts: 0,
    totalAppliedStudents: 0,
    totalApplications: 0,
    applied: 0,
    interviewed: 0,
    offers: 0,
  });

  // Filter states
  const [filterStudentName, setFilterStudentName] = useState("");
  const [filterRollNumber, setFilterRollNumber] = useState("");
  const [filterBranch, setFilterBranch] = useState("");

  useEffect(() => {
    fetchApprovedPosts();
    fetchGlobalStats();
    fetchSentLists();
  }, []);

  const fetchSentLists = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/sent-lists`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        const sentPostIds = response.data.lists.map(
          (list) => list.sent_list.post_id
        );
        setSentLists(new Set(sentPostIds));
      }
    } catch (error) {
      console.error("Error fetching sent lists:", error);
    }
  };

  // Calculate stats from all applications
  const calculateStats = (applications) => {
    console.log("Calculating stats from applications:", applications);
    const totalApplications = applications.length;
    const applied = applications.filter(
      (app) => app.application_status === "applied"
    ).length;
    const interviewed = applications.filter(
      (app) => app.application_status === "interviewed"
    ).length;
    const offers = applications.filter(
      (app) => app.application_status === "offer"
    ).length;

    console.log("Stats calculated:", {
      totalApplications,
      applied,
      interviewed,
      offers,
    });

    setOverallStats({
      totalApplications,
      applied,
      interviewed,
      offers,
    });
  };

  const fetchApprovedPosts = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/approved-posts?limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setApprovedPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Error fetching approved posts:", error);
      setErrorMsg("Failed to load approved posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/global-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        const {
          totalPosts,
          totalAppliedStudents,
          totalApplications,
          totalApplied,
          totalInterviewed,
          totalOffers,
        } = response.data.stats;
        setOverallStats({
          totalPosts,
          totalAppliedStudents,
          totalApplications: totalPosts, // Use total approved posts for Total Applications stat
          applied: totalApplied,
          interviewed: totalInterviewed,
          offers: totalOffers,
        });
      }
    } catch (error) {
      console.error("Error fetching global stats:", error);
      setErrorMsg("Failed to load global stats");
    }
  };

  const handleViewPostDetails = (post) => {
    router.push(`/post/postdetails/${post.id}`);
  };

  const handleViewApplications = async (post) => {
    setSelectedPost(post);
    setPostAppLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/post/${post.id}/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        console.log("Fetched applications:", response.data.applications);
        setPostApplications(response.data.applications);
        setViewApplicationsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching post applications:", error);
      setErrorMsg("Failed to load applications for this post");
    } finally {
      setPostAppLoading(false);
    }
  };

  const handleSendListClick = (post) => {
    setSelectedPost(post);
    setSendListDialogOpen(true);
  };

  const handleSendListConfirm = async () => {
    setSendListDialogOpen(false);
    try {
      const token = getToken();
      const response = await axios.post(
        `${BACKEND_URL}/api/student-applications/send-list/${selectedPost.id}`,
        {
          recruiterId: selectedPost.user_id, // Send the recruiter ID who owns the post
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setSuccessMsg("Application list sent to recruiter successfully");
        // Mark this post as sent
        setSentLists((prev) => new Set([...prev, selectedPost.id]));
      } else {
        setErrorMsg(response.data.error || "Failed to send application list");
      }
    } catch (error) {
      console.error("Error sending list:", error);
      if (error.response?.data?.error) {
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg("Failed to send application list");
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/post/${selectedPost.id}/applications?download=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Important for file download
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedPost.company_name}_${selectedPost.position}_applications.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setErrorMsg("Failed to download CSV");
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target.result;
      const lines = csvText.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());

      // Expected headers
      const expectedHeaders = [
        "Student Name",
        "Roll Number",
        "Branch",
        "Semester",
        "CGPA",
        "10th",
        "12th",
        "Company",
        "Position",
        "Status",
        "Applied Date",
      ];

      // Check if headers match
      const headersMatch = expectedHeaders.every((header) =>
        headers.includes(header)
      );

      if (!headersMatch) {
        setErrorMsg(
          "CSV headers don't match expected format. Please check the file."
        );
        return;
      }

      // Helper function to safely parse dates
      const parseDate = (dateString) => {
        if (!dateString || dateString.trim() === "") {
          return new Date().toISOString();
        }
        const date = new Date(dateString.trim());
        // Check if date is valid
        if (isNaN(date.getTime())) {
          // Try different date formats
          const formats = [
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
          ];

          for (const format of formats) {
            const match = dateString.trim().match(format);
            if (match) {
              let year, month, day;
              if (format === formats[0]) {
                // MM/DD/YYYY
                month = match[1];
                day = match[2];
                year = match[3];
              } else if (format === formats[1]) {
                // YYYY-MM-DD
                year = match[1];
                month = match[2];
                day = match[3];
              } else {
                // DD-MM-YYYY
                day = match[1];
                month = match[2];
                year = match[3];
              }

              const parsedDate = new Date(
                `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
              );
              if (!isNaN(parsedDate.getTime())) {
                return parsedDate.toISOString();
              }
            }
          }
          // If no format matches, use current date
          return new Date().toISOString();
        }
        return date.toISOString();
      };

      // Parse CSV data
      const applications = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length !== expectedHeaders.length) continue;

        const application = {
          full_name: values[0],
          roll_number: values[1],
          branch: values[2],
          current_semester: parseInt(values[3]) || 1,
          cgpa: parseFloat(values[4]) || 0,
          tenth_score: parseFloat(values[5]) || 0,
          twelfth_score: parseFloat(values[6]) || 0,
          company_name: values[7],
          position: values[8],
          application_status: values[9] || "applied",
          applied_at: parseDate(values[10]),
          post_id: selectedPost.id,
        };
        applications.push(application);
      }

      if (applications.length === 0) {
        setErrorMsg("No valid applications found in CSV.");
        return;
      }

      try {
        const token = getToken();
        const response = await axios.post(
          `${BACKEND_URL}/api/student-applications/bulk-import`,
          {
            applications,
            postId: selectedPost.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.ok) {
          setSuccessMsg(
            `Successfully imported ${response.data.imported} applications`
          );
          // Refresh the applications list
          handleViewApplications(selectedPost);
        } else {
          setErrorMsg("Failed to import applications");
        }
      } catch (error) {
        console.error("Error importing CSV:", error);
        setErrorMsg("Failed to import CSV data");
      }
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = null;
  };

  const filteredApplications = postApplications.filter((app) => {
    const matchesStudentName =
      !filterStudentName ||
      (app?.full_name || "")
        .toLowerCase()
        .includes(filterStudentName.toLowerCase());
    const matchesRollNumber =
      !filterRollNumber ||
      (app?.roll_number || "")
        .toLowerCase()
        .includes(filterRollNumber.toLowerCase());
    const matchesBranch =
      !filterBranch ||
      (app?.branch || "").toLowerCase().includes(filterBranch.toLowerCase());
    // const matchesSemester = !filterSemester || (app?.current_semester || "").toString().includes(filterSemester);
    // const matchesCgpa = (!filterCgpaMin || app?.cgpa >= parseFloat(filterCgpaMin)) && (!filterCgpaMax || app?.cgpa <= parseFloat(filterCgpaMax));
    // const matchesTenth = (!filterTenthMin || app?.tenth_score >= parseFloat(filterTenthMin)) && (!filterTenthMax || app?.tenth_score <= parseFloat(filterTenthMax));
    // const matchesTwelfth = (!filterTwelfthMin || app?.twelfth_score >= parseFloat(filterTwelfthMin)) && (!filterTwelfthMax || app?.twelfth_score <= parseFloat(filterTwelfthMax));
    // const matchesAppliedDate = !filterAppliedDate || new Date(app?.applied_at).toDateString() === new Date(filterAppliedDate).toDateString();
    const matchesStatus =
      filterStatus === "all" || app?.application_status === filterStatus;

    return (
      matchesStudentName && matchesRollNumber && matchesBranch && matchesStatus
    );
  });

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "text.primary" }}>
          Loading approved posts...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Stats Cards */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 2, md: 3 },
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
            flex: { xs: "1 1 100%", sm: "1 1 calc(25% - 16px)", md: 1 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: { xs: 100, sm: 120 },
            minWidth: { xs: "100%", sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              textAlign: "center",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Applications
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "#8b5cf6",
              fontWeight: 700,
              textAlign: "center",
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            {overallStats.totalApplications}
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
            flex: {
              xs: "1 1 calc(50% - 8px)",
              sm: "1 1 calc(25% - 16px)",
              md: 1,
            },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: { xs: 100, sm: 120 },
            minWidth: { xs: "calc(50% - 8px)", sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              textAlign: "center",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Applied
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "#0ea5e9",
              fontWeight: 700,
              textAlign: "center",
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            {overallStats.applied}
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
            flex: {
              xs: "1 1 calc(50% - 8px)",
              sm: "1 1 calc(25% - 16px)",
              md: 1,
            },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: { xs: 100, sm: 120 },
            minWidth: { xs: "calc(50% - 8px)", sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              textAlign: "center",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Interviewed
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "#8b5cf6",
              fontWeight: 700,
              textAlign: "center",
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            {overallStats.interviewed}
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            border: "1px solid #334155",
            borderRadius: 2,
            flex: { xs: "1 1 100%", sm: "1 1 calc(25% - 16px)", md: 1 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: { xs: 100, sm: 120 },
            minWidth: { xs: "100%", sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              textAlign: "center",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Offers
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "#10b981",
              fontWeight: 700,
              textAlign: "center",
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            {overallStats.offers}
          </Typography>
        </Paper>
      </Box>

      {/* Approved Posts Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
        >
          Approved Job Posts
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(auto-fill, minmax(280px, 1fr))",
              sm: "repeat(auto-fill, minmax(300px, 1fr))",
            },
            gap: { xs: 2, sm: 3 },
          }}
        >
          {approvedPosts
            .filter((post) => {
              const matchesSearch =
                !searchQuery ||
                post.company_name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                post.position.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesPostedDate =
                !filterPostedDate ||
                new Date(post.application_date).toDateString() ===
                  new Date(filterPostedDate).toDateString();
              const matchesIndustry =
                !filterIndustry || post.industry === filterIndustry;

              return matchesSearch && matchesPostedDate && matchesIndustry;
            })
            .map((post) => (
              <Paper
                key={post.id}
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  border: "1px solid #334155",
                  borderRadius: 2,
                  "&:hover": { borderColor: "#8b5cf6" },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "text.primary", fontWeight: 600, mb: 2 }}
                >
                  {post.company_name} - {post.position}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 3 }}
                >
                  {post.industry} • Posted{" "}
                  {new Date(post.application_date).toLocaleDateString()}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewPostDetails(post)}
                    sx={{
                      color: "#8b5cf6",
                      borderColor: "#8b5cf6",
                      "&:hover": {
                        borderColor: "#7c3aed",
                        bgcolor: "#8b5cf620",
                      },
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleViewApplications(post)}
                    disabled={postAppLoading}
                    sx={{
                      bgcolor: "#10b981",
                      "&:hover": { bgcolor: "#059669" },
                    }}
                  >
                    Applications
                  </Button>
                </Box>
              </Paper>
            ))}
        </Box>
      </Box>

      {/* View Post Details Dialog */}
      <Dialog
        open={viewPostDialogOpen}
        onClose={() => setViewPostDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedPost && (
            <PostDetails postId={selectedPost.id} showApplyButtons={false} />
          )}
        </DialogContent>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog
        open={viewApplicationsDialogOpen}
        onClose={() => setViewApplicationsDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Applications for {selectedPost?.company_name} -{" "}
          {selectedPost?.position}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => handleSendListClick(selectedPost)}
              disabled={sentLists.has(selectedPost?.id)}
              sx={{
                color: "#f59e0b",
                borderColor: "#f59e0b",
                "&:hover": { borderColor: "#d97706", bgcolor: "#f59e0b20" },
                "&:disabled": {
                  color: "text.secondary",
                  borderColor: "#64748b",
                  opacity: 0.5,
                },
                padding: { xs: "4px 8px", sm: "6px 16px" },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {sentLists.has(selectedPost?.id) ? "List Sent" : "Send List"}
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{
                bgcolor: "#10b981",
                "&:hover": { bgcolor: "#059669" },
                padding: { xs: "4px 8px", sm: "6px 16px" },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              component="label"
              sx={{
                color: "#8b5cf6",
                borderColor: "#8b5cf6",
                "&:hover": { borderColor: "#7c3aed", bgcolor: "#8b5cf620" },
                padding: { xs: "4px 8px", sm: "6px 16px" },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Import CSV
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleImportCSV}
              />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Filters */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", mb: 2, fontWeight: 600 }}
            >
              Filters
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              <TextField
                size="small"
                label="Student Name"
                value={filterStudentName}
                onChange={(e) => setFilterStudentName(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "text.secondary" },
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                }}
              />
              <TextField
                size="small"
                label="Roll Number"
                value={filterRollNumber}
                onChange={(e) => setFilterRollNumber(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "text.secondary" },
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                }}
              />
              <TextField
                size="small"
                label="Branch"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "text.secondary" },
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: "text.secondary" }}>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                  sx={{
                    color: "text.primary",
                    bgcolor: "background.default",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#334155",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8b5cf6",
                    },
                  }}
                >
                  <MenuItem value="all">All Applications</MenuItem>
                  <MenuItem value="applied">Applied</MenuItem>
                  <MenuItem value="interview_scheduled">
                    Interview Scheduled
                  </MenuItem>
                  <MenuItem value="interviewed">Interviewed</MenuItem>
                  <MenuItem value="offer">Offer</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Excel-like Table */}
          <TableContainer
            component={Paper}
            sx={{
              bgcolor: "background.default",
              border: "1px solid #334155",
              borderRadius: 2,
              overflowX: "auto",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    "Student Name",
                    "Roll Number",
                    "Branch",
                    "Semester",
                    "CGPA",
                    "10th",
                    "12th",
                    "Company",
                    "Position",
                    "Status",
                    "Applied Date",
                    "Actions",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        bgcolor: "background.default",
                        color: "text.primary",
                        fontWeight: 700,
                        borderBottom: "1px solid #334155",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((app) => (
                    <TableRow
                      key={app.id}
                      sx={{
                        "&:hover": { bgcolor: "#1e293b80" },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "text.primary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {app.full_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {app.roll_number}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {app.branch}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {app.current_semester}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {app.cgpa}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {app.tenth_score}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {app.twelfth_score}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {selectedPost?.company_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {selectedPost?.position}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #334155" }}>
                        <Chip
                          label={
                            statusLabels[app.application_status] || "Applied"
                          }
                          size="small"
                          sx={{
                            bgcolor: `${
                              statusColors[app.application_status] ||
                              statusColors.applied
                            }20`,
                            color:
                              statusColors[app.application_status] ||
                              statusColors.applied,
                            border: `1px solid ${
                              statusColors[app.application_status] ||
                              statusColors.applied
                            }40`,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {new Date(app.applied_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #334155" }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, app)}
                          sx={{ color: "text.secondary" }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredApplications.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                color: "text.primary",
                borderTop: "1px solid #334155",
                "& .MuiTablePagination-select": { color: "text.primary" },
              }}
            />
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewApplicationsDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send List Confirmation Dialog */}
      <Dialog
        open={sendListDialogOpen}
        onClose={() => setSendListDialogOpen(false)}
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogTitle>Confirm Send List</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "text.primary", mb: 2 }}>
            Check the information before sending. Further changes cannot be
            changed.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            This action will send the application list to the recruiter for{" "}
            {selectedPost?.company_name} - {selectedPost?.position}. Once sent,
            you cannot send the list again for this post.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSendListDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendListConfirm}
            variant="contained"
            sx={{
              bgcolor: "#f59e0b",
              color: "#1e293b",
              "&:hover": { bgcolor: "#d97706" },
            }}
          >
            Send List
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
