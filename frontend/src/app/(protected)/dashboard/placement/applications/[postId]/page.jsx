"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const statusColors = {
  applied: "#64748b",
  interview_scheduled: "#0ea5e9",
  interviewed: "#8b5cf6",
  "offer-pending": "#f59e0b", // Fixed: with hyphen
  offer_pending: "#f59e0b", // Support both formats
  "offer-approved": "#10b981",
  offer_approved: "#10b981",
  hired: "#059669",
  rejected: "#ef4444",
};

const statusLabels = {
  applied: "Applied",
  interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed",
  "offer-pending": "Offer Pending", // Fixed: with hyphen
  offer_pending: "Offer Pending",
  "offer-approved": "Offer Approved",
  offer_approved: "Offer Approved",
  hired: "Hired",
  rejected: "Rejected",
};

export default function PlacementApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId;

  const [post, setPost] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sendListDialogOpen, setSendListDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [rejectOfferDialog, setRejectOfferDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
      fetchApplications();
    }
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/applications/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.ok) {
        setPost(response.data.application);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setErrorMsg("Failed to load post details");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/post/${postId}/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.ok) {
        console.log("Applications fetched:", response.data.applications); // Debug log
        setApplications(response.data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setErrorMsg("Failed to load applications");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

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
        `${post?.company_name || "applications"}_applications.csv`
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
        fetchApplications();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing CSV:", error);
      setErrorMsg("Failed to import CSV");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleSendListClick = () => {
    setSendListDialogOpen(true);
  };

  const handleConfirmSendList = async () => {
    try {
      const token = getToken();
      if (!post || !post.id) {
        setErrorMsg("Missing post information");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }

      const recruiterId = post.user_id;
      if (!recruiterId) {
        setErrorMsg("Missing recruiter information for this post");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/student-applications/send-list/${post.id}`,
        { recruiterId: recruiterId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ok) {
        setSuccessMsg(
          `List sent successfully! (${response.data.applicationsCount} applications sent)`
        );
        setTimeout(() => setSuccessMsg(""), 5000);
        setSendListDialogOpen(false);
        fetchPostDetails();
      } else {
        setErrorMsg(response.data.error || "Failed to send list");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    } catch (error) {
      console.error("Error sending list:", error);
      setErrorMsg("Failed to send application list to recruiter");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleViewOffer = async (app) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/offers/by-application/${app.id}`,
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

  const handleDownloadOffer = async (app) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/offers/by-application/${app.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok && response.data.offer) {
        const offer = response.data.offer;

        if (!offer.offer_letter_url) {
          setErrorMsg("No offer letter file available");
          setTimeout(() => setErrorMsg(""), 3000);
          return;
        }

        // Extract base64 data
        const base64Data = offer.offer_letter_url.includes(",")
          ? offer.offer_letter_url.split(",")[1]
          : offer.offer_letter_url;

        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: offer.file_type || "application/pdf",
        });

        // Download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          offer.file_name || `Offer_${offer.company_name}_${offer.position}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setSuccessMsg("Offer letter downloaded successfully");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg("No offer found for this application");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    } catch (error) {
      console.error("Error downloading offer:", error);
      setErrorMsg("Failed to download offer letter");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleApproveOffer = async (app) => {
    try {
      const token = getToken();
      const offerResponse = await axios.get(
        `${BACKEND_URL}/api/offers/by-application/${app.id}`,
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("Offer approved and forwarded to student");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchApplications();
    } catch (error) {
      console.error("Error approving offer:", error);
      setErrorMsg("Failed to approve offer");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleRejectOfferClick = (app) => {
    setSelectedApp(app);
    setRejectOfferDialog(true);
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
      fetchApplications();
    } catch (error) {
      console.error("Error rejecting offer:", error);
      setErrorMsg("Failed to reject offer");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  // Helper function to check if status is offer-pending (supports both formats)
  const isOfferPending = (status) => {
    return status === "offer-pending" || status === "offer_pending";
  };

  // Helper function to check if status is offer-approved (supports both formats)
  const isOfferApproved = (status) => {
    return status === "offer-approved" || status === "offer_approved";
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Loading applications...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        {/* Title and Action Buttons Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          {/* Left Side - Title */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              Applications for {post?.company_name} - {post?.position}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {applications.length} application
              {applications.length !== 1 ? "s" : ""} received
            </Typography>
          </Box>

          {/* Right Side - Action Buttons */}
          {applications.length > 0 && (
            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<SendIcon />}
                variant="contained"
                onClick={handleSendListClick}
                sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
              >
                Send List
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                variant="outlined"
                onClick={handleExportCSV}
                sx={{
                  color: "#10b981",
                  borderColor: "#10b981",
                  "&:hover": {
                    borderColor: "#059669",
                    bgcolor: "rgba(16, 185, 129, 0.08)",
                  },
                }}
              >
                Download CSV
              </Button>
              <Button
                component="label"
                startIcon={<UploadIcon />}
                variant="outlined"
                sx={{
                  color: "#8b5cf6",
                  borderColor: "#8b5cf6",
                  "&:hover": {
                    borderColor: "#7c3aed",
                    bgcolor: "rgba(139, 92, 246, 0.08)",
                  },
                }}
              >
                Upload CSV
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleImportCSV}
                />
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
      {/* Applications Table */}
      {applications.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
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
                  "Applied Date",
                  "Actions",
                ].map((header) => (
                  <TableCell key={header} sx={{ fontWeight: 700 }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {applications
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.full_name}</TableCell>
                    <TableCell>{app.roll_number}</TableCell>
                    <TableCell>{app.branch}</TableCell>
                    <TableCell>{app.current_semester}</TableCell>
                    <TableCell>{app.cgpa}</TableCell>
                    <TableCell>{app.tenth_score}%</TableCell>
                    <TableCell>{app.twelfth_score}%</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          statusLabels[app.application_status] ||
                          app.application_status
                        }
                        size="small"
                        sx={{
                          bgcolor: `${
                            statusColors[app.application_status] || "#64748b"
                          }20`,
                          color:
                            statusColors[app.application_status] || "#64748b",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {/* Show View & Download for any offer status */}
                        {(isOfferPending(app.application_status) ||
                          isOfferApproved(app.application_status)) && (
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
                            <Tooltip title="Download Offer">
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

                        {/* Show Approve & Reject only for pending offers */}
                        {isOfferPending(app.application_status) && (
                          <>
                            <Tooltip title="Forward to Student">
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
                                onClick={() => handleRejectOfferClick(app)}
                                sx={{ color: "#ef4444" }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
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
          />
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="body2" color="text.secondary">
            No applications received for this post yet.
          </Typography>
        </Box>
      )}
      {/* Send List Dialog */}
      <Dialog
        open={sendListDialogOpen}
        onClose={() => setSendListDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Send List</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send the application list for{" "}
            <strong>{post?.company_name}</strong> -{" "}
            <strong>{post?.position}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action can only be performed once.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendListDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmSendList}
            variant="contained"
            sx={{ bgcolor: "#3b82f6" }}
          >
            Confirm Send
          </Button>
        </DialogActions>
      </Dialog>
      {/* View Offer Dialog */}
      <Dialog
        open={offerDialogOpen}
        onClose={() => setOfferDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Offer Letter Details</DialogTitle>
        <DialogContent>
          {selectedOffer && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1">
                  {selectedOffer.company_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Position
                </Typography>
                <Typography variant="body1">
                  {selectedOffer.position}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Salary Package
                </Typography>
                <Typography variant="body1">
                  ₹{selectedOffer.salary_package} LPA
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Joining Date
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedOffer.joining_date).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  {selectedOffer.location}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOfferDialogOpen(false)}>Close</Button>
          {selectedOffer?.offer_letter_url && (
            <Button
              onClick={() =>
                handleDownloadOffer({ id: selectedOffer.application_id })
              }
              variant="contained"
              sx={{ bgcolor: "#10b981" }}
            >
              Download Offer Letter
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
      >
        <DialogTitle>Reject Offer Letter</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectOfferDialog(false);
              setRejectReason("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectOffer}
            variant="contained"
            sx={{ bgcolor: "#ef4444" }}
          >
            Reject Offer
          </Button>
        </DialogActions>
      </Dialog>
      {/* Success/Error Messages */}
      {successMsg && (
        <Alert
          severity="success"
          sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}
          onClose={() => setSuccessMsg("")}
        >
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert
          severity="error"
          sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}
          onClose={() => setErrorMsg("")}
        >
          {errorMsg}
        </Alert>
      )}
    </Box>
  );
}
