"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  Stack,
  Grid,
  CircularProgress,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    approvedPosts: 0,
    pendingPosts: 0,
    totalApplications: 0,
  });
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const theme = useTheme();
  const [viewListDialogOpen, setViewListDialogOpen] = useState(false);
  const [receivedLists, setReceivedLists] = useState([]);
  const [selectedReceivedList, setSelectedReceivedList] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Offer letter states
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [offerData, setOfferData] = useState({
    position: "",
    salary: "",
    joiningDate: "",
    location: "",
    bondPeriod: "",
    otherTerms: "",
  });
  const [offerFile, setOfferFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchDashboardData();
    fetchReceivedLists();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const postsResponse = await axios.get(
        `${BACKEND_URL}/api/posts/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (postsResponse.data.ok) {
        const posts = postsResponse.data.applications;
        const approved = posts.filter((p) => p.approval_status === "approved");
        setStats({
          totalPosts: posts.length,
          approvedPosts: approved.length,
          pendingPosts: posts.filter((p) => p.approval_status === "pending")
            .length,
          totalApplications: 0,
        });
        setApprovedPosts(approved);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedLists = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/received-lists`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setReceivedLists(response.data.lists);
      }
    } catch (error) {
      console.error("Error fetching received lists:", error);
    }
  };

  const handleViewPostDetails = (post) => {
    router.push(`/Post/postdetails/${post.id}`);
  };

  const handleViewApplicationsList = async (post) => {
    const receivedList = receivedLists.find((list) => list.post.id === post.id);
    if (receivedList) {
      setSelectedReceivedList(receivedList);
      setViewListDialogOpen(true);
    } else {
      console.log("No applications received for this post yet");
    }
  };

  // Handle Send Offer button
  const handleSendOffer = (application) => {
    setSelectedApplication(application);
    setOfferData({
      position: selectedReceivedList?.post.position || "",
      salary: "",
      joiningDate: "",
      location: "",
      bondPeriod: "",
      otherTerms: "",
    });
    setOfferFile(null);
    setOfferDialogOpen(true);
  };

  // Handle Reject button
  const handleReject = async (application) => {
    if (!confirm(`Are you sure you want to reject ${application.full_name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BACKEND_URL}/api/offers/reject`,
        {
          applicationId: application.id,
          studentId: application.user_id,
          postId: selectedReceivedList.post.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMsg("Application rejected successfully");
      fetchReceivedLists(); // Refresh data
    } catch (error) {
      console.error("Error rejecting application:", error);
      setErrorMsg("Failed to reject application");
    }
  };

  // Handle offer submission
  const handleOfferSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("applicationId", selectedApplication.id);
      formData.append("postId", selectedReceivedList.post.id);
      formData.append("position", offerData.position);
      formData.append("salary", offerData.salary);
      formData.append("joiningDate", offerData.joiningDate);
      formData.append("location", offerData.location);
      formData.append("bondPeriod", offerData.bondPeriod);
      formData.append("otherTerms", offerData.otherTerms);

      if (offerFile) {
        formData.append("offerLetter", offerFile);
      }

      await axios.post(`${BACKEND_URL}/api/offers/send`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMsg("Offer letter sent successfully");
      setOfferDialogOpen(false);
      fetchReceivedLists(); // Refresh data
    } catch (error) {
      console.error("Error sending offer:", error);
      setErrorMsg("Failed to send offer letter");
    }
  };

  const handleDownloadApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/received-list/${selectedReceivedList.sent_list.id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${selectedReceivedList.post.company_name}_${selectedReceivedList.post.position}_applications.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading applications:", error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}
      >
        Recruiter Dashboard
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
        Welcome back! Here's an overview of your recruitment activities
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor:
                theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Total Posts
            </Typography>
            <Typography variant="h4" sx={{ color: "text.primary", mt: 1 }}>
              {stats.totalPosts}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor:
                theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Approved Posts
            </Typography>
            <Typography variant="h4" sx={{ color: "#10b981", mt: 1 }}>
              {stats.approvedPosts}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor:
                theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Pending Review
            </Typography>
            <Typography variant="h4" sx={{ color: "#fbbf24", mt: 1 }}>
              {stats.pendingPosts}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor:
                theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Total Applications
            </Typography>
            <Typography variant="h4" sx={{ color: "text.primary", mt: 1 }}>
              {stats.totalApplications}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 600, mb: 2 }}
        >
          Quick Actions
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • Go to Posts section to create new job opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • View and manage your posted opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • Check applications from students
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • The 'View Applications' button is unclickable if no students have
            applied to your post yet
          </Typography>
        </Stack>
      </Paper>

      {/* Approved Posts Section */}
      <Typography
        variant="h6"
        sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
      >
        Your Approved Posts
      </Typography>

      <Grid container spacing={3}>
        {approvedPosts.map((post) => (
          <Grid item xs={12} md={6} key={post.id}>
            <Paper
              sx={{
                p: 3,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
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
                    "&:hover": { borderColor: "#7c3aed", bgcolor: "#8b5cf620" },
                  }}
                >
                  View Details
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleViewApplicationsList(post)}
                  disabled={
                    !receivedLists.some((list) => list.post.id === post.id)
                  }
                  sx={{
                    color: "#10b981",
                    borderColor: "#10b981",
                    "&:hover": { borderColor: "#059669", bgcolor: "#10b98120" },
                    "&:disabled": {
                      color: "text.secondary",
                      borderColor:
                        theme.palette.mode === "dark" ? "#64748b" : "#cbd5e1",
                      opacity: 0.5,
                    },
                  }}
                >
                  View Applications
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* View Applications List Dialog */}
      <Dialog
        open={viewListDialogOpen}
        onClose={() => setViewListDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          Applications for {selectedReceivedList?.post.company_name} -{" "}
          {selectedReceivedList?.post.position}
        </DialogTitle>
        <DialogContent>
          {selectedReceivedList &&
          selectedReceivedList.sent_list.list_data.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                bgcolor: "background.default",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                borderRadius: 2,
                mt: 2,
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
                          bgcolor: "background.paper",
                          color: "text.primary",
                          fontWeight: 700,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedReceivedList.sent_list.list_data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((app) => (
                      <TableRow
                        key={app.id}
                        sx={{
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <TableCell
                          sx={{
                            color: "text.primary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {app.full_name}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {app.roll_number}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {app.branch}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {app.current_semester}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {app.cgpa}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {app.tenth_score}%
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {app.twelfth_score}%
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {selectedReceivedList?.post.company_name}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {selectedReceivedList?.post.position}
                        </TableCell>
                        {/* Status Column */}
                        <TableCell
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {app.application_status === "rejected" && (
                            <Chip
                              label="Rejected"
                              size="small"
                              sx={{
                                bgcolor: "#ef444420",
                                color: "#ef4444",
                                border: "1px solid #ef444440",
                              }}
                            />
                          )}
                          {app.offer_status === "sent" && (
                            <Chip
                              label="Offer Sent"
                              size="small"
                              sx={{
                                bgcolor: "#10b98120",
                                color: "#10b981",
                                border: "1px solid #10b98140",
                              }}
                            />
                          )}
                          {app.offer_status ===
                            "pending_placement_approval" && (
                            <Chip
                              label="Pending Approval"
                              size="small"
                              sx={{
                                bgcolor: "#fbbf2420",
                                color: "#fbbf24",
                                border: "1px solid #fbbf2440",
                              }}
                            />
                          )}
                          {app.offer_status === "approved" && (
                            <Chip
                              label="Approved"
                              size="small"
                              sx={{
                                bgcolor: "#8b5cf620",
                                color: "#8b5cf6",
                                border: "1px solid #8b5cf640",
                              }}
                            />
                          )}
                          {!app.offer_status &&
                            app.application_status !== "rejected" && (
                              <Chip
                                label="Pending"
                                size="small"
                                sx={{
                                  bgcolor: "#64748b20",
                                  color: "#64748b",
                                  border: "1px solid #64748b40",
                                }}
                              />
                            )}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {new Date(app.applied_at).toLocaleDateString()}
                        </TableCell>
                        {/* Action Buttons with Updated Logic */}
                        <TableCell
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleSendOffer(app)}
                              disabled={
                                app.offer_status === "sent" ||
                                app.offer_status ===
                                  "pending_placement_approval" ||
                                app.offer_status === "approved" ||
                                app.offer_status === "rejected" ||
                                app.application_status === "rejected"
                              }
                              sx={{
                                bgcolor: "#10b981",
                                "&:hover": { bgcolor: "#059669" },
                                "&:disabled": { bgcolor: "#94a3b8" },
                                fontSize: "0.75rem",
                                px: 1,
                              }}
                            >
                              {app.offer_status === "sent" ||
                              app.offer_status ===
                                "pending_placement_approval" ||
                              app.offer_status === "approved"
                                ? "Offer Sent"
                                : app.application_status === "rejected"
                                ? "Cannot Send"
                                : "Send Offer"}
                            </Button>

                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleReject(app)}
                              disabled={
                                app.offer_status === "rejected" ||
                                app.offer_status === "sent" ||
                                app.offer_status ===
                                  "pending_placement_approval" ||
                                app.offer_status === "approved" ||
                                app.application_status === "rejected"
                              }
                              sx={{
                                color: "#ef4444",
                                borderColor: "#ef4444",
                                "&:hover": {
                                  borderColor: "#dc2626",
                                  bgcolor: "#ef444420",
                                },
                                "&:disabled": {
                                  color: "#94a3b8",
                                  borderColor: "#94a3b8",
                                },
                                fontSize: "0.75rem",
                                px: 1,
                              }}
                            >
                              {app.offer_status === "rejected" ||
                              app.application_status === "rejected"
                                ? "Rejected"
                                : "Reject"}
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={selectedReceivedList.sent_list.list_data.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{
                  color: "text.primary",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  "& .MuiTablePagination-select": { color: "text.primary" },
                }}
              />
            </TableContainer>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", textAlign: "center", py: 4 }}
            >
              No applications received for this post yet.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
          <Button
            onClick={() => setViewListDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Close
          </Button>
          {selectedReceivedList &&
            selectedReceivedList.sent_list.list_data.length > 0 && (
              <Button
                onClick={handleDownloadApplications}
                variant="contained"
                sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
              >
                Download CSV
              </Button>
            )}
        </DialogActions>
      </Dialog>

      {/* Offer Letter Dialog */}
      <Dialog
        open={offerDialogOpen}
        onClose={() => setOfferDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          Send Offer Letter to {selectedApplication?.full_name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Position"
              value={offerData.position}
              onChange={(e) =>
                setOfferData({ ...offerData, position: e.target.value })
              }
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  bgcolor: "background.default",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "text.secondary" },
              }}
            />

            <TextField
              fullWidth
              label="Salary Package (LPA)"
              type="number"
              value={offerData.salary}
              onChange={(e) =>
                setOfferData({ ...offerData, salary: e.target.value })
              }
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  bgcolor: "background.default",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "text.secondary" },
              }}
            />

            <TextField
              fullWidth
              label="Joining Date"
              type="date"
              value={offerData.joiningDate}
              onChange={(e) =>
                setOfferData({ ...offerData, joiningDate: e.target.value })
              }
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  bgcolor: "background.default",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "text.secondary" },
              }}
            />

            <TextField
              fullWidth
              label="Location"
              value={offerData.location}
              onChange={(e) =>
                setOfferData({ ...offerData, location: e.target.value })
              }
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  bgcolor: "background.default",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "text.secondary" },
              }}
            />

            <TextField
              fullWidth
              label="Bond Period (Years)"
              type="number"
              value={offerData.bondPeriod}
              onChange={(e) =>
                setOfferData({ ...offerData, bondPeriod: e.target.value })
              }
              helperText="Enter 0 if no bond"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  bgcolor: "background.default",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "text.secondary" },
                "& .MuiFormHelperText-root": { color: "text.secondary" },
              }}
            />

            <TextField
              fullWidth
              label="Other Terms & Conditions"
              multiline
              rows={4}
              value={offerData.otherTerms}
              onChange={(e) =>
                setOfferData({ ...offerData, otherTerms: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  bgcolor: "background.default",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "#8b5cf6" },
                },
                "& .MuiInputLabel-root": { color: "text.secondary" },
              }}
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{
                color: "#8b5cf6",
                borderColor: "#8b5cf6",
                "&:hover": { borderColor: "#7c3aed", bgcolor: "#8b5cf620" },
              }}
            >
              Upload Offer Letter PDF
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={(e) => setOfferFile(e.target.files[0])}
              />
            </Button>

            {offerFile && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Selected: {offerFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
          <Button
            onClick={() => setOfferDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleOfferSubmit}
            variant="contained"
            sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
          >
            Send Offer Letter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      {successMsg && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            bgcolor: "#10b981",
            color: "#ffffff",
            px: 3,
            py: 2,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {successMsg}
        </Box>
      )}

      {errorMsg && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            bgcolor: "#ef4444",
            color: "#ffffff",
            px: 3,
            py: 2,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {errorMsg}
        </Box>
      )}
    </Box>
  );
}
