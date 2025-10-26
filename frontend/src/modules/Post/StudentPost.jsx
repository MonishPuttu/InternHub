"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Stack,
  Snackbar,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import axios from "axios";
import { BACKEND_URL, INDUSTRIES } from "@/constants/postConstants";
import PostCard from "@/components/Post/PostCard";
import ApplyDialog from "@/components/Post/ApplyDialog";

export default function StudentPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedPosts, setSavedPosts] = useState([]);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    fetchApprovedPosts();
    loadSavedPosts();
  }, []);

  const fetchApprovedPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/posts/approved-posts?limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        const approvedPosts = response.data.posts.filter(
          (post) => post.approval_status === "approved"
        );
        setPosts(approvedPosts);
      }
    } catch (error) {
      console.error("Error fetching approved posts:", error);
      setErrorMsg("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPosts = () => {
    const saved = localStorage.getItem("savedPosts");
    if (saved) {
      setSavedPosts(JSON.parse(saved));
    }
  };

  const toggleSavePost = (postId) => {
    let updated = [...savedPosts];
    if (updated.includes(postId)) {
      updated = updated.filter((id) => id !== postId);
      setSuccessMsg("Post removed from saved");
    } else {
      updated.push(postId);
      setSuccessMsg("Post saved successfully");
    }
    setSavedPosts(updated);
    localStorage.setItem("savedPosts", JSON.stringify(updated));
  };

  const handleApplyClick = (post) => {
    setSelectedPost(post);
    setApplyDialogOpen(true);
  };

  const handleApplySubmit = async (coverLetter, resumeLink) => {
    if (!selectedPost) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/api/student-applications/apply/${selectedPost.id}`,
        {
          cover_letter: coverLetter,
          resume_link: resumeLink,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setSuccessMsg("Application submitted successfully!");
        setApplyDialogOpen(false);
        setSelectedPost(null);
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.error || "Failed to submit application"
      );
    }
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    if (showSavedOnly) {
      filtered = filtered.filter((post) => savedPosts.includes(post.id));
    }

    return filtered.filter((post) => {
      const matchesIndustry =
        filterIndustry === "all" || post.industry === filterIndustry;
      const matchesSearch =
        post.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesIndustry && matchesSearch;
    });
  };

  const filteredPosts = getFilteredPosts();

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: "#e2e8f0" }}>
          Loading available opportunities...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}
        >
          Available Opportunities
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
          Explore and apply to approved internship and job opportunities
        </Typography>

        {/* Stats */}
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Total Opportunities
            </Typography>
            <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 700 }}>
              {posts.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Saved Posts
            </Typography>
            <Typography variant="h6" sx={{ color: "#a78bfa", fontWeight: 700 }}>
              {savedPosts.length}
            </Typography>
          </Box>
        </Stack>

        {/* Search and Filters */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <TextField
            placeholder="Search by position or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#1e293b",
                color: "#e2e8f0",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "#64748b",
                opacity: 1,
              },
            }}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel
              sx={{
                color: "#94a3b8",
                "&.Mui-focused": { color: "#8b5cf6" },
              }}
            >
              Filter by Industry
            </InputLabel>
            <Select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              label="Filter by Industry"
              sx={{
                backgroundColor: "#1e293b",
                color: "#e2e8f0",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334155",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b5cf6",
                },
                "& .MuiSvgIcon-root": { color: "#94a3b8" },
              }}
            >
              <MenuItem value="all">All Industries</MenuItem>
              {INDUSTRIES.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant={showSavedOnly ? "contained" : "outlined"}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            sx={{
              bgcolor: showSavedOnly ? "#8b5cf6" : "transparent",
              color: showSavedOnly ? "white" : "#8b5cf6",
              borderColor: "#8b5cf6",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: showSavedOnly ? "#7c3aed" : "rgba(139, 92, 246, 0.1)",
              },
            }}
          >
            Saved ({savedPosts.length})
          </Button>
        </Stack>
      </Box>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "#1e293b",
            borderRadius: 2,
            border: "1px solid #334155",
          }}
        >
          <Typography variant="h6" sx={{ color: "#e2e8f0", mb: 1 }}>
            {showSavedOnly ? "No saved posts yet" : "No opportunities found"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            {showSavedOnly
              ? "Save posts to view them here"
              : "Try adjusting your filters or search query"}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isSaved={savedPosts.includes(post.id)}
              onToggleSave={() => toggleSavePost(post.id)}
              onApply={() => handleApplyClick(post)}
              onViewDetails={() => router.push(`/Post/postdetails/${post.id}`)}
            />
          ))}
        </Stack>
      )}

      {/* Apply Dialog */}
      <ApplyDialog
        open={applyDialogOpen}
        post={selectedPost}
        onClose={() => setApplyDialogOpen(false)}
        onSubmit={handleApplySubmit}
      />

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
