"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
    Fade,
} from "@mui/material";
import {
    Search as SearchIcon,
    Edit as EditIcon,
    FileDownload as FileDownloadIcon,
    FileUpload as FileUploadIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";
import Papa from "papaparse";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const DEBOUNCE_DELAY = 300; // Reduced from 500ms to 300ms for faster response
const MIN_SEARCH_LENGTH = 2; // Only search after 2 characters
const DEPARTMENTS = ["CSE", "ECE", "IT", "MECH", "CIVIL"];
const YEARS = ["1", "2", "3", "4"];

export default function StudentData() {
    const router = useRouter();

    // State management
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Filter states
    const [searchValue, setSearchValue] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");

    // Edit modal states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        registerNumber: "",
        rollNumber: "",
        year: "",
        cgpa: "",
        careerPath: "",
    });
    const [updating, setUpdating] = useState(false);
    const [importing, setImporting] = useState(false);

    // Refs
    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const initialLoadRef = useRef(false);

    /**
     * Fetch students with proper cancellation and error handling
     */
    const fetchStudents = useCallback(async (isInitialLoad = false) => {
        try {
            // Don't search if search value is too short (unless filters are applied)
            if (!isInitialLoad && searchValue.length > 0 && searchValue.length < MIN_SEARCH_LENGTH && !department && !year) {
                return;
            }

            // Cancel any pending request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController();

            // Set loading state (no loading spinner for debounced searches, only for initial)
            if (isInitialLoad) {
                setLoading(true);
            }

            const token = getToken();
            if (!token) {
                throw new Error("Authentication required");
            }

            // Build query parameters
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
                {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: abortControllerRef.current.signal,
                    timeout: 5000, // 5 second timeout
                }
            );

            setStudents(response.data.students || []);
            setError(""); // Clear previous errors
        } catch (err) {
            // Ignore cancellation errors
            if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
                return;
            }

            console.error("Failed to fetch students:", err);

            // Handle specific error cases
            if (err.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else if (err.response?.status === 403) {
                setError("You don't have permission to view student data.");
            } else if (err.code === "ECONNABORTED") {
                setError("Request timeout. Please try again.");
            } else {
                setError(err.response?.data?.message || "Failed to fetch student data. Please try again.");
            }

            setStudents([]);
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    }, [searchValue, department, year]);

    /**
     * Initial data load
     */
    useEffect(() => {
        if (!initialLoadRef.current) {
            initialLoadRef.current = true;
            fetchStudents(true);
        }
    }, []);

    /**
     * Debounced search effect for text input
     */
    useEffect(() => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Don't show searching state for very short inputs
        if (searchValue.length >= MIN_SEARCH_LENGTH) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
        }

        // Debounce the search
        debounceTimerRef.current = setTimeout(() => {
            fetchStudents();
        }, DEBOUNCE_DELAY);

        // Cleanup
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchValue]);

    /**
     * Immediate fetch for dropdown filters (no debounce needed)
     */
    useEffect(() => {
        if (initialLoadRef.current) {
            fetchStudents();
        }
    }, [department, year]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    /**
     * Handle edit click
     */
    const handleEditClick = useCallback((student) => {
        setSelectedStudent(student);
        setEditForm({
            firstName: student.firstName || "",
            lastName: student.lastName || "",
            email: student.email || "",
            department: student.department || "",
            registerNumber: student.registerNumber || "",
            rollNumber: student.rollNumber || "",
            year: student.year || "",
            cgpa: student.cgpa || "",
            careerPath: student.careerPath || "",
        });
        setEditModalOpen(true);
    }, []);

    /**
     * Handle edit form submission
     */
    const handleEditSubmit = async () => {
        if (!selectedStudent) return;

        // Validation
        if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
            setError("First name and last name are required");
            return;
        }

        try {
            setUpdating(true);
            const token = getToken();

            const updateData = {
                full_name: `${editForm.firstName.trim()} ${editForm.lastName.trim()}`,
                branch: editForm.department,
                roll_number: editForm.registerNumber,
                student_id: editForm.rollNumber,
                current_semester: editForm.year ? parseInt(editForm.year) : null,
                cgpa: editForm.cgpa ? parseFloat(editForm.cgpa) : null,
                career_path: editForm.careerPath,
            };

            await axios.put(
                `${BACKEND_URL}/api/studentdata/students/${selectedStudent.id}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Student information updated successfully");
            setEditModalOpen(false);
            setSelectedStudent(null);

            // Refresh the list
            fetchStudents();
        } catch (err) {
            console.error("Failed to update student:", err);
            setError(err.response?.data?.message || "Failed to update student data. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    /**
     * Export students to CSV
     */
    const handleExportCSV = useCallback(() => {
        if (students.length === 0) {
            setError("No student data to export");
            return;
        }

        try {
            const csvData = students.map((student) => ({
                "First Name": student.firstName || "",
                "Last Name": student.lastName || "",
                Email: student.email || "",
                Department: student.department || "",
                "Register Number": student.registerNumber || "",
                "Roll Number": student.rollNumber || "",
                Year: student.year || "",
                CGPA: student.cgpa || "",
                "Career Path": student.careerPath || "",
            }));

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);

            link.setAttribute("href", url);
            link.setAttribute("download", `student_data_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            setSuccess(`Exported ${students.length} students successfully`);
        } catch (err) {
            console.error("Export failed:", err);
            setError("Failed to export CSV file");
        }
    }, [students]);

    /**
     * Import students from CSV
     */
    const handleImportCSV = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith(".csv")) {
            setError("Please upload a valid CSV file");
            return;
        }

        setImporting(true);
        setError("");

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(), // Clean headers
            complete: async (results) => {
                try {
                    if (results.errors.length > 0) {
                        console.error("CSV parse errors:", results.errors);
                        throw new Error("CSV file contains formatting errors");
                    }

                    const token = getToken();

                    const importData = results.data
                        .map((row) => {
                            const firstName = row["First Name"]?.trim() || "";
                            const lastName = row["Last Name"]?.trim() || "";
                            const fullName = `${firstName} ${lastName}`.trim();

                            return {
                                full_name: fullName,
                                email: row["Email"]?.trim() || "",
                                branch: row["Department"]?.trim() || "",
                                roll_number: row["Register Number"]?.trim() || "",
                                student_id: row["Roll Number"]?.trim() || "",
                                current_semester: row["Year"] ? parseInt(row["Year"]) : null,
                                cgpa: row["CGPA"] ? parseFloat(row["CGPA"]) : null,
                                career_path: row["Career Path"]?.trim() || "",
                            };
                        })
                        .filter((row) => row.full_name || row.email); // Filter empty rows

                    if (importData.length === 0) {
                        throw new Error("No valid data found in CSV file");
                    }

                    const response = await axios.post(
                        `${BACKEND_URL}/api/studentdata/import`,
                        { students: importData },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    setSuccess(
                        response.data.message ||
                        `Successfully imported ${importData.length} students`
                    );

                    // Refresh the list
                    fetchStudents();
                } catch (err) {
                    console.error("Import failed:", err);
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to import student data"
                    );
                } finally {
                    setImporting(false);
                    // Reset file input
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }
            },
            error: (error) => {
                console.error("CSV parse error:", error);
                setError("Failed to parse CSV file. Please check the file format.");
                setImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            },
        });
    };

    /**
     * Memoized empty state message
     */
    const emptyStateMessage = useMemo(() => {
        if (loading) return null;
        if (searchValue.trim() || department || year) {
            return "No students found matching your filters";
        }
        return "Use the search and filters above to find students";
    }, [loading, searchValue, department, year]);

    return (
        <Box sx={{ p: 3, maxWidth: "1600px", mx: "auto" }}>
            <Typography variant="h4" sx={{ mb: 3, color: "text.primary", fontWeight: 600 }}>
                Student Data Management
            </Typography>

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
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flex: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Search by name, email, or roll number..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        helperText={searchValue.length > 0 && searchValue.length < MIN_SEARCH_LENGTH ? `Type ${MIN_SEARCH_LENGTH - searchValue.length} more character(s) to search` : ""}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {isSearching ? (
                                        <CircularProgress size={20} sx={{ color: "text.secondary" }} />
                                    ) : (
                                        <SearchIcon sx={{ color: "text.secondary" }} />
                                    )}
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            minWidth: 300,
                            flex: 1,
                            maxWidth: 400,
                            "& .MuiOutlinedInput-root": {
                                color: "text.primary",
                                bgcolor: "background.default",
                                "& fieldset": { borderColor: "#334155" },
                                "&:hover fieldset": { borderColor: "#8b5cf6" },
                                "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                            },
                            "& .MuiInputBase-input::placeholder": { color: "text.secondary" },
                            "& .MuiFormHelperText-root": {
                                color: "text.secondary",
                                fontSize: "0.75rem",
                                mt: 0.5,
                            },
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 140 }}>
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
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8b5cf6" },
                            }}
                        >
                            <MenuItem value="">
                                <em>All Departments</em>
                            </MenuItem>
                            {DEPARTMENTS.map((dept) => (
                                <MenuItem key={dept} value={dept}>
                                    {dept}
                                </MenuItem>
                            ))}
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
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8b5cf6" },
                            }}
                        >
                            <MenuItem value="">
                                <em>All Years</em>
                            </MenuItem>
                            {YEARS.map((yr) => (
                                <MenuItem key={yr} value={yr}>
                                    {yr}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Right side - Export and Import */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportCSV}
                        disabled={students.length === 0 || loading}
                        sx={{
                            color: "text.primary",
                            borderColor: "#334155",
                            "&:hover": { borderColor: "#8b5cf6", bgcolor: "action.hover" },
                            "&.Mui-disabled": { borderColor: "#1e293b", color: "text.disabled" },
                        }}
                    >
                        Export CSV
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={importing ? <CircularProgress size={20} /> : <FileUploadIcon />}
                        component="label"
                        disabled={importing}
                        sx={{
                            bgcolor: "#8b5cf6",
                            "&:hover": { bgcolor: "#7c3aed" },
                            "&.Mui-disabled": { bgcolor: "#4c1d95" },
                        }}
                    >
                        {importing ? "Importing..." : "Import CSV"}
                        <input
                            type="file"
                            accept=".csv"
                            hidden
                            ref={fileInputRef}
                            onChange={handleImportCSV}
                        />
                    </Button>
                </Box>
            </Box>

            {/* Alerts */}
            <Fade in={!!(success || error)} timeout={300}>
                <Box sx={{ mb: 2 }}>
                    {success && (
                        <Alert
                            severity="success"
                            onClose={() => setSuccess("")}
                            sx={{ mb: error ? 1 : 0 }}
                        >
                            {success}
                        </Alert>
                    )}
                    {error && (
                        <Alert severity="error" onClose={() => setError("")}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </Fade>

            {/* Table */}
            <TableContainer
                component={Paper}
                sx={{
                    bgcolor: "background.paper",
                    boxShadow: 3,
                    borderRadius: 2,
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Department</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Register Number</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Roll Number</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Year</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>CGPA</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Career Path</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }} align="center">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={40} />
                                    <Typography sx={{ mt: 2, color: "text.secondary" }}>
                                        Loading students...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ color: "text.secondary", py: 8 }}>
                                    <Typography variant="body1">
                                        {emptyStateMessage}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow
                                    key={student.id}
                                    onClick={() => router.push(`/studentdata/${student.id}`)}
                                    sx={{
                                        cursor: "pointer",
                                        transition: "background-color 0.2s",
                                        "&:hover": {
                                            backgroundColor: "action.hover",
                                        },
                                    }}
                                >
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.firstName} {student.lastName}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.email || "N/A"}
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
                                        {student.year ? ` ${student.year}` : "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.cgpa || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.careerPath || "N/A"}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(student);
                                            }}
                                            sx={{
                                                color: "#8b5cf6",
                                                minWidth: "auto",
                                                p: 1,
                                                "&:hover": {
                                                    bgcolor: "rgba(139, 92, 246, 0.1)",
                                                },
                                            }}
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
            <Dialog
                open={editModalOpen}
                onClose={() => !updating && setEditModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Edit Student Information
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="First Name"
                                value={editForm.firstName}
                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Last Name"
                                value={editForm.lastName}
                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                fullWidth
                                required
                            />
                        </Box>

                        <TextField
                            label="Email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            fullWidth
                            type="email"
                            disabled
                            helperText="Email cannot be changed"
                        />

                        <TextField
                            label="Department"
                            value={editForm.department}
                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                            fullWidth
                            select
                        >
                            {DEPARTMENTS.map((dept) => (
                                <MenuItem key={dept} value={dept}>
                                    {dept}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: "flex", gap: 2 }}>
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
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Year"
                                value={editForm.year}
                                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                fullWidth
                                select
                            >
                                {YEARS.map((yr) => (
                                    <MenuItem key={yr} value={yr}>
                                        {yr}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="CGPA"
                                value={editForm.cgpa}
                                onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                                fullWidth
                                type="number"
                                inputProps={{ min: 0, max: 10, step: 0.01 }}
                            />
                        </Box>

                        <TextField
                            label="Career Path"
                            value={editForm.careerPath}
                            onChange={(e) => setEditForm({ ...editForm, careerPath: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setEditModalOpen(false)}
                        disabled={updating}
                        sx={{ color: "text.secondary" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        disabled={updating}
                        variant="contained"
                        sx={{
                            bgcolor: "#8b5cf6",
                            "&:hover": { bgcolor: "#7c3aed" },
                        }}
                    >
                        {updating ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}