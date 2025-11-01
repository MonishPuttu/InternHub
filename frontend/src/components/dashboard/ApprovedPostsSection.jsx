"use client";

import { useState, useEffect } from "react";
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
import PostDetails from "@/modules/Post/postDetails";

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
  const [viewPostDialogOpen, setViewPostDialogOpen] = useState(false);
  const [viewApplicationsDialogOpen, setViewApplicationsDialogOpen] = useState(false);

  // Filter states
  const [filterStudentName, setFilterStudentName] = useState("");
  const [filterRollNumber, setFilterRollNumber] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterCgpa, setFilterCgpa] = useState("");
  const [filterTenth, setFilterTenth] = useState("");
  const [filterTwelfth, setFilterTwelfth] = useState("");
  const [filterAppliedDate, setFilterAppliedDate] = useState("");

  useEffect(() => {
    fetchApprovedPosts();
  }, []);

  const fetchApprovedPosts = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        const approved = response.data.applications.filter(
          (post) => post.approval_status === "approved"
        );
        setApprovedPosts(approved);
      }
    } catch (error) {
      console.error("Error fetching approved posts:", error);
      setErrorMsg("Failed to load approved posts");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPostDetails = (post) => {
    setSelectedPost(post);
    setViewPostDialogOpen(true);
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

  const handleExportCSV = () => {
    const csvContent = [
      [
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
      ],
      ...postApplications.map((app) => [
        app.full_name,
        app.roll_number,
        app.branch,
        app.current_semester,
        app.cgpa,
        app.tenth_score,
        app.twelfth_score,
        selectedPost?.company_name || "",
        selectedPost?.position || "",
        statusLabels[app.application_status],
        new Date(app.applied_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_${selectedPost?.company_name}_${selectedPost?.position}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target.result;
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      // Expected headers
      const expectedHeaders = [
        "Student Name", "Roll Number", "Branch", "Semester", "CGPA",
        "10th", "12th", "Company", "Position", "Status", "Applied Date"
      ];

      // Check if headers match
      const headersMatch = expectedHeaders.every(header =>
        headers.includes(header)
      );

      if (!headersMatch) {
        setErrorMsg("CSV headers don't match expected format. Please check the file.");
        return;
      }

      // Helper function to safely parse dates
      const parseDate = (dateString) => {
        if (!dateString || dateString.trim() === '') {
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
              if (format === formats[0]) { // MM/DD/YYYY
                month = match[1];
                day = match[2];
                year = match[3];
              } else if (format === formats[1]) { // YYYY-MM-DD
                year = match[1];
                month = match[2];
                day = match[3];
              } else { // DD-MM-YYYY
                day = match[1];
                month = match[2];
                year = match[3];
              }

              const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
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
        const values = lines[i].split(',').map(v => v.trim());
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
          setSuccessMsg(`Successfully imported ${response.data.imported} applications`);
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
    // Apply all filters
    const matchesStudentName = !filterStudentName || app.full_name.toLowerCase().includes(filterStudentName.toLowerCase());
    const matchesRollNumber = !filterRollNumber || app.roll_number.toLowerCase().includes(filterRollNumber.toLowerCase());
    const matchesBranch = !filterBranch || app.branch.toLowerCase().includes(filterBranch.toLowerCase());
    const matchesSemester = !filterSemester || app.current_semester.toString().includes(filterSemester);
    const matchesCgpa = !filterCgpa || app.cgpa.toString().includes(filterCgpa);
    const matchesTenth = !filterTenth || app.tenth_score.toString().includes(filterTenth);
    const matchesTwelfth = !filterTwelfth || app.twelfth_score.toString().includes(filterTwelfth);
    const matchesAppliedDate = !filterAppliedDate || new Date(app.applied_at).toLocaleDateString().includes(filterAppliedDate);
    const matchesStatus = filterStatus === "all" || app.application_status === filterStatus;

    return matchesStudentName && matchesRollNumber && matchesBranch && matchesSemester &&
           matchesCgpa && matchesTenth && matchesTwelfth && matchesAppliedDate && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "#e2e8f0" }}>
          Loading approved posts...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Stats Cards */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        <Paper
          sx={{
            p: 3,
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 2,
            flex: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#e2e8f0", fontWeight: 600 }}
          >
            Total Applications
          </Typography>
          <Typography
            variant="h4"
            sx={{ color: "#8b5cf6", fontWeight: 700 }}
          >
            0
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: 3,
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 2,
            flex: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#e2e8f0", fontWeight: 600 }}
          >
            Applied
          </Typography>
          <Typography
            variant="h4"
            sx={{ color: "#0ea5e9", fontWeight: 700 }}
          >
            0
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: 3,
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 2,
            flex: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#e2e8f0", fontWeight: 600 }}
          >
            Interviewed
          </Typography>
          <Typography
            variant="h4"
            sx={{ color: "#8b5cf6", fontWeight: 700 }}
          >
            0
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: 3,
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 2,
            flex: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#e2e8f0", fontWeight: 600 }}
          >
            Offers
          </Typography>
          <Typography
            variant="h4"
            sx={{ color: "#10b981", fontWeight: 700 }}
          >
            0
          </Typography>
        </Paper>
      </Box>

      {/* Approved Posts Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ color: "#e2e8f0", fontWeight: 600, mb: 3 }}
        >
          Approved Job Posts
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {approvedPosts
            .filter((post) => {
              const matchesSearch = !searchQuery ||
                post.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.position.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesPostedDate = !filterPostedDate ||
                new Date(post.application_date).toDateString() === new Date(filterPostedDate).toDateString();
              const matchesIndustry = !filterIndustry || post.industry === filterIndustry;

              return matchesSearch && matchesPostedDate && matchesIndustry;
            })
            .map((post) => (
              <Paper
                key={post.id}
                sx={{
                  p: 3,
                  bgcolor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 2,
                  "&:hover": { borderColor: "#8b5cf6" },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#e2e8f0", fontWeight: 600, mb: 2 }}
                >
                  {post.company_name} - {post.position}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", mb: 3 }}
                >
                  {post.industry} • Posted {new Date(post.application_date).toLocaleDateString()}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewPostDetails(post)}
                    sx={{
                      color: "#8b5cf6",
                      borderColor: "#8b5cf6",
                      "&:hover": { borderColor: "#7c3aed", bgcolor: "#8b5cf620" },
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
          sx: { bgcolor: "#1e293b", color: "#e2e8f0" },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedPost && <PostDetails postId={selectedPost.id} showApplyButtons={false} />}
        </DialogContent>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog
        open={viewApplicationsDialogOpen}
        onClose={() => setViewApplicationsDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1e293b", color: "#e2e8f0" },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Applications for {selectedPost?.company_name} - {selectedPost?.position}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{
                bgcolor: "#10b981",
                "&:hover": { bgcolor: "#059669" },
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
            <Typography variant="h6" sx={{ color: "#e2e8f0", mb: 2, fontWeight: 600 }}>
              Filters
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
              <TextField
                size="small"
                label="Student Name"
                value={filterStudentName}
                onChange={(e) => setFilterStudentName(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
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
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
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
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                }}
              />
              <TextField
                size="small"
                label="Semester"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                }}
              />
              <TextField
                size="small"
                label="CGPA"
                value={filterCgpa}
                onChange={(e) => setFilterCgpa(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                }}
              />
              <TextField
                size="small"
                label="10th Score"
                value={filterTenth}
                onChange={(e) => setFilterTenth(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                }}
              />
              <TextField
                size="small"
                label="12th Score"
                value={filterTwelfth}
                onChange={(e) => setFilterTwelfth(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                }}
              />
              <TextField
                size="small"
                label="Applied Date"
                value={filterAppliedDate}
                onChange={(e) => setFilterAppliedDate(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                  "& .MuiOutlinedInput-root": {
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                  },
                }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: "#94a3b8" }}>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                  sx={{
                    color: "#e2e8f0",
                    bgcolor: "#0f172a",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8b5cf6",
                    },
                  }}
                >
                  <MenuItem value="all">All Applications</MenuItem>
                  <MenuItem value="applied">Applied</MenuItem>
                  <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
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
              bgcolor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 2,
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
                        bgcolor: "#0f172a",
                        color: "#e2e8f0",
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
                        sx={{ color: "#e2e8f0", borderBottom: "1px solid #334155" }}
                      >
                        {app.full_name}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}
                      >
                        {app.roll_number}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}
                      >
                        {app.branch}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}
                      >
                        {app.current_semester}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}
                      >
                        {app.cgpa}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}
                      >
                        {app.tenth_score}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}
                      >
                        {app.twelfth_score}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#e2e8f0", borderBottom: "1px solid #334155" }}
                      >
                        {selectedPost?.company_name}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}
                      >
                        {selectedPost?.position}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #334155" }}>
                        <Chip
                          label={statusLabels[app.application_status] || "Applied"}
                          size="small"
                          sx={{
                            bgcolor: `${statusColors[app.application_status] || statusColors.applied}20`,
                            color: statusColors[app.application_status] || statusColors.applied,
                            border: `1px solid ${
                              statusColors[app.application_status] || statusColors.applied
                            }40`,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}
                      >
                        {new Date(app.applied_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #334155" }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, app)}
                          sx={{ color: "#94a3b8" }}
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
                color: "#e2e8f0",
                borderTop: "1px solid #334155",
                "& .MuiTablePagination-select": { color: "#e2e8f0" },
              }}
            />
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewApplicationsDialogOpen(false)}
            sx={{ color: "#94a3b8" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
