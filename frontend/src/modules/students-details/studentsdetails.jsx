"use client";
import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    Stack,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TextField,
} from "@mui/material";
import {
    Add as AddIcon,
    CloudUpload as CloudUploadIcon,
    ContentCopy as ContentCopyIcon,
    Download as DownloadIcon,
    People as PeopleIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    VpnKey as VpnKeyIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function StudentDetailsManagement() {
    const [formUrl, setFormUrl] = useState("");
    const [showFormDialog, setShowFormDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResults, setUploadResults] = useState(null);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0 });
    const [loading, setLoading] = useState(false);
    const [downloadingLogins, setDownloadingLogins] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        fetchStats();
        fetchStudents();
    }, []);

    const fetchStats = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${BACKEND_URL}/api/bulk-upload/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.ok) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${BACKEND_URL}/api/bulk-upload/students`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.ok) {
                setStudents(response.data.students);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const handleGenerateForm = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.post(
                `${BACKEND_URL}/api/bulk-upload/generate-form`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.ok) {
                setFormUrl(response.data.formUrl);
                setShowFormDialog(true);
                setSuccessMsg("Form generated successfully!");
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.error || "Failed to generate form");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(formUrl);
        setSuccessMsg("Form URL copied to clipboard!");
    };

    const handleCopyAdditionalForm = () => {
        const additionalFormUrl = "https://docs.google.com/forms/d/18mEIULw5mpvS95FrBv4cVF3pBHbkd6IfP1dqNi0b1Bg";
        navigator.clipboard.writeText(additionalFormUrl);
        setSuccessMsg("Additional form URL copied to clipboard!");
    };

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const validTypes = [
                "text/csv",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ];
            if (!validTypes.includes(file.type)) {
                setErrorMsg("Please select a valid CSV or Excel file");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleBulkUpload = async () => {
        if (!selectedFile) {
            setErrorMsg("Please select a file first");
            return;
        }

        try {
            setLoading(true);
            const token = getToken();
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await axios.post(
                `${BACKEND_URL}/api/bulk-upload/bulk-upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.ok) {
                setUploadResults(response.data.results);
                setSuccessMsg(
                    `Upload complete! ${response.data.results.successful} students added successfully.`
                );
                setShowUploadDialog(false);
                setSelectedFile(null);
                fetchStats();
                fetchStudents();
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.error || "Failed to upload file");
        } finally {
            setLoading(false);
        }
    };

    // const handleDownloadTemplate = async () => {
    //     try {
    //         const token = getToken();
    //         const response = await axios.get(
    //             `${BACKEND_URL}/api/bulk-upload/download-template`,
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //                 responseType: "blob",
    //             }
    //         );

    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         const link = document.createElement("a");
    //         link.href = url;
    //         link.setAttribute("download", "student_details_template.csv");
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //     } catch (error) {
    //         setErrorMsg("Failed to download template");
    //     }
    // };

    const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);

    const handleDownloadLoginDetails = async () => {
        try {
            setDownloadingLogins(true);
            setShowPasswordResetDialog(false);
            const token = getToken();
            const response = await axios.get(
                `${BACKEND_URL}/api/bulk-upload/download-login-details`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            const filename = `student_login_details_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setSuccessMsg("Login details downloaded! All student passwords have been reset to 'student123'");
        } catch (error) {
            setErrorMsg(error.response?.data?.error || "Failed to download login details");
        } finally {
            setDownloadingLogins(false);
        }
    };

    const handleEditStudent = async (student) => {
        try {
            const token = getToken();
            const response = await axios.get(
                `${BACKEND_URL}/api/bulk-upload/students/${student.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.ok) {
                setEditingStudent(response.data.student);
                setEditFormData({
                    full_name: response.data.student.full_name || "",
                    email: response.data.student.email || "",
                    roll_number: response.data.student.roll_number || "",
                    student_id: response.data.student.student_id || "",
                    branch: response.data.student.branch || "",
                    current_semester: response.data.student.current_semester || "",
                    cgpa: response.data.student.cgpa || "",
                    tenth_score: response.data.student.tenth_score || "",
                    twelfth_score: response.data.student.twelfth_score || "",
                    contact_number: response.data.student.contact_number || "",
                    date_of_birth: response.data.student.date_of_birth ? new Date(response.data.student.date_of_birth).toISOString().split('T')[0] : "",
                    gender: response.data.student.gender || "",
                    linkedin: response.data.student.linkedin || "",
                    skills: response.data.student.skills || "",
                });
                setShowEditDialog(true);
            }
        } catch (error) {
            setErrorMsg("Failed to fetch student details");
        }
    };

    const handleSaveStudent = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.put(
                `${BACKEND_URL}/api/bulk-upload/students/${editingStudent.id}`,
                editFormData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.ok) {
                setSuccessMsg("Student details updated successfully!");
                setShowEditDialog(false);
                setEditingStudent(null);
                setEditFormData({});
                fetchStudents();
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.error || "Failed to update student details");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: 700, mb: 0.5 }}>
                    Student Details Management
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    Generate forms, collect student data, and manage bulk uploads
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 3, mb: 4 }}>
                <Card sx={{ bgcolor: "#1e293b", border: "1px solid #334155", p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                bgcolor: "#8b5cf620",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <PeopleIcon sx={{ color: "#8b5cf6", fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: 700 }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                Total Students
                            </Typography>
                        </Box>
                    </Stack>
                </Card>

                <Card sx={{ bgcolor: "#1e293b", border: "1px solid #334155", p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                bgcolor: "#10b98120",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CheckCircleIcon sx={{ color: "#10b981", fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ color: "#e2e8f0", fontWeight: 700 }}>
                                {stats.active}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                Active Profiles
                            </Typography>
                        </Box>
                    </Stack>
                </Card>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 4 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleGenerateForm}
                    disabled={loading}
                    sx={{
                        bgcolor: "#8b5cf6",
                        "&:hover": { bgcolor: "#7c3aed" },
                        textTransform: "none",
                        py: 1.5,
                    }}
                >
                    Copy Form link
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyAdditionalForm}
                    sx={{
                        borderColor: "#334155",
                        color: "#e2e8f0",
                        "&:hover": { borderColor: "#8b5cf6", bgcolor: "#8b5cf610" },
                        textTransform: "none",
                        py: 1.5,
                    }}
                >
                    Additional Form
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setShowUploadDialog(true)}
                    sx={{
                        borderColor: "#334155",
                        color: "#e2e8f0",
                        "&:hover": { borderColor: "#8b5cf6", bgcolor: "#8b5cf610" },
                        textTransform: "none",
                        py: 1.5,
                    }}
                >
                    Bulk Upload
                </Button>

                <Button
                    variant="outlined"
                    startIcon={downloadingLogins ? <CircularProgress size={20} /> : <VpnKeyIcon />}
                    onClick={handleDownloadLoginDetails}
                    disabled={downloadingLogins}
                    sx={{
                        borderColor: "#334155",
                        color: "#e2e8f0",
                        "&:hover": { borderColor: "#10b981", bgcolor: "#10b98110" },
                        textTransform: "none",
                        py: 1.5,
                    }}
                >
                    {downloadingLogins ? "Downloading..." : "Login Details"}
                </Button>
            </Box>

            {/* Upload Results */}
            {uploadResults && (
                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                    onClose={() => setUploadResults(null)}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Upload Results:
                    </Typography>
                    <Typography variant="body2">
                        ✓ Successful: {uploadResults.successful} | ✗ Failed: {uploadResults.failed}
                    </Typography>
                    {uploadResults.errors.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                                Errors (showing first 3):
                            </Typography>
                            {uploadResults.errors.slice(0, 3).map((err, idx) => (
                                <Typography key={idx} variant="caption" sx={{ display: "block" }}>
                                    Row {err.row}: {err.errors.join(", ")}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </Alert>
            )}

            {/* Students Table */}
            <Card sx={{ bgcolor: "#1e293b", border: "1px solid #334155" }}>
                <Box sx={{ p: 3, borderBottom: "1px solid #334155" }}>
                    <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                        Recent Students
                    </Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>Name</TableCell>
                                <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>Email</TableCell>
                                <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>Roll No</TableCell>
                                <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>Branch</TableCell>
                                <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>CGPA</TableCell>
                                <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell sx={{ color: "#e2e8f0", borderColor: "#334155" }}>
                                        {student.full_name}
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>
                                        {student.email}
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>
                                        {student.roll_number}
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>
                                        {student.branch}
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>
                                        {student.cgpa}
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", borderColor: "#334155" }}>
                                        <IconButton
                                            onClick={() => handleEditStudent(student)}
                                            sx={{ color: "#8b5cf6" }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Form Generation Dialog */}
            <Dialog
                open={showFormDialog}
                onClose={() => setShowFormDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { bgcolor: "#1e293b", color: "#e2e8f0" } }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Google Form Generated
                    <IconButton onClick={() => setShowFormDialog(false)} sx={{ color: "#94a3b8" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Form has been generated successfully! Follow the steps below:
                    </Alert>

                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
                        <strong>Step 1:</strong> Copy the form URL below
                    </Typography>

                    <Box
                        sx={{
                            bgcolor: "#0f172a",
                            p: 2,
                            borderRadius: 1,
                            border: "1px solid #334155",
                            mb: 3,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ color: "#e2e8f0", flex: 1, wordBreak: "break-all" }}
                        >
                            {formUrl}
                        </Typography>
                        <IconButton onClick={handleCopyUrl} sx={{ color: "#8b5cf6" }}>
                            <ContentCopyIcon />
                        </IconButton>
                    </Box>

                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                        <strong>Step 2:</strong> Paste this link in a new browser tab to open the Google Form
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                        <strong>Step 3:</strong> Copy the responders link and share it with students to collect their details
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                        <strong>Step 4:</strong> Upload the downloaded Excel/CSV file using "Bulk Upload"
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #334155" }}>
                    <Button onClick={() => setShowFormDialog(false)} sx={{ color: "#94a3b8" }}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCopyUrl}
                        sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
                    >
                        Copy URL
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Upload Dialog */}
            <Dialog
                open={showUploadDialog}
                onClose={() => setShowUploadDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: "#1e293b", color: "#e2e8f0" } }}
            >
                <DialogTitle>Bulk Upload Students</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
                        Upload the Excel or CSV file downloaded from Google Forms
                    </Typography>

                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        id="file-upload"
                    />
                    <label htmlFor="file-upload">
                        <Button
                            component="span"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{
                                borderColor: "#334155",
                                color: "#e2e8f0",
                                py: 2,
                                borderStyle: "dashed",
                                "&:hover": { borderColor: "#8b5cf6" },
                            }}
                        >
                            {selectedFile ? selectedFile.name : "Choose File"}
                        </Button>
                    </label>

                    {selectedFile && (
                        <Chip
                            label={selectedFile.name}
                            onDelete={() => setSelectedFile(null)}
                            sx={{ mt: 2, bgcolor: "#334155", color: "#e2e8f0" }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #334155" }}>
                    <Button onClick={() => setShowUploadDialog(false)} sx={{ color: "#94a3b8" }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleBulkUpload}
                        disabled={!selectedFile || loading}
                        sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Upload"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog
                open={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { bgcolor: "#1e293b", color: "#e2e8f0" } }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Edit Student Details
                    <IconButton onClick={() => setShowEditDialog(false)} sx={{ color: "#94a3b8" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, mt: 2 }}>
                        <TextField
                            label="Full Name"
                            value={editFormData.full_name || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="Email"
                            value={editFormData.email || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="Roll Number"
                            value={editFormData.roll_number || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, roll_number: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="Student ID"
                            value={editFormData.student_id || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, student_id: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="Branch"
                            value={editFormData.branch || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="Current Semester"
                            value={editFormData.current_semester || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, current_semester: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="CGPA"
                            value={editFormData.cgpa || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, cgpa: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="10th Score"
                            value={editFormData.tenth_score || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, tenth_score: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="12th Score"
                            value={editFormData.twelfth_score || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, twelfth_score: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="Contact Number"
                            value={editFormData.contact_number || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, contact_number: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="Date of Birth"
                            type="date"
                            value={editFormData.date_of_birth || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Gender"
                            value={editFormData.gender || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="LinkedIn"
                            value={editFormData.linkedin || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, linkedin: e.target.value })}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                        <TextField
                            label="Skills"
                            value={editFormData.skills || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                            fullWidth
                            sx={{
                                gridColumn: "span 2",
                                "& .MuiInputLabel-root": { color: "#94a3b8" },
                                "& .MuiOutlinedInput-root": {
                                    color: "#e2e8f0",
                                    "& fieldset": { borderColor: "#334155" },
                                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                                },
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #334155" }}>
                    <Button onClick={() => setShowEditDialog(false)} sx={{ color: "#94a3b8" }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveStudent}
                        disabled={loading}
                        sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifications */}
            <Snackbar
                open={!!successMsg}
                autoHideDuration={4000}
                onClose={() => setSuccessMsg("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="success" onClose={() => setSuccessMsg("")}>
                    {successMsg}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMsg}
                autoHideDuration={5000}
                onClose={() => setErrorMsg("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="error" onClose={() => setErrorMsg("")}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
}