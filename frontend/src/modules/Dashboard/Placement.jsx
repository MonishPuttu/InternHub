"use client";

import { useState } from "react";
import {
  Box,
  Typography,
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
  InputAdornment,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";
import ApprovedPostsSection from "@/components/dashboard/ApprovedPostsSection";

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  // New filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPostedDate, setFilterPostedDate] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");

  const handleMenuOpen = (event, app) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        `${BACKEND_URL}/api/student-applications/application/${selectedApp.id}/status`,
        {
          application_status: editStatus,
          placement_notes: editNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("Application updated successfully");
      setEditDialogOpen(false);
    } catch (error) {
      setErrorMsg("Failed to update application");
    }
  };

  const handleRemoveStudent = () => {
    setRemoveDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmRemove = async () => {
    try {
      const token = getToken();
      await axios.delete(
        `${BACKEND_URL}/api/student-applications/application/${selectedApp.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("Student removed successfully");
      setRemoveDialogOpen(false);
      // Trigger refresh by updating a key that causes ApprovedPostsSection to re-fetch
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      setErrorMsg("Failed to remove student");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
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
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by post name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: 250, sm: 300 },
              width: { xs: "100%", sm: "auto" },
              "& .MuiOutlinedInput-root": {
                color: "#e2e8f0",
                bgcolor: "#0f172a",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
              },
              "& .MuiInputBase-input::placeholder": { color: "#94a3b8" },
            }}
          />

          <TextField
            size="small"
            type="date"
            label="Posted Date"
            value={filterPostedDate}
            onChange={(e) => setFilterPostedDate(e.target.value)}
            InputLabelProps={{ shrink: true, sx: { color: "#94a3b8" } }}
            sx={{
              minWidth: { xs: 150, sm: 200 },
              width: { xs: "48%", sm: "auto" },
              "& .MuiOutlinedInput-root": {
                color: "#e2e8f0",
                bgcolor: "#0f172a",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: 150, sm: 200 }, width: { xs: "48%", sm: "auto" } }}>
            <InputLabel sx={{ color: "#94a3b8" }}>Industry</InputLabel>
            <Select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              label="Industry"
              sx={{
                color: "#e2e8f0",
                bgcolor: "#0f172a",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b5cf6",
                },
              }}
            >
              <MenuItem value="">All Industries</MenuItem>
              <MenuItem value="Technology">Technology</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
              <MenuItem value="Healthcare">Healthcare</MenuItem>
              <MenuItem value="Education">Education</MenuItem>
              <MenuItem value="Manufacturing">Manufacturing</MenuItem>
              <MenuItem value="Retail">Retail</MenuItem>
              <MenuItem value="Consulting">Consulting</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <ApprovedPostsSection
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        selectedApp={selectedApp}
        setSelectedApp={setSelectedApp}
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        successMsg={successMsg}
        setSuccessMsg={setSuccessMsg}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        handleOpenEdit={handleOpenEdit}
        handleSaveEdit={handleSaveEdit}
        searchQuery={searchQuery}
        filterPostedDate={filterPostedDate}
        filterIndustry={filterIndustry}
      />

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { bgcolor: "#1e293b", border: "1px solid #334155" },
        }}
      >
        <MenuItem onClick={handleOpenEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20, color: "#10b981" }} />
          Update Status
        </MenuItem>
        <MenuItem onClick={handleRemoveStudent}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20, color: "#ef4444" }} />
          Remove Student
        </MenuItem>
      </Menu>

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

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1e293b", color: "#e2e8f0" },
        }}
      >
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {selectedApp?.full_name} from this application?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRemoveDialogOpen(false)}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRemove}
            sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}
          >
            Remove
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
