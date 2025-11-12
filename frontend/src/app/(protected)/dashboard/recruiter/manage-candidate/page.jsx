"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  Close,
  ArrowBack,
  Business,
  AttachFile,
  Send,
  Event,
  VideoCall,
  LocationOn,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function ManageCandidatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    companyname: "",
    position: "",
    packageoffered: "",
    joiningdate: "",
    location: "",
    notes: "",
  });

  const [interviewData, setInterviewData] = useState({
    interviewtype: "online",
    interviewdate: "",
    interviewtime: "",
    location: "",
    meetinglink: "",
    notes: "",
  });

  const [post, setPost] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [interviewScheduled, setInterviewScheduled] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  // ✅ Fetch student & post details
  useEffect(() => {
    const fetchData = async () => {
      const studentId = searchParams.get("studentId");
      const applicationId = searchParams.get("applicationId");
      const postId = searchParams.get("postId");

      if (!studentId || !applicationId || !postId) {
        setError("Missing required parameters");
        setLoadingData(false);
        return;
      }

      try {
        const token = getToken();
        const listsResponse = await axios.get(
          `${BACKEND_URL}/api/student-applications/received-lists`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (listsResponse.data.ok) {
          const lists = listsResponse.data.lists || [];
          const listForPost = lists.find(
            (item) => String(item?.post?.id) === String(postId)
          );

          if (listForPost && listForPost.sent_list) {
            const postData = listForPost.post;
            const apps = listForPost.sent_list?.list_data || [];

            const studentApplication = apps.find(
              (app) => String(app.id) === String(applicationId)
            );

            if (studentApplication) {
              setStudentInfo(studentApplication);
            }

            setPost(postData);
            setFormData((prev) => ({
              ...prev,
              companyname: postData.company_name || "",
              position: postData.position || "",
              packageoffered: postData.package_offered || "",
              location: postData.location || "",
            }));
          } else {
            setError("Post not found for this candidate.");
          }
        } else {
          setError("Failed to load recruiter lists.");
        }
      } catch (err) {
        console.error("Error fetching candidate data:", err);
        setError("Failed to load candidate data.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Input Handlers
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleInterviewInputChange = (e) =>
    setInterviewData({ ...interviewData, [e.target.name]: e.target.value });

  const handleInterviewTypeChange = (e) => {
    const type = e.target.value;
    setInterviewData({
      ...interviewData,
      interviewtype: type,
      location: type === "offline" ? interviewData.location : "",
      meetinglink: type === "online" ? interviewData.meetinglink : "",
    });
  };

  // Convert File → Base64
  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // File Upload Validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!["application/pdf", "image/png"].includes(selectedFile.type)) {
      setError("Only PDF or PNG files allowed.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  // ❌ Reject Candidate
  const handleRejectCandidate = async () => {
    if (!window.confirm("Are you sure you want to reject this candidate?"))
      return;

    setRejectLoading(true);
    setError("");

    try {
      const studentId = searchParams.get("studentId");
      const postId = searchParams.get("postId");
      const applicationId = searchParams.get("applicationId");

      if (!studentId || !postId || !applicationId) {
        setError("Missing required parameters");
        setRejectLoading(false);
        return;
      }

      const payload = {
        applicationId,
        postId,
        rejectionReason: formData.notes || "Candidate rejected by recruiter",
      };

      const token = getToken();
      const response = await axios.post(
        `${BACKEND_URL}/api/offers/reject`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        alert("Candidate rejected successfully!");
        router.push("/dashboard/recruiter");
      } else {
        setError(response.data.error || "Failed to reject candidate");
      }
    } catch (err) {
      console.error("Error rejecting candidate:", err);
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setRejectLoading(false);
    }
  };

  // ✅ Send Offer Letter
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const studentId = searchParams.get("studentId");
      const postId = searchParams.get("postId");
      const applicationId = searchParams.get("applicationId");

      if (!studentId || !postId || !applicationId) {
        setError("Missing required parameters");
        setLoading(false);
        return;
      }

      if (!formData.companyname.trim()) {
        setError("Company name is required");
        setLoading(false);
        return;
      }
      if (!formData.position.trim()) {
        setError("Position is required");
        setLoading(false);
        return;
      }
      if (
        !formData.packageoffered ||
        isNaN(parseFloat(formData.packageoffered))
      ) {
        setError("Please enter a valid package (LPA)");
        setLoading(false);
        return;
      }
      if (!formData.joiningdate.trim()) {
        setError("Joining date is required");
        setLoading(false);
        return;
      }
      if (!formData.location.trim()) {
        setError("Location is required");
        setLoading(false);
        return;
      }
      if (!file) {
        setError("Please attach an offer letter file");
        setLoading(false);
        return;
      }

      const base64File = await convertFileToBase64(file);

      const payload = {
        student_id: studentId,
        post_id: postId,
        application_id: applicationId,
        company_name: formData.companyname,
        position: formData.position,
        package_offered: parseFloat(formData.packageoffered),
        joining_date: formData.joiningdate,
        location: formData.location,
        offer_letter_file: base64File,
        file_name: file.name,
        file_type: file.type,
        notes: formData.notes || "",
      };

      console.log("Sending offer payload:", payload);

      const token = getToken();
      const response = await axios.post(
        `${BACKEND_URL}/api/offers/send`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        alert("Offer letter sent successfully!");
        router.push("/dashboard/recruiter");
      } else {
        setError(response.data.error || "Failed to send offer letter");
      }
    } catch (err) {
      console.error("Error sending offer letter:", err);
      setError(err.response?.data?.error || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UI Render
  if (loadingData)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );

  if (error && !post)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/dashboard/recruiter")}
          sx={{ color: theme.palette.primary.main }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* Back & Candidate Info */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{
            color: theme.palette.primary.main,
            mb: 2,
            "&:hover": { bgcolor: theme.palette.action.hover },
          }}
        >
          Back
        </Button>

        {studentInfo && (
          <Card sx={{ mb: 3, bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Candidate Information
              </Typography>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {studentInfo.full_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Roll Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {studentInfo.roll_number}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Offer Letter Form */}
      <Card sx={{ bgcolor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Business sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Send Offer Letter
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
                mb: 3,
              }}
            >
              <TextField
                label="Company Name"
                name="companyname"
                value={formData.companyname}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Package Offered (LPA)"
                name="packageoffered"
                type="number"
                value={formData.packageoffered}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Joining Date"
                name="joiningdate"
                type="date"
                value={formData.joiningdate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                sx={{ gridColumn: "1 / -1" }}
              />
            </Box>

            {/* File Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Upload Offer Letter (PDF or PNG, max 5MB)
              </Typography>
              <input
                accept=".pdf,.png"
                style={{ display: "none" }}
                id="offer-letter-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="offer-letter-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFile />}
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      borderColor: theme.palette.primary.dark,
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  Choose File
                </Button>
              </label>

              {file && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {file.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {(file.size / 1024).toFixed(1)} KB •{" "}
                      {file.type.split("/")[1].toUpperCase()}
                    </Typography>
                  </Box>
                  <Close
                    onClick={() => setFile(null)}
                    sx={{
                      color: theme.palette.error.main,
                      cursor: "pointer",
                      "&:hover": { color: theme.palette.error.dark },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Submit Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                onClick={handleRejectCandidate}
                startIcon={
                  rejectLoading ? <CircularProgress size={16} /> : <Close />
                }
                disabled={rejectLoading || loading}
                sx={{
                  bgcolor: theme.palette.error.main,
                  "&:hover": { bgcolor: theme.palette.error.dark },
                  color: "white",
                }}
              >
                {rejectLoading ? "Rejecting..." : "Reject Candidate"}
              </Button>

              <Button
                type="submit"
                startIcon={loading ? <CircularProgress size={16} /> : <Send />}
                disabled={loading || rejectLoading}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                  color: "white",
                }}
              >
                {loading ? "Sending..." : "Send Offer Letter"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
