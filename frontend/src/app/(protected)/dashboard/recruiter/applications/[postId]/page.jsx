"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  ManageAccounts as ManageAccountsIcon,
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
  offer_pending: "#f59e0b",
};

const statusLabels = {
  applied: "Applied",
  interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed",
  offer: "Offer",
  rejected: "Rejected",
  offer_pending: "Offer Pending",
};

export default function RecruiterApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId;

  const [applications, setApplications] = useState([]);
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [listId, setListId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (postId) {
      fetchApplicationsForPost();
    }
  }, [postId]);

  const fetchApplicationsForPost = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const listsResponse = await axios.get(
        `${BACKEND_URL}/api/student-applications/received-lists`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (listsResponse.data.ok) {
        const lists = listsResponse.data.lists || [];
        const listForPost = lists.find((item) => item?.post?.id === postId);

        if (listForPost && listForPost.sent_list) {
          const apps = listForPost.sent_list?.list_data || [];
          setApplications(apps);
          setPostDetails(listForPost.post || null);
          setListId(listForPost.sent_list?.id || null);
        } else {
          setApplications([]);
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setErrorMsg("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!listId) {
      setErrorMsg("No list ID found");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/student-applications/received-list/${listId}/download`,
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
        `${postDetails?.company_name || "applications"}_${
          postDetails?.position || "list"
        }.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg("CSV downloaded successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setErrorMsg("Failed to download CSV");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleManageCandidate = (app) => {
    router.push(
      `/dashboard/recruiter/manage-candidate?studentId=${app.student_id}&applicationId=${app.id}&postId=${postId}`
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            mb: 2,
            color: "primary.main",
            "&:hover": { bgcolor: "rgba(139, 92, 246, 0.08)" },
          }}
        >
          BACK
        </Button>

        {postDetails && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
              >
                Applications for {postDetails.company_name} -{" "}
                {postDetails.position}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {applications.length} application
                {applications.length !== 1 ? "s" : ""} received
              </Typography>
            </Box>

            {/* Download Button - Top Right */}
            {applications.length > 0 && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadCSV}
                sx={{
                  bgcolor: "#10b981",
                  "&:hover": { bgcolor: "#059669" },
                  textTransform: "none",
                }}
              >
                DOWNLOAD CSV
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Applications Table */}
      {applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "background.paper" }}>
          <Typography color="text.secondary" variant="h6">
            No applications received for this post yet
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Applications will appear here once the placement cell sends them
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{ bgcolor: "background.paper", borderRadius: 1 }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "background.default" }}>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Student Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Roll Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Branch
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Semester
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    CGPA
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    10th
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    12th
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Applied Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: "text.primary" }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((app, index) => (
                    <TableRow
                      key={app?.id || index}
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <TableCell sx={{ color: "text.primary" }}>
                        {app?.full_name || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {app?.roll_number || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {app?.branch || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {app?.current_semester || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {app?.cgpa || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {app?.tenth_score || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {app?.twelfth_score || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            statusLabels[app?.application_status] ||
                            app?.application_status ||
                            "Applied"
                          }
                          size="small"
                          sx={{
                            bgcolor:
                              statusColors[app?.application_status] ||
                              "#64748b",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {app?.applied_at
                          ? new Date(app.applied_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ManageAccountsIcon />}
                          onClick={() => handleManageCandidate(app)}
                          sx={{
                            bgcolor: "#8b5cf6",
                            "&:hover": { bgcolor: "#7c3aed" },
                            textTransform: "none",
                            px: 2,
                          }}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={applications.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              bgcolor: "background.paper",
              color: "text.primary",
              borderRadius: "0 0 8px 8px",
            }}
          />
        </>
      )}

      {/* Notifications */}
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
