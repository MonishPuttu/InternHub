"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    InputAdornment,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { Search as SearchIcon, Edit as EditIcon, FileDownload as FileDownloadIcon } from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";
import Papa from "papaparse";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function StudentData() {
    const router = useRouter();
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]); // Store all fetched students
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [selectedPost, setSelectedPost] = useState("");
    
    // Post/Company filter state
    const [posts, setPosts] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        department: "",
        registerNumber: "",
        rollNumber: "",
        currentSemester: "",
        cgpa: "",
        careerPath: "",
    });
    const [updating, setUpdating] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch posts for the company filter
    const fetchPosts = async () => {
        try {
            setLoadingPosts(true);
            const token = getToken();
            const response = await axios.get(
                `${BACKEND_URL}/api/posts/approved-posts`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPosts(response.data.posts || []);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        } finally {
            setLoadingPosts(false);
        }
    };

    // Fetch all applications for filtering
    const fetchApplications = async () => {
        try {
            setLoadingApplications(true);
            const token = getToken();
            const response = await axios.get(
                `${BACKEND_URL}/api/applications/all-applications`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Extract applications from the response
            const apps = response.data.applications || [];
            setApplications(apps);
        } catch (err) {
            console.error("Failed to fetch applications:", err);
        } finally {
            setLoadingApplications(false);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchApplications();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = getToken();

            const params = new URLSearchParams();
            if (searchValue.trim()) {
                params.set("search", searchValue.trim());
            }
            if (department) {
                params.set("department", department);
            }
            if (year) {
                params.set("year", year);
            }

            const response = await axios.get(
                `${BACKEND_URL}/api/studentdata/students?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            let filteredStudents = response.data.students || [];

            // Client-side filtering for case-insensitive name and register number search
            if (searchValue.trim()) {
                const searchLower = searchValue.trim().toLowerCase();
                filteredStudents = filteredStudents.filter(student => {
                    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().trim();
                    const firstName = (student.firstName || '').toLowerCase();
                    const lastName = (student.lastName || '').toLowerCase();
                    const registerNumber = (student.registerNumber || '').toLowerCase();

                    return fullName.startsWith(searchLower) ||
                        firstName.startsWith(searchLower) ||
                        lastName.startsWith(searchLower) ||
                        registerNumber.includes(searchLower);
                });
            }

            // Store all students before post filtering
            setAllStudents(filteredStudents);

            // Apply post/company filter if selected
            if (selectedPost) {
                // Find all applications for posts from the selected company
                const companyApplications = applications.filter(app => {
                    return app.post?.company_name === selectedPost;
                });

                // Extract unique student IDs from these applications
                const studentIdsWithApplications = new Set(
                    companyApplications.map(app => app.application?.student_id).filter(Boolean)
                );

                // Filter students to only those who have applied to this company
                filteredStudents = filteredStudents.filter(student => 
                    studentIdsWithApplications.has(student.id)
                );
            }

            setStudents(filteredStudents);
        } catch (err) {
            setError("Failed to fetch student data");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setEditForm({
            firstName: student.firstName || "",
            lastName: student.lastName || "",
            email: student.email || "",
            department: student.department || "",
            registerNumber: student.registerNumber || "",
            rollNumber: student.rollNumber || "",
            currentSemester: student.currentSemester || "",
            cgpa: student.cgpa || "",
            careerPath: student.careerPath || "",
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!selectedStudent) return;

        try {
            setUpdating(true);
            const token = getToken();

            const updateData = {
                full_name: `${editForm.firstName} ${editForm.lastName}`.trim(),
                branch: editForm.department,
                roll_number: editForm.registerNumber,
                student_id: editForm.rollNumber,
                current_semester: parseInt(editForm.currentSemester),
                cgpa: parseFloat(editForm.cgpa),
                career_path: editForm.careerPath,
            };

            await axios.put(
                `${BACKEND_URL}/api/studentdata/students/${selectedStudent.id}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEditModalOpen(false);
            setSelectedStudent(null);
            fetchStudents(); // Refresh the list
        } catch (err) {
            setError("Failed to update student data");
        } finally {
            setUpdating(false);
        }
    };

    const handleExportCSV = () => {
        if (students.length === 0) {
            setError("No student data to export");
            return;
        }

        const csvData = students.map(student => ({
            "First Name": student.firstName || "",
            "Last Name": student.lastName || "",
            "Email": student.email || "",
            "Department": student.department || "",
            "Register Number": student.registerNumber || "",
            "Roll Number": student.rollNumber || "",
            "Current Semester": student.currentSemester || "",
            "CGPA": student.cgpa || "",
            "Career Path": student.careerPath || "",
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "student_data.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Trigger fetch when filters change
    useEffect(() => {
        if (searchValue.trim() || department || year) {
            fetchStudents();
        } else if (selectedPost) {
            // If only post filter is selected, we still need to fetch students
            fetchStudents();
        } else {
            setStudents([]);
            setAllStudents([]);
            setLoading(false);
        }
    }, [searchValue, department, year]);

    return (
        <Box sx={{ p: 3 }}>
            {/* Filter Bar */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Left side - Search and Filters */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or register number..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "text.secondary" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            minWidth: 300,
                            "& .MuiOutlinedInput-root": {
                                color: "text.primary",
                                bgcolor: "background.default",
                                "& fieldset": { borderColor: "#334155" },
                                "&:hover fieldset": { borderColor: "#8b5cf6" },
                            },
                            "& .MuiInputBase-input::placeholder": { color: "text.secondary" },
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ color: "text.secondary" }}>Department</InputLabel>
                        <Select
                            value={department}
                            label="Department"
                            onChange={(e) => setDepartment(e.target.value)}
                            sx={{
                                color: "text.primary",
                                bgcolor: "background.default",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#8b5cf6" },
                            }}
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            <MenuItem value="CSE">CSE</MenuItem>
                            <MenuItem value="ECE">ECE</MenuItem>
                            <MenuItem value="IT">IT</MenuItem>
                            <MenuItem value="MECH">MECH</MenuItem>
                            <MenuItem value="CIVIL">CIVIL</MenuItem>
                            <MenuItem value="EEE">EEE</MenuItem>
                            <MenuItem value="MBA">MBA</MenuItem>
                            <MenuItem value="AIML">AIML</MenuItem>
                            <MenuItem value="MCA">MCA</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ color: "text.secondary" }}>Year</InputLabel>
                        <Select
                            value={year}
                            label="Year"
                            onChange={(e) => setYear(e.target.value)}
                            sx={{
                                color: "text.primary",
                                bgcolor: "background.default",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#8b5cf6" },
                            }}
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            <MenuItem value="1">1</MenuItem>
                            <MenuItem value="2">2</MenuItem>
                            <MenuItem value="3">3</MenuItem>
                            <MenuItem value="4">4</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel sx={{ color: "text.secondary" }}>Post/Company</InputLabel>
                        <Select
                            value={selectedPost}
                            label="Post/Company"
                            onChange={(e) => setSelectedPost(e.target.value)}
                            disabled={loadingPosts || loadingApplications}
                            sx={{
                                color: "text.primary",
                                bgcolor: "background.default",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#8b5cf6" },
                            }}
                        >
                            <MenuItem value="">
                                <em>All Posts</em>
                            </MenuItem>
                            {uniqueCompanies.map((company) => (
                                <MenuItem key={company} value={company}>
                                    {company}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Right side - Export */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportCSV}
                        disabled={students.length === 0}
                        sx={{
                            color: "text.primary",
                            borderColor: "#334155",
                            "&:hover": { borderColor: "#8b5cf6", bgcolor: "action.hover" },
                        }}
                    >
                        Export CSV
                    </Button>
                </Box>
            </Box>

            {/* Inline Success and Error Alerts */}
            {(success || error) && (
                <Box sx={{ mb: 2 }}>
                    {success && (
                        <Alert severity="success" onClose={() => setSuccess("")} sx={{ width: "100%" }}>
                            {success}
                        </Alert>
                    )}
                    {error && (
                        <Alert severity="error" onClose={() => setError("")} sx={{ width: "100%" }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            )}

            {/* Table */}
            <TableContainer component={Paper} sx={{ bgcolor: "background.paper" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Department</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Register Number</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Roll Number</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Semester</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>CGPA</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Career Path</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 && (searchValue.trim() || department || year || selectedPost) ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No students found
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ color: "text.secondary", py: 4 }}>
                                    Search to view student details
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow
                                    key={student.id}
                                    onClick={() => router.push(`/studentdata/${student.id}`)}
                                    sx={{
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: "action.hover",
                                        },
                                    }}
                                >
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.firstName} {student.lastName}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.email}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.department || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.registerNumber || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.rollNumber || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.currentSemester || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.cgpa || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.careerPath || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(student);
                                            }}
                                            sx={{ color: "#8b5cf6" }}
                                        >
                                            <EditIcon />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Dialog */}
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Student Information</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        <TextField
                            label="First Name"
                            value={editForm.firstName}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={editForm.lastName}
                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Department"
                            value={editForm.department}
                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Register Number"
                            value={editForm.registerNumber}
                            onChange={(e) => setEditForm({ ...editForm, registerNumber: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Roll Number"
                            value={editForm.rollNumber}
                            onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Semester"
                            value={editForm.currentSemester}
                            onChange={(e) => setEditForm({ ...editForm, currentSemester: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="CGPA"
                            value={editForm.cgpa}
                            onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Career Path"
                            value={editForm.careerPath}
                            onChange={(e) => setEditForm({ ...editForm, careerPath: e.target.value })}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} disabled={updating}>
                        {updating ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}