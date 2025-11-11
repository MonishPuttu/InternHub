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

        // Fetch post details from received lists
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
            const postData = listForPost.post;
            const apps = listForPost.sent_list?.list_data || [];

            // Find the specific student application
            const studentApplication = apps.find(
              (app) => app.id === applicationId
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
            setError("Post not found");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterviewInputChange = (e) => {
    const { name, value } = e.target;
    setInterviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterviewTypeChange = (e) => {
    setInterviewData((prev) => ({
      ...prev,
      interviewtype: e.target.value,
      location: e.target.value === "offline" ? prev.location : "",
      meetinglink: e.target.value === "online" ? prev.meetinglink : "",
    }));
  };

  const handleSendInterviewInvite = async () => {
    setInterviewLoading(true);
    setError("");

    try {
      const studentId = searchParams.get("studentId");
      const postId = searchParams.get("postId");
      const applicationId = searchParams.get("applicationId");

      if (!studentId || !postId || !applicationId) {
        setError("Missing required parameters");
        setInterviewLoading(false);
        return;
      }

      if (!interviewData.interviewdate || !interviewData.interviewdate.trim()) {
        setError("Please select interview date");
        setInterviewLoading(false);
        return;
      }

      if (!interviewData.interviewtime || !interviewData.interviewtime.trim()) {
        setError("Please select interview time");
        setInterviewLoading(false);
        return;
      }

      if (
        interviewData.interviewtype === "online" &&
        (!interviewData.meetinglink || !interviewData.meetinglink.trim())
      ) {
        setError("Please provide meeting link for online interview");
        setInterviewLoading(false);
        return;
      }

      if (
        interviewData.interviewtype === "offline" &&
        (!interviewData.location || !interviewData.location.trim())
      ) {
        setError("Please provide location for offline interview");
        setInterviewLoading(false);
        return;
      }

      const payload = {
        student_id: studentId,
        post_id: postId,
        application_id: applicationId,
        interviewtype: interviewData.interviewtype,
        interviewdate: interviewData.interviewdate.trim(),
        interviewtime: interviewData.interviewtime.trim(),
      };

      if (interviewData.interviewtype === "offline") {
        payload.location = interviewData.location.trim();
      }

      if (interviewData.interviewtype === "online") {
        payload.meetinglink = interviewData.meetinglink.trim();
      }

      if (interviewData.notes && interviewData.notes.trim()) {
        payload.notes = interviewData.notes.trim();
      }

      const token = getToken();
      const response = await axios.post(
        `${BACKEND_URL}/api/interviews/schedule`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setInterviewScheduled(true);
        setInterviewData({
          interviewtype: "online",
          interviewdate: "",
          interviewtime: "",
          location: "",
          meetinglink: "",
          notes: "",
        });
        alert("Interview invite sent successfully!");
      } else {
        setError(response.data.error || "Failed to send interview invite");
      }
    } catch (err) {
      console.error("Error scheduling interview:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "An error occurred";
      setError(`Failed to schedule interview: ${errorMessage}`);
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!["application/pdf", "image/png"].includes(selectedFile.type)) {
        setError("Only PDF and PNG files are allowed");
        return;
      }

      if (selectedFile.size > 5120000) {
        setError("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRejectCandidate = async () => {
    if (!window.confirm("Are you sure you want to reject this candidate?")) {
      return;
    }

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
        applicationId: applicationId,
        postId: postId,
        rejectionReason: formData.notes || "Candidate rejected by recruiter",
      };

      const token = getToken();
      // FIXED: Changed from /api/offer-letters/reject to /api/offers/reject
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

      if (!formData.companyname || !formData.companyname.trim()) {
        setError("Company name is required");
        setLoading(false);
        return;
      }

      if (!formData.position || !formData.position.trim()) {
        setError("Position is required");
        setLoading(false);
        return;
      }

      if (
        !formData.packageoffered ||
        !formData.packageoffered.trim() ||
        isNaN(parseFloat(formData.packageoffered))
      ) {
        setError("Please enter a valid package offered (numeric value)");
        setLoading(false);
        return;
      }

      if (!formData.joiningdate || !formData.joiningdate.trim()) {
        setError("Joining date is required");
        setLoading(false);
        return;
      }

      if (!formData.location || !formData.location.trim()) {
        setError("Location is required");
        setLoading(false);
        return;
      }

      if (!file) {
        setError("Please select an offer letter file");
        setLoading(false);
        return;
      }

      const base64File = await convertFileToBase64(file);

      const payload = {
        studentId: studentId,
        postId: postId,
        applicationId: applicationId,
        position: formData.position,
        salary: parseFloat(formData.packageoffered),
        joiningDate: formData.joiningdate,
        location: formData.location,
        offerletterbase64: base64File,
        filename: file.name,
        filetype: file.type,
      };

      const token = getToken();
      // FIXED: Changed from /api/offer-letters/send to /api/offers/send
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
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
  }

  if (error && !post) {
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
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{
            color: theme.palette.primary.main,
            mb: 2,
            "&:hover": {
              bgcolor: theme.palette.action.hover,
            },
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
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                  >
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
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                  >
                    {studentInfo.roll_number}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Branch
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                  >
                    {studentInfo.branch}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    CGPA
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                  >
                    {studentInfo.cgpa}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Common Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {interviewScheduled && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Interview invite sent successfully! The student will be notified.
        </Alert>
      )}

      {/* Schedule Interview Card */}
      <Card sx={{ mb: 3, bgcolor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Event sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
            >
              Schedule Interview
            </Typography>
          </Box>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel
              component="legend"
              sx={{ color: theme.palette.text.secondary, mb: 1 }}
            >
              Interview Type
            </FormLabel>
            <RadioGroup
              row
              name="interviewtype"
              value={interviewData.interviewtype}
              onChange={handleInterviewTypeChange}
            >
              <FormControlLabel
                value="online"
                control={
                  <Radio
                    sx={{
                      color: theme.palette.primary.main,
                      "&.Mui-checked": { color: theme.palette.primary.main },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <VideoCall sx={{ mr: 0.5, fontSize: 18 }} />
                    <Box sx={{ color: theme.palette.text.primary }}>Online</Box>
                  </Box>
                }
              />
              <FormControlLabel
                value="offline"
                control={
                  <Radio
                    sx={{
                      color: theme.palette.primary.main,
                      "&.Mui-checked": { color: theme.palette.primary.main },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LocationOn sx={{ mr: 0.5, fontSize: 18 }} />
                    <Box sx={{ color: theme.palette.text.primary }}>
                      Offline
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
              mb: 3,
            }}
          >
            <TextField
              fullWidth
              label="Interview Date"
              name="interviewdate"
              type="date"
              value={interviewData.interviewdate}
              onChange={handleInterviewInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              label="Interview Time"
              name="interviewtime"
              type="time"
              value={interviewData.interviewtime}
              onChange={handleInterviewInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>

          {interviewData.interviewtype === "online" && (
            <TextField
              fullWidth
              label="Meeting Link"
              name="meetinglink"
              value={interviewData.meetinglink}
              onChange={handleInterviewInputChange}
              placeholder="https://meet.google.com/..."
              required
              sx={{ mb: 3 }}
            />
          )}

          {interviewData.interviewtype === "offline" && (
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={interviewData.location}
              onChange={handleInterviewInputChange}
              placeholder="Company office address"
              required
              sx={{ mb: 3 }}
            />
          )}

          <TextField
            fullWidth
            label="Interview Notes"
            name="notes"
            value={interviewData.notes}
            onChange={handleInterviewInputChange}
            multiline
            rows={3}
            placeholder="Additional instructions for the candidate..."
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={handleSendInterviewInvite}
              variant="contained"
              startIcon={
                interviewLoading ? <CircularProgress size={16} /> : <Send />
              }
              disabled={interviewLoading}
              sx={{
                bgcolor: theme.palette.primary.main,
                "&:hover": { bgcolor: theme.palette.primary.dark },
                px: 4,
                py: 1.5,
              }}
            >
              {interviewLoading ? "Sending..." : "Send Interview Invite"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Offer Details Form */}
      <Card sx={{ mb: 3, bgcolor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Business sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
            >
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
                fullWidth
                label="Company Name"
                name="companyname"
                value={formData.companyname}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Package Offered (LPA)"
                name="packageoffered"
                type="number"
                value={formData.packageoffered}
                onChange={handleInputChange}
                required
                inputProps={{ step: 0.01 }}
              />

              <TextField
                fullWidth
                label="Joining Date"
                name="joiningdate"
                type="date"
                value={formData.joiningdate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />

              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Job location"
                required
                sx={{ gridColumn: "1 / -1" }}
              />
            </Box>

            {/* File Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mb: 2 }}
              >
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
                    minWidth: 200,
                    py: 1.5,
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
                    bgcolor: theme.palette.background.default,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {(file.size / 1024).toFixed(2)} KB •{" "}
                      {file.type.split("/")[1].toUpperCase()}
                    </Typography>
                  </Box>
                  <Close
                    onClick={() => setFile(null)}
                    sx={{
                      color: theme.palette.error.main,
                      cursor: "pointer",
                      fontSize: "small",
                      "&:hover": { color: theme.palette.error.dark },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 3,
              }}
            >
              <Button
                onClick={handleRejectCandidate}
                variant="contained"
                startIcon={
                  rejectLoading ? <CircularProgress size={16} /> : <Close />
                }
                disabled={rejectLoading || loading}
                sx={{
                  bgcolor: theme.palette.error.main,
                  "&:hover": { bgcolor: theme.palette.error.dark },
                  px: 4,
                  py: 1.5,
                }}
              >
                {rejectLoading ? "Rejecting..." : "Reject Candidate"}
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <Send />}
                disabled={loading || rejectLoading}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                  px: 4,
                  py: 1.5,
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
