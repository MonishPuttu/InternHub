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
} from "@mui/material";
import {
  Close,
  ArrowBack,
  Business,
  AttachFile,
  Send,
  CheckCircle,
  Cancel,
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

  const [post, setPost] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [offerSent, setOfferSent] = useState(false);
  const [candidateRejected, setCandidateRejected] = useState(false);

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

        // ✅ Fixed: Use correct endpoint for single application
        const applicationResponse = await axios.get(
          `${BACKEND_URL}/api/student-applications/application/${applicationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (applicationResponse.data.ok) {
          const appData = applicationResponse.data.application;
          setStudentInfo(appData);

          const status = appData.application_status;
          setApplicationStatus(status);

          if (
            status === "offer-pending" ||
            status === "offer_pending" ||
            status === "offer-approved" ||
            status === "offer_approved"
          ) {
            setOfferSent(true);
          }

          if (status === "rejected") {
            setCandidateRejected(true);
          }
        }

        // ✅ Fixed: Use correct endpoint for single post
        const postResponse = await axios.get(
          `${BACKEND_URL}/api/student-applications/${postId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (postResponse.data.ok) {
          const postData = postResponse.data.post;
          setPost(postData);
          setFormData((prev) => ({
            ...prev,
            companyname: postData.company_name || "",
            position: postData.position || "",
            packageoffered: postData.package_offered || "",
            location: postData.location || "",
          }));
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

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

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

  const handleRejectCandidate = async () => {
    if (!window.confirm("Are you sure you want to reject this candidate?"))
      return;

    setRejectLoading(true);
    setError("");

    try {
      const studentId = searchParams.get("studentId");
      const postId = searchParams.get("postId");
      const applicationId = searchParams.get("applicationId");

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
        <CircularProgress />
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
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {studentInfo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Candidate Information
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {studentInfo.full_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Roll Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {studentInfo.roll_number}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {studentInfo.branch || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {studentInfo.email || "N/A"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {offerSent && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Offer Letter Already Sent
          </Typography>
          <Typography variant="caption">
            An offer letter has been sent to this candidate and is currently{" "}
            {applicationStatus === "offer-approved" ||
            applicationStatus === "offer_approved"
              ? "approved by placement cell"
              : "pending placement approval"}
            .
          </Typography>
        </Alert>
      )}

      {candidateRejected && (
        <Alert severity="error" icon={<Cancel />} sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Candidate Rejected
          </Typography>
          <Typography variant="caption">
            This candidate has been rejected and cannot receive offer letters.
          </Typography>
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Business color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Send Offer Letter
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                label="Company Name *"
                name="companyname"
                value={formData.companyname}
                onChange={handleInputChange}
                fullWidth
                disabled={offerSent || candidateRejected}
              />
              <TextField
                label="Position *"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                fullWidth
                disabled={offerSent || candidateRejected}
              />
              <TextField
                label="Package Offered (LPA) *"
                name="packageoffered"
                type="number"
                value={formData.packageoffered}
                onChange={handleInputChange}
                fullWidth
                disabled={offerSent || candidateRejected}
              />
              <TextField
                label="Joining Date *"
                name="joiningdate"
                type="date"
                value={formData.joiningdate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={offerSent || candidateRejected}
              />
            </Box>

            <TextField
              label="Location *"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 2 }}
              disabled={offerSent || candidateRejected}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Upload Offer Letter (PDF or PNG, max 5MB)
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFile />}
                disabled={offerSent || candidateRejected}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".pdf,.png"
                  onChange={handleFileChange}
                  disabled={offerSent || candidateRejected}
                />
              </Button>
              {file && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 1,
                    p: 1,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">{file.name}</Typography>
                  <Close
                    onClick={() => setFile(null)}
                    sx={{ cursor: "pointer", color: "error.main" }}
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleRejectCandidate}
                disabled={
                  rejectLoading || loading || offerSent || candidateRejected
                }
              >
                {rejectLoading ? "Rejecting..." : "Reject Candidate"}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
                disabled={
                  loading || rejectLoading || offerSent || candidateRejected
                }
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
