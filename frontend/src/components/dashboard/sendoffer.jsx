"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    IconButton,
    Card,
    CardContent,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
} from "@mui/material";
import { Close, ArrowBack, Business, AttachFile, Send, Event, VideoCall, LocationOn } from "@mui/icons-material";
import axios from "axios";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function SendOfferPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        company_name: "",
        position: "",
        package_offered: "",
        joining_date: "",
        notes: "",
    });
    const [interviewData, setInterviewData] = useState({
        interview_type: "online",
        interview_date: "",
        interview_time: "",
        location: "",
        meeting_link: "",
        notes: "",
    });
    const [post, setPost] = useState(null);
    const [application, setApplication] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [interviewLoading, setInterviewLoading] = useState(false);
    const [error, setError] = useState("");
    const [loadingData, setLoadingData] = useState(true);
    const [interviewScheduled, setInterviewScheduled] = useState(false);
    const [hasInterview, setHasInterview] = useState(false);
    const [interviewPassed, setInterviewPassed] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [interviewDetails, setInterviewDetails] = useState(null);
    const [markCompletedLoading, setMarkCompletedLoading] = useState(false);



    useEffect(() => {
        const fetchData = async () => {
            const studentId = searchParams.get('studentId');
            const applicationId = searchParams.get('applicationId');
            const postId = searchParams.get('postId');

            if (!studentId || !applicationId || !postId) {
                setError("Missing required parameters");
                setLoadingData(false);
                return;
            }

            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

                // Fetch post details
                const postResponse = await axios.get(
                    `${BACKEND_URL}/api/posts/applications/${postId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Fetch application details
                const applicationResponse = await axios.get(
                    `${BACKEND_URL}/api/student-applications/${applicationId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (postResponse.data.ok) {
                    setPost(postResponse.data.application);
                    setFormData(prev => ({
                        ...prev,
                        company_name: postResponse.data.application.company_name || "",
                        position: postResponse.data.application.position || "",
                        package_offered: postResponse.data.application.package_offered || "",
                    }));
                }
                if (applicationResponse.data.ok) {
                    setApplication(applicationResponse.data.application);
                }

                // Fetch existing interview for this application
                const interviewResponse = await axios.get(
                    `${BACKEND_URL}/api/interviews/recruiter`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (interviewResponse.data.ok) {
                    const interviews = interviewResponse.data.interviews;
                    const relevantInterview = interviews.find(
                        interview => interview.application_id === applicationId
                    );

                    if (relevantInterview) {
                        setHasInterview(true);
                        setInterviewDetails(relevantInterview);
                        setInterviewPassed(relevantInterview.status === 'completed');
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

    // Periodic check for interview time passing (every minute)
    useEffect(() => {
        if (!interviewDetails || interviewDetails.status === 'completed') {
            return;
        }

        const interval = setInterval(() => {
            const timePassed = checkInterviewTimePassed(
                interviewDetails.interview_date,
                interviewDetails.interview_time
            );

            if (timePassed) {
                autoUpdateInterviewStatus(interviewDetails);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [interviewDetails]);

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
            interview_type: e.target.value,
            location: e.target.value === "offline" ? prev.location : "",
            meeting_link: e.target.value === "online" ? prev.meeting_link : "",
        }));
    };

    const handleMarkInterviewCompleted = async () => {
        setMarkCompletedLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication token not found. Please log in again.");
                setMarkCompletedLoading(false);
                return;
            }

            const response = await axios.put(
                `${BACKEND_URL}/api/interviews/${interviewDetails.id}/status`,
                { status: "completed" },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            if (response.data.ok) {
                // Update the local state to reflect the change
                setInterviewDetails(prev => ({
                    ...prev,
                    status: 'completed'
                }));
                setInterviewPassed(true);
                alert("Interview marked as completed successfully!");
            } else {
                setError(response.data.error || "Failed to update interview status");
            }
        } catch (err) {
            console.error("Error updating interview status:", err);
            setError(err.response?.data?.error || "An error occurred while updating interview status");
        } finally {
            setMarkCompletedLoading(false);
        }
    };

    const handleSendInterviewInvite = async () => {
        setInterviewLoading(true);
        setError("");

        try {
            // Get the IDs from URL params directly
            const studentId = searchParams.get('studentId');
            const postId = searchParams.get('postId');
            const applicationId = searchParams.get('applicationId');

            console.log("URL Parameters:", { studentId, postId, applicationId });
            console.log("Interview Data State:", interviewData);

            if (!studentId || !postId || !applicationId) {
                setError("Missing required parameters");
                setInterviewLoading(false);
                return;
            }

            // Validate date and time are not empty strings
            if (!interviewData.interview_date || interviewData.interview_date.trim() === "") {
                setError("Please select interview date");
                setInterviewLoading(false);
                return;
            }

            if (!interviewData.interview_time || interviewData.interview_time.trim() === "") {
                setError("Please select interview time");
                setInterviewLoading(false);
                return;
            }

            if (interviewData.interview_type === "online" && (!interviewData.meeting_link || interviewData.meeting_link.trim() === "")) {
                setError("Please provide meeting link for online interview");
                setInterviewLoading(false);
                return;
            }

            if (interviewData.interview_type === "offline" && (!interviewData.location || interviewData.location.trim() === "")) {
                setError("Please provide location for offline interview");
                setInterviewLoading(false);
                return;
            }

            // Build payload - ensure no empty strings
            const payload = {
                student_id: studentId,
                post_id: postId,
                application_id: applicationId,
                interview_type: interviewData.interview_type,
                interview_date: interviewData.interview_date.trim(),
                interview_time: interviewData.interview_time.trim(),
            };

            // Add location for offline interviews
            if (interviewData.interview_type === "offline") {
                payload.location = interviewData.location.trim();
            }

            // Add meeting_link for online interviews
            if (interviewData.interview_type === "online") {
                payload.meeting_link = interviewData.meeting_link.trim();
            }

            // Only add notes if it's not empty
            if (interviewData.notes && interviewData.notes.trim()) {
                payload.notes = interviewData.notes.trim();
            }

            // Detailed logging
            console.log("=== INTERVIEW PAYLOAD DEBUG ===");
            console.log("Full payload:", JSON.stringify(payload, null, 2));
            console.log("Field validation:");
            Object.entries(payload).forEach(([key, value]) => {
                const status = value === null ? '[NULL]' : value === '' ? '[EMPTY STRING]' : value === undefined ? '[UNDEFINED]' : '[OK]';
                console.log(`  ${key}: "${value}" (${typeof value}) ${status}`);
            });

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication token not found. Please log in again.");
                setInterviewLoading(false);
                return;
            }

            console.log("Sending request to:", `${BACKEND_URL}/api/interviews/schedule`);

            const response = await axios.post(
                `${BACKEND_URL}/api/interviews/schedule`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            console.log("Success response:", response.data);

            if (response.data.ok) {
                setInterviewScheduled(true);
                setHasInterview(true);
                setInterviewDetails(response.data.interview);

                // Clear the form
                setInterviewData({
                    interview_type: "online",
                    interview_date: "",
                    interview_time: "",
                    location: "",
                    meeting_link: "",
                    notes: "",
                });

                alert("Interview invite sent successfully!");
            } else {
                setError(response.data.error || "Failed to send interview invite");
            }
        } catch (err) {
            console.error("=== ERROR DETAILS ===");
            console.error("Error object:", err);
            console.error("Response status:", err.response?.status);
            console.error("Response data:", JSON.stringify(err.response?.data, null, 2));
            console.error("Request that failed:", err.config?.data);

            // Check if it's a network error
            if (!err.response) {
                setError("Network error: Could not connect to server. Please check if the backend is running on " + BACKEND_URL);
            } else {
                // More user-friendly error message
                const errorMessage = err.response?.data?.error
                    || err.response?.data?.message
                    || err.message
                    || "An error occurred";

                setError(`Failed to schedule interview: ${errorMessage}`);
            }
        } finally {
            setInterviewLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            if (!["application/pdf", "image/png"].includes(selectedFile.type)) {
                setError("Only PDF and PNG files are allowed");
                return;
            }
            // Validate file size (50KB)
            if (selectedFile.size > 51200) {
                setError("File size must be less than 50KB");
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
        setRejectLoading(true);
        setError("");

        try {
            const studentId = searchParams.get('studentId');
            const postId = searchParams.get('postId');
            const applicationId = searchParams.get('applicationId');

            if (!studentId || !postId || !applicationId) {
                setError("Missing required parameters");
                setRejectLoading(false);
                return;
            }

            const payload = {
                student_id: parseInt(studentId, 10),
                post_id: parseInt(postId, 10),
                application_id: parseInt(applicationId, 10),
                company_name: formData.company_name || "N/A",
                position: formData.position || "N/A",
                package_offered: parseFloat(formData.package_offered) || 0,
                notes: formData.notes || "Candidate rejected after interview",
            };

            console.log("Sending reject payload:", payload);

            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${BACKEND_URL}/api/offer-letters/reject`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
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
            console.error("Error response:", err.response?.data);
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
            const studentId = searchParams.get('studentId');
            const postId = searchParams.get('postId');
            const applicationId = searchParams.get('applicationId');

            if (!studentId || !postId || !applicationId) {
                setError("Missing required parameters");
                setLoading(false);
                return;
            }

            // Validate required form fields
            if (!formData.company_name || formData.company_name.trim() === "") {
                setError("Company name is required");
                setLoading(false);
                return;
            }

            if (!formData.position || formData.position.trim() === "") {
                setError("Position is required");
                setLoading(false);
                return;
            }

            if (!formData.package_offered || formData.package_offered.trim() === "" || isNaN(parseFloat(formData.package_offered))) {
                setError("Please enter a valid package offered (numeric value)");
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
                student_id: studentId,
                post_id: postId,
                application_id: applicationId,
                company_name: formData.company_name,
                position: formData.position,
                package_offered: parseFloat(formData.package_offered),
                joining_date: formData.joining_date || null,
                offer_letter_file: base64File,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size.toString(),
                notes: formData.notes || null,
            };

            console.log("Sending offer letter payload:", {
                ...payload,
                offer_letter_file: "[BASE64_DATA]" // Don't log the entire base64
            });

            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${BACKEND_URL}/api/offer-letters/send`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
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
            console.error("Error response:", err.response?.data);
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
                <CircularProgress sx={{ color: "#8b5cf6" }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push("/dashboard/recruiter")}
                    sx={{ color: "#8b5cf6" }}
                >
                    Back to Dashboard
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push("/dashboard/recruiter")}
                    sx={{ color: "#8b5cf6", mr: 2 }}
                >
                    Back
                </Button>
            </Box>

            {/* Common Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Scheduled Interview Details Card */}
            {hasInterview && interviewDetails && (
                <Card sx={{ mb: 3, bgcolor: "#1e293b", border: "1px solid #334155" }}>
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                            <Event sx={{ color: "#8b5cf6", mr: 1 }} />
                            <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                Scheduled Interview Details
                            </Typography>
                        </Box>

                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
                            <Box>
                                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                                    Interview Date & Time
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                                    {new Date(interviewDetails.interview_date).toLocaleDateString()} at {interviewDetails.interview_time}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                                    Interview Type
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                                    {interviewDetails.interview_type === "online" ? "Online" : "Offline"}
                                </Typography>
                            </Box>
                            {interviewDetails.interview_type === "online" && interviewDetails.meeting_link && (
                                <Box sx={{ gridColumn: "1 / -1" }}>
                                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                                        Meeting Link
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "#8b5cf6" }}>
                                        <a href={interviewDetails.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6" }}>
                                            {interviewDetails.meeting_link}
                                        </a>
                                    </Typography>
                                </Box>
                            )}
                            {interviewDetails.interview_type === "offline" && interviewDetails.location && (
                                <Box sx={{ gridColumn: "1 / -1" }}>
                                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                                        Location
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                                        {interviewDetails.location}
                                    </Typography>
                                </Box>
                            )}
                            {interviewDetails.notes && (
                                <Box sx={{ gridColumn: "1 / -1" }}>
                                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                                        Notes
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                                        {interviewDetails.notes}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                    Status:
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: interviewDetails.status === 'completed' ? "#10b981" : "#fbbf24",
                                        fontWeight: 600
                                    }}
                                >
                                    {interviewDetails.status === 'completed' ? 'Completed' : 'Scheduled'}
                                </Typography>
                            </Box>
                            {interviewDetails.status === 'scheduled' && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleMarkInterviewCompleted}
                                    disabled={markCompletedLoading}
                                    sx={{
                                        borderColor: "#10b981",
                                        color: "#10b981",
                                        "&:hover": { borderColor: "#059669", bgcolor: "rgba(16, 185, 129, 0.1)" }
                                    }}
                                >
                                    {markCompletedLoading ? "Updating..." : "Mark as Completed"}
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {interviewPassed && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Interview has been completed for this candidate. You can now proceed with sending an offer letter.
                </Alert>
            )}

            {/* Schedule Interview Card - Only show if no interview has been scheduled */}
            {!hasInterview && (
                <Card sx={{ mb: 3, bgcolor: "#1e293b", border: "1px solid #334155" }}>
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                            <Event sx={{ color: "#8b5cf6", mr: 1 }} />
                            <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                Schedule Interview
                            </Typography>
                        </Box>

                        <FormControl component="fieldset" sx={{ mb: 3 }}>
                            <FormLabel component="legend" sx={{ color: "#94a3b8", mb: 1 }}>
                                Interview Type
                            </FormLabel>
                            <RadioGroup
                                row
                                name="interview_type"
                                value={interviewData.interview_type}
                                onChange={handleInterviewTypeChange}
                            >
                                <FormControlLabel
                                    value="online"
                                    control={<Radio sx={{ color: "#8b5cf6", '&.Mui-checked': { color: "#8b5cf6" } }} />}
                                    label={
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <VideoCall sx={{ mr: 0.5, fontSize: 18 }} />
                                            Online
                                        </Box>
                                    }
                                    sx={{ color: "#e2e8f0" }}
                                />
                                <FormControlLabel
                                    value="offline"
                                    control={<Radio sx={{ color: "#8b5cf6", '&.Mui-checked': { color: "#8b5cf6" } }} />}
                                    label={
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <LocationOn sx={{ mr: 0.5, fontSize: 18 }} />
                                            Offline
                                        </Box>
                                    }
                                    sx={{ color: "#e2e8f0" }}
                                />
                            </RadioGroup>
                        </FormControl>

                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Interview Date"
                                name="interview_date"
                                type="date"
                                value={interviewData.interview_date}
                                onChange={handleInterviewInputChange}
                                InputLabelProps={{ shrink: true }}
                                required
                                sx={{
                                    "& .MuiInputBase-root": { bgcolor: "#0f172a", color: "#e2e8f0" },
                                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#334155" },
                                        "&:hover fieldset": { borderColor: "#8b5cf6" },
                                        "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Interview Time"
                                name="interview_time"
                                type="time"
                                value={interviewData.interview_time}
                                onChange={handleInterviewInputChange}
                                InputLabelProps={{ shrink: true }}
                                required
                                sx={{
                                    "& .MuiInputBase-root": { bgcolor: "#0f172a", color: "#e2e8f0" },
                                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#334155" },
                                        "&:hover fieldset": { borderColor: "#8b5cf6" },
                                        "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                    },
                                }}
                            />
                        </Box>

                        {interviewData.interview_type === "online" && (
                            <TextField
                                fullWidth
                                label="Meeting Link"
                                name="meeting_link"
                                value={interviewData.meeting_link}
                                onChange={handleInterviewInputChange}
                                placeholder="https://meet.google.com/..."
                                required
                                sx={{
                                    mb: 3,
                                    "& .MuiInputBase-root": { bgcolor: "#0f172a", color: "#e2e8f0" },
                                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#334155" },
                                        "&:hover fieldset": { borderColor: "#8b5cf6" },
                                        "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                    },
                                }}
                            />
                        )}

                        {interviewData.interview_type === "offline" && (
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={interviewData.location}
                                onChange={handleInterviewInputChange}
                                placeholder="Company office address"
                                required
                                sx={{
                                    mb: 3,
                                    "& .MuiInputBase-root": { bgcolor: "#0f172a", color: "#e2e8f0" },
                                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#334155" },
                                        "&:hover fieldset": { borderColor: "#8b5cf6" },
                                        "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                    },
                                }}
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
                            sx={{
                                mb: 3,
                                "& .MuiInputBase-root": { bgcolor: "#0f172a", color: "#e2e8f0" },
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                onClick={handleSendInterviewInvite}
                                variant="contained"
                                startIcon={interviewLoading ? <CircularProgress size={16} /> : <Send />}
                                disabled={interviewLoading}
                                sx={{
                                    bgcolor: "#8b5cf6",
                                    "&:hover": { bgcolor: "#7c3aed" },
                                    "&:disabled": { bgcolor: "#64748b" },
                                    px: 4,
                                    py: 1.5,
                                }}
                            >
                                {interviewLoading ? "Sending..." : "Send Interview Invite"}
                            </Button>
                        </Box>

                        {interviewScheduled && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Interview invite sent successfully! The student will be notified.
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Offer Details Form */}
            <Card sx={{ mb: 3, bgcolor: "#1e293b", border: "1px solid #334155" }}>
                <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Business sx={{ color: "#8b5cf6", mr: 1 }} />
                        <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                            Offer Details
                        </Typography>
                    </Box>

                    {!interviewPassed && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Offer details will be enabled after the interview is completed.
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Company Name"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleInputChange}
                                required
                                disabled={!interviewPassed}
                                sx={{
                                    "& .MuiInputBase-root": { bgcolor: "#0f172a", color: "#e2e8f0" },
                                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#334155" },
                                        "&:hover fieldset": { borderColor: "#8b5cf6" },
                                        "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Position"
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                required
                                disabled={!interviewPassed}
                                sx={{
                                    "& .MuiInputBase-root": { bgcolor: "#0f172a", color: "#e2e8f0" },
                                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#334155" },
                                        "&:hover fieldset": { borderColor: "#8b5cf6" },
                                        "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Package Offered (LPA)"
                                name="package_offered"
                                type="number"
                                value={formData.package_offered}
                                onChange={handleInputChange}
                                required
                                inputProps={{ step: "0.01" }}
                                disabled={!interviewPassed}
                                sx={{
                                    "& .MuiInputBase-root": { bgcolor: "#0f172a", color: "#e2e8f0" },
                                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#334155" },
                                        "&:hover fieldset": { borderColor: "#8b5cf6" },
                                        "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Joining Date"
                                name="joining_date"
                                type="date"
                                value={formData.joining_date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                disabled={!interviewPassed}
                                sx={{
                                    "& .MuiInputBase-root": { bgcolor: "#0f172a", color: "#e2e8f0" },
                                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#334155" },
                                        "&:hover fieldset": { borderColor: "#8b5cf6" },
                                        "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                    },
                                }}
                            />
                        </Box>

                        {/* File Upload Card */}
                        <Card sx={{ mb: 3, bgcolor: "#1e293b", border: "1px solid #334155" }}>
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <AttachFile sx={{ color: "#8b5cf6", mr: 1 }} />
                                    <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                                        Upload Offer Letter
                                    </Typography>
                                </Box>

                                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
                                    Please upload the offer letter document (PDF or PNG, max 50KB)
                                </Typography>
                                <input
                                    accept=".pdf,.png"
                                    style={{ display: "none" }}
                                    id="offer-letter-file"
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={!interviewPassed}
                                />
                                <label htmlFor="offer-letter-file">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<AttachFile />}
                                        sx={{
                                            borderColor: "#8b5cf6",
                                            color: "#8b5cf6",
                                            "&:hover": { borderColor: "#7c3aed", bgcolor: "rgba(139, 92, 246, 0.1)" },
                                            "&:disabled": { borderColor: "#64748b", color: "#64748b" },
                                            minWidth: 200,
                                            py: 1.5,
                                        }}
                                    >
                                        Choose File
                                    </Button>
                                </label>
                                {file && (
                                    <Box sx={{
                                        mt: 2,
                                        p: 2,
                                        bgcolor: "#0f172a",
                                        borderRadius: 1,
                                        border: "1px solid #334155",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: "#e2e8f0", fontWeight: 500 }}>
                                                {file.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                                {(file.size / 1024).toFixed(2)} KB • {file.type.split('/')[1].toUpperCase()}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            onClick={() => setFile(null)}
                                            size="small"
                                            sx={{ color: "#ef4444" }}
                                        >
                                            <Close fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons inside the form */}
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
                            <Button
                                onClick={() => router.push("/dashboard/recruiter")}
                                variant="outlined"
                                sx={{
                                    borderColor: "#64748b",
                                    color: "#94a3b8",
                                    "&:hover": { borderColor: "#475569", bgcolor: "rgba(71, 85, 105, 0.1)" }
                                }}
                                disabled={!interviewPassed}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRejectCandidate}
                                variant="contained"
                                startIcon={rejectLoading ? <CircularProgress size={16} /> : <Close />}
                                disabled={!interviewPassed}

                                sx={{
                                    bgcolor: "#ef4444",
                                    "&:hover": { bgcolor: "#dc2626" },
                                    "&:disabled": { bgcolor: "#64748b" },
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
                                disabled={!interviewPassed}
                                sx={{
                                    bgcolor: "#8b5cf6",
                                    "&:hover": { bgcolor: "#7c3aed" },
                                    "&:disabled": { bgcolor: "#64748b" },
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