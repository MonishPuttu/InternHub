"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TablePagination,
  Tooltip,
  TextField,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
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

export default function ApprovedPostsSection({
  handleMenuOpen,
  searchQuery,
  filterPostedDate,
  filterIndustry,
}) {
  const theme = useTheme();
  const router = useRouter();
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewApplicationsDialog, setViewApplicationsDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Offer management states
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [rejectOfferDialog, setRejectOfferDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchApprovedPosts();
  }, [searchQuery, filterPostedDate, filterIndustry]);

  const fetchApprovedPosts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/approved-posts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        let posts = response.data.posts || [];

        // Apply filters
        if (searchQuery) {
          posts = posts.filter(
            (post) =>
              post.company_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              post.position?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (filterPostedDate) {
          posts = posts.filter((post) => {
            const postDate = new Date(post.application_date)
              .toISOString()
              .split("T")[0];
            return postDate === filterPostedDate;
          });
        }

        if (filterIndustry) {
          posts = posts.filter((post) => post.industry === filterIndustry);
        }

        setApprovedPosts(posts);
      }
    } catch (error) {
      console.error("Error fetching approved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export CSV function
  const handleExportCSV = () => {
    try {
      const headers = [
        "Student Name",
        "Roll Number",
        "Branch",
        "Semester",
        "CGPA",
        "10th Score",
        "12th Score",
        "Status",
        "Offer Status",
        "Applied Date",
      ];

      const rows = applications.map((app) => [
        app.full_name,
        app.roll_number,
        app.branch,
        app.current_semester,
        app.cgpa,
        app.tenth_score,
        app.twelfth_score,
        app.application_status,
        app.offer_status || "No Offer",
        new Date(app.applied_at).toLocaleDateString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${selectedPost.company_name}_${selectedPost.position}_applications.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg("CSV exported successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setErrorMsg("Failed to export CSV");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  // Import CSV function
  const handleImportCSV = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split("\n").slice(1);

        const updates = rows
          .filter((row) => row.trim())
          .map((row) => {
            const cols = row.split(",");
            return {
              roll_number: cols[1],
              status: cols[7],
              offer_status: cols[8],
            };
          });

        const token = getToken();
        await axios.post(
          `${BACKEND_URL}/api/student-applications/bulk-update`,
          { updates },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSuccessMsg("CSV imported successfully");
        setTimeout(() => setSuccessMsg(""), 3000);
        handleViewApplications(selectedPost);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing CSV:", error);
      setErrorMsg("Failed to import CSV");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  // Send List function - CORRECTED with user_id
  const handleSendList = async () => {
    try {
      const token = getToken();

      if (!selectedPost || !selectedPost.id) {
        setErrorMsg("Missing post information");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }

      // user_id is the recruiter ID who created the post
      const recruiterId = selectedPost.user_id;

      if (!recruiterId) {
        setErrorMsg("Missing recruiter information for this post");
        setTimeout(() => setErrorMsg(""), 3000);
        console.log("selectedPost:", selectedPost); // Debug log
        return;
      }

      console.log(
        "Sending list for post:",
        selectedPost.id,
        "to recruiter:",
        recruiterId
      );

      // Send the list to recruiter using the correct endpoint format
      const response = await axios.post(
        `${BACKEND_URL}/api/student-applications/send-list/${selectedPost.id}`,
        {
          recruiterId: recruiterId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ok) {
        setSuccessMsg(
          `Application list sent to recruiter successfully (${response.data.applicationsCount} applications)`
        );
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(response.data.error || "Failed to send list");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    } catch (error) {
      console.error("Error sending list:", error);
      if (error.response?.status === 400) {
        setErrorMsg(
          error.response.data.error ||
            "Application list already sent for this post"
        );
      } else {
        setErrorMsg("Failed to send application list to recruiter");
      }
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleViewApplications = async (post) => {
    try {
      setSelectedPost(post);
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/post/${post.id}/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setApplications(response.data.applications || []);
        setViewApplicationsDialog(true);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setErrorMsg("Failed to load applications");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleViewOffer = async (application) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/offers/by-application/${application.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok && response.data.offer) {
        setSelectedOffer(response.data.offer);
        setOfferDialogOpen(true);
      } else {
        setErrorMsg("No offer found for this application");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    } catch (error) {
      console.error("Error fetching offer:", error);
      setErrorMsg("Failed to load offer details");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleApproveOffer = async (application) => {
    try {
      const token = getToken();

      const offerResponse = await axios.get(
        `${BACKEND_URL}/api/offers/by-application/${application.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!offerResponse.data.ok || !offerResponse.data.offer) {
        setErrorMsg("No offer found for this application");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }

      const offerId = offerResponse.data.offer.id;

      await axios.put(
        `${BACKEND_URL}/api/offers/approve/${offerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMsg("Offer approved and forwarded to student");
      setTimeout(() => setSuccessMsg(""), 3000);
      handleViewApplications(selectedPost);
    } catch (error) {
      console.error("Error approving offer:", error);
      setErrorMsg("Failed to approve offer");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleRejectOffer = async () => {
    try {
      const token = getToken();

      const offerResponse = await axios.get(
        `${BACKEND_URL}/api/offers/by-application/${selectedApp.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!offerResponse.data.ok || !offerResponse.data.offer) {
        setErrorMsg("No offer found for this application");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }

      const offerId = offerResponse.data.offer.id;

      await axios.put(
        `${BACKEND_URL}/api/offers/reject-offer/${offerId}`,
        { reason: rejectReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMsg("Offer rejected");
      setTimeout(() => setSuccessMsg(""), 3000);
      setRejectOfferDialog(false);
      setRejectReason("");
      handleViewApplications(selectedPost);
    } catch (error) {
      console.error("Error rejecting offer:", error);
      setErrorMsg("Failed to reject offer");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleDownloadOffer = async (application) => {
    try {
      const token = getToken();

      const offerResponse = await axios.get(
        `${BACKEND_URL}/api/offers/by-application/${application.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!offerResponse.data.ok || !offerResponse.data.offer) {
        setErrorMsg("No offer found");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }

      const offer = offerResponse.data.offer;

      if (!offer.id) {
        setErrorMsg("Invalid offer ID");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/offers/download/${offer.id}`,
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
        `Offer_${offer.company_name || "Company"}_${
          offer.position || "Position"
        }.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading offer:", error);
      setErrorMsg("Failed to download offer letter");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ color: "text.secondary" }}>
          Loading posts...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
      >
        Approved Posts
      </Typography>

      {approvedPosts.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No approved posts found
          </Typography>
        </Box>
      ) : (
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
                    onClick={() => router.push(`/Post/postdetails/${post.id}`)}
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
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewApplications(post)}
                    sx={{
                      color: "#10b981",
                      borderColor: "#10b981",
                      "&:hover": {
                        borderColor: "#059669",
                        bgcolor: "#10b98120",
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
      )}

      {/* View Applications Dialog */}
      <Dialog
        open={viewApplicationsDialog}
        onClose={() => setViewApplicationsDialog(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              Applications for {selectedPost?.company_name} -{" "}
              {selectedPost?.position}
            </Typography>

            {/* Action Buttons at Top */}
            {applications.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={handleExportCSV}
                  variant="outlined"
                  size="small"
                  sx={{
                    color: "#10b981",
                    borderColor: "#10b981",
                    "&:hover": {
                      borderColor: "#059669",
                      bgcolor: "#10b98120",
                    },
                  }}
                >
                  Export CSV
                </Button>

                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{
                    color: "#8b5cf6",
                    borderColor: "#8b5cf6",
                    "&:hover": {
                      borderColor: "#7c3aed",
                      bgcolor: "#8b5cf620",
                    },
                  }}
                >
                  Import CSV
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleImportCSV}
                  />
                </Button>

                <Button
                  onClick={handleSendList}
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: "#0ea5e9",
                    "&:hover": { bgcolor: "#0284c7" },
                  }}
                >
                  Send List
                </Button>
              </Stack>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {applications.length > 0 ? (
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
                      "Status",
                      "Offer Status",
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
                  {applications
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
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Chip
                            label={
                              statusLabels[app.application_status] || "Applied"
                            }
                            size="small"
                            sx={{
                              bgcolor: `${
                                statusColors[app.application_status] ||
                                "#64748b"
                              }20`,
                              color:
                                statusColors[app.application_status] ||
                                "#64748b",
                              border: "1px solid",
                              borderColor: `${
                                statusColors[app.application_status] ||
                                "#64748b"
                              }40`,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
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
                                bgcolor: "#10b98120",
                                color: "#10b981",
                                border: "1px solid #10b98140",
                              }}
                            />
                          )}
                          {app.offer_status === "rejected_by_placement" && (
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
                          {!app.offer_status && (
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              No Offer
                            </Typography>
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
                        <TableCell
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {app.offer_status ===
                              "pending_placement_approval" && (
                              <>
                                <Tooltip title="View Offer">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewOffer(app)}
                                    sx={{ color: "#8b5cf6" }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Approve Offer">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleApproveOffer(app)}
                                    sx={{ color: "#10b981" }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject Offer">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setRejectOfferDialog(true);
                                    }}
                                    sx={{ color: "#ef4444" }}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}

                            {app.offer_status === "approved" && (
                              <>
                                <Tooltip title="View Offer">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewOffer(app)}
                                    sx={{ color: "#8b5cf6" }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download Offer Letter">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownloadOffer(app)}
                                    sx={{ color: "#10b981" }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}

                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, app)}
                              sx={{ color: "text.secondary" }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={applications.length}
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
            onClick={() => setViewApplicationsDialog(false)}
            sx={{ color: "text.secondary" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Offer Details Dialog */}
      <Dialog
        open={offerDialogOpen}
        onClose={() => setOfferDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          Offer Letter Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedOffer && (
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Company
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedOffer.company_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Position
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedOffer.position}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Salary Package
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#10b981" }}
                  >
                    ₹{selectedOffer.salary_package} LPA
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Joining Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(selectedOffer.joining_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedOffer.location}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Bond Period
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedOffer.bond_period} years
                    {selectedOffer.bond_period === 0 && " (No Bond)"}
                  </Typography>
                </Box>
              </Box>

              {selectedOffer.other_terms && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor:
                      theme.palette.mode === "dark" ? "#1e293b" : "#f8fafc",
                    borderRadius: 1,
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Other Terms & Conditions
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                  >
                    {selectedOffer.other_terms}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
          <Button
            onClick={() => setOfferDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Close
          </Button>
          {selectedOffer?.offer_letter_url && (
            <Button
              onClick={async () => {
                try {
                  const token = getToken();

                  if (!selectedOffer.id) {
                    setErrorMsg("Invalid offer ID");
                    setTimeout(() => setErrorMsg(""), 3000);
                    return;
                  }

                  // Download using the offer ID endpoint
                  const response = await axios.get(
                    `${BACKEND_URL}/api/offers/download/${selectedOffer.id}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                      responseType: "blob",
                    }
                  );

                  const url = window.URL.createObjectURL(
                    new Blob([response.data])
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute(
                    "download",
                    `Offer_${selectedOffer.company_name || "Company"}_${
                      selectedOffer.position || "Position"
                    }.pdf`
                  );
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error("Error downloading offer:", error);
                  setErrorMsg("Failed to download offer letter");
                  setTimeout(() => setErrorMsg(""), 3000);
                }
              }}
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Offer Dialog */}
      <Dialog
        open={rejectOfferDialog}
        onClose={() => setRejectOfferDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          Reject Offer Letter
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
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
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
          <Button
            onClick={() => {
              setRejectOfferDialog(false);
              setRejectReason("");
            }}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectOffer}
            variant="contained"
            sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}
          >
            Reject Offer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Notifications */}
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
