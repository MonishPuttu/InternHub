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
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import PostDetails from "@/modules/Post/postDetails";

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
  const [selectedPostForList, setSelectedPostForList] = useState(null);
  const [applicationsList, setApplicationsList] = useState([]);
  const theme = useTheme();
  const [viewPostDialogOpen, setViewPostDialogOpen] = useState(false);
  const [viewListDialogOpen, setViewListDialogOpen] = useState(false);
  const [viewApplicationsDialogOpen, setViewApplicationsDialogOpen] =
    useState(false);
  const [receivedLists, setReceivedLists] = useState([]);
  const [selectedReceivedList, setSelectedReceivedList] = useState(null);
  const [postAppLoading, setPostAppLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchDashboardData();
    fetchReceivedLists();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch posts
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
          totalApplications: 0, // You can add this later
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
    // Find if there's a received list for this post
    const receivedList = receivedLists.find((list) => list.post.id === post.id);

    if (receivedList) {
      setSelectedReceivedList(receivedList);
      setViewListDialogOpen(true);
    } else {
      // No received list yet - show message or handle accordingly
      console.log("No applications received for this post yet");
      // You could show a snackbar or dialog here
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

      // Create a blob URL and trigger download
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
      // You can add error handling here, like showing a snackbar
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
        sx={{ color: "text.primary", fontWeight: 700, mb: 0.5 }}
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
              bgcolor: "background.paper",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Total Posts
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: "text.primary", fontWeight: 700 }}
            >
              {stats.totalPosts}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "background.paper",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Approved Posts
            </Typography>
            <Typography variant="h4" sx={{ color: "#10b981", fontWeight: 700 }}>
              {stats.approvedPosts}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "background.paper",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Pending Review
            </Typography>
            <Typography variant="h4" sx={{ color: "#fbbf24", fontWeight: 700 }}>
              {stats.pendingPosts}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "background.paper",
              border: "1px solid #334155",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Total Applications
            </Typography>
            <Typography variant="h4" sx={{ color: "#8b5cf6", fontWeight: 700 }}>
              {stats.totalApplications}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card
        sx={{
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
          p: 3,
          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 600, mb: 2 }}
        >
          Quick Actions
        </Typography>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • Go to Posts section to create new job opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • View and manage your posted opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • Check applications from students
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            • The 'View Applications' button is unclickable if no students have applied to your post yet
          </Typography>
        </Stack>
      </Card>

      {/* Approved Posts Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
        >
          Your Approved Posts
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: { xs: 2, sm: 3 },
          }}
        >
          {approvedPosts.map((post) => (
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
                      borderColor: "#64748b",
                      opacity: 0.5,
                    },
                  }}
                >
                  View Applications
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Quick Actions */}
      <Card
        sx={{
          bgcolor: "background.paper",
          border: "1px solid #334155",
          borderRadius: 2,
          p: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 600, mb: 2 }}
        >
          Quick Actions
        </Typography>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • Go to Posts section to create new job opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • View and manage your posted opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • Check applications from students
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            • The 'View Applications' button is unclickable if no students have
            applied to your post yet
          </Typography>
        </Stack>
      </Card>

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

      {/* View Applications List Dialog */}
      <Dialog
        open={viewListDialogOpen}
        onClose={() => setViewListDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogTitle>
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
                  {selectedReceivedList.sent_list.list_data
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
                          {app.tenth_score}%
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid #334155",
                          }}
                        >
                          {app.twelfth_score}%
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid #334155",
                          }}
                        >
                          {selectedReceivedList?.post.company_name}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid #334155",
                          }}
                        >
                          {selectedReceivedList?.post.position}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #334155" }}>
                          <Chip
                            label={app.application_status || "Applied"}
                            size="small"
                            sx={{
                              bgcolor: "#64748b20",
                              color: "text.secondary",
                              border: "1px solid #64748b40",
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
                  borderTop: "1px solid #334155",
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
        <DialogActions>
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
                sx={{
                  bgcolor: "#f59e0b",
                  color: "#1e293b",
                  "&:hover": { bgcolor: "#d97706" },
                }}
              >
                Download CSV
              </Button>
            )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
