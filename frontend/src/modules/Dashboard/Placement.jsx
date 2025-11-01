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
  Visibility as VisibilityIcon,
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

export default function PlacementDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/applications-all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setErrorMsg("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, app) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleOpenEdit = () => {
    setEditStatus(selectedApp.application_status);
    setEditNotes(selectedApp.placement_notes || "");
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    try {
      const token = getToken();
      await axios.put(
        `${BACKEND_URL}/api/student-applications/${selectedApp.id}/status`,
        {
          application_status: editStatus,
          placement_notes: editNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("Application updated successfully");
      setEditDialogOpen(false);
      fetchApplications();
    } catch (error) {
      setErrorMsg("Failed to update application");
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      [
        "Name",
        "Roll Number",
        "Branch",
        "Semester",
        "CGPA",
        "Company",
        "Position",
        "Status",
        "Applied Date",
      ],
      ...filteredApplications.map((app) => [
        app.full_name,
        app.roll_number,
        app.branch,
        app.current_semester,
        app.cgpa,
        app.company_name,
        app.position,
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
    a.download = `applications_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "all") return true;
    return app.application_status === filterStatus;
  });

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.application_status === "applied")
      .length,
    interviewed: applications.filter(
      (a) => a.application_status === "interviewed"
    ).length,
    offers: applications.filter((a) => a.application_status === "offer").length,
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "#e2e8f0" }}>
          Loading applications...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}
          >
            Placement Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Manage student applications and track placement progress
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportCSV}
          sx={{
            bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" },
            textTransform: "none",
          }}
        >
          Export CSV
        </Button>
      </Box>

      {/* Statistics */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          mb: 4,
        }}
      >
        {[
          { label: "Total Applications", value: stats.total, color: "#8b5cf6" },
          { label: "Applied", value: stats.applied, color: "#64748b" },
          { label: "Interviewed", value: stats.interviewed, color: "#8b5cf6" },
          { label: "Offers", value: stats.offers, color: "#10b981" },
        ].map((stat, idx) => (
          <Paper
            key={idx}
            sx={{
              p: 2.5,
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: stat.color, fontWeight: 700 }}
            >
              {stat.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <FilterListIcon sx={{ color: "#94a3b8" }} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ color: "#94a3b8" }}>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Filter by Status"
            sx={{
              color: "#e2e8f0",
              bgcolor: "#1e293b",
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

      {/* Excel-like Table */}
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: "#1e293b",
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
                    {app.company_name}
                  </TableCell>
                  <TableCell
                    sx={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}
                  >
                    {app.position}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #334155" }}>
                    <Chip
                      label={statusLabels[app.application_status]}
                      size="small"
                      sx={{
                        bgcolor: `${statusColors[app.application_status]}20`,
                        color: statusColors[app.application_status],
                        border: `1px solid ${
                          statusColors[app.application_status]
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

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { bgcolor: "#1e293b", border: "1px solid #334155" },
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon sx={{ mr: 1, fontSize: 20, color: "#8b5cf6" }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleOpenEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20, color: "#10b981" }} />
          Update Status
        </MenuItem>
      </Menu>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1e293b", color: "#e2e8f0" },
        }}
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Student Name
                </Typography>
                <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                  {selectedApp.full_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                  {selectedApp.email}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Contact
                </Typography>
                <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                  {selectedApp.contact_number}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Company & Position
                </Typography>
                <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                  {selectedApp.company_name} - {selectedApp.position}
                </Typography>
              </Box>
              {selectedApp.cover_letter && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    Cover Letter
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#e2e8f0" }}>
                    {selectedApp.cover_letter}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{ color: "#94a3b8" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1e293b", color: "#e2e8f0" },
        }}
      >
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#94a3b8" }}>Status</InputLabel>
              <Select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                label="Status"
                sx={{
                  color: "#e2e8f0",
                  bgcolor: "#0f172a",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#334155",
                  },
                }}
              >
                <MenuItem value="applied">Applied</MenuItem>
                <MenuItem value="interview_scheduled">
                  Interview Scheduled
                </MenuItem>
                <MenuItem value="interviewed">Interviewed</MenuItem>
                <MenuItem value="offer">Offer</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Placement Notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  bgcolor: "#0f172a",
                  "& fieldset": { borderColor: "#334155" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
      >
        <Alert severity="success">{successMsg}</Alert>
      </Snackbar>
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={5000}
        onClose={() => setErrorMsg("")}
      >
        <Alert severity="error">{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
