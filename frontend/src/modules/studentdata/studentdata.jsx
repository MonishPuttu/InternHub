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
    Snackbar,
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
import { Search as SearchIcon, Edit as EditIcon, FileDownload as FileDownloadIcon, FileUpload as FileUploadIcon } from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";
import Papa from "papaparse";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function StudentData() {
    const router = useRouter();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        department: "",
        registerNumber: "",
        rollNumber: "",
        year: "",
        cgpa: "",
    });
    const [updating, setUpdating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);

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

            setStudents(response.data.students || []);
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
            year: student.year || "",
            cgpa: student.cgpa || "",
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
                current_semester: parseInt(editForm.year),
                cgpa: parseFloat(editForm.cgpa),
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
            "Year": student.year || "",
            "CGPA": student.cgpa || "",
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

    const handleImportCSV = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const token = getToken();
                    const importData = results.data.map(row => ({
                        full_name: `${row["First Name"] || ""} ${row["Last Name"] || ""}`.trim(),
                        email: row["Email"] || "",
                        branch: row["Department"] || "",
                        roll_number: row["Register Number"] || "",
                        student_id: row["Roll Number"] || "",
                        current_semester: parseInt(row["Year"]) || null,
                        cgpa: parseFloat(row["CGPA"]) || null,
                    })).filter(row => row.full_name || row.email); // Filter out empty rows

                    if (importData.length === 0) {
                        setError("No valid data found in CSV");
                        setImporting(false);
                        return;
                    }

                    const response = await axios.post(
                        `${BACKEND_URL}/api/studentdata/import`,
                        { students: importData },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    fetchStudents(); // Refresh the list
                    setError(""); // Clear any previous errors
                    setSuccess(response.data.message || "Student data imported successfully");
                } catch (err) {
                    setError("Failed to import student data");
                } finally {
                    setImporting(false);
                }
            },
            error: (error) => {
                setError("Failed to parse CSV file");
                setImporting(false);
            },
        });
    };

    useEffect(() => {
        fetchStudents();
    }, [searchValue, department, year]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, color: "text.primary" }}>
                Student Data
            </Typography>

            {/* Filter Bar */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search students..."
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
                        minWidth: 250,
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



                <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportCSV}
                    sx={{
                        color: "text.primary",
                        borderColor: "#334155",
                        "&:hover": { borderColor: "#8b5cf6", bgcolor: "action.hover" },
                    }}
                >
                    Export CSV
                </Button>

                <Button
                    variant="contained"
                    startIcon={<FileUploadIcon />}
                    component="label"
                    disabled={importing}
                    sx={{
                        bgcolor: "#8b5cf6",
                        "&:hover": { bgcolor: "#7c3aed" },
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
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Year</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>CGPA</TableCell>
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No students found
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
                                        {student.year || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        {student.cgpa || "N/A"}
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
                            label="Year"
                            value={editForm.year}
                            onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="CGPA"
                            value={editForm.cgpa}
                            onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
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

            {/* Success Snackbar */}
            <Snackbar
                open={!!success}
                autoHideDuration={4000}
                onClose={() => setSuccess("")}
            >
                <Alert severity="success" onClose={() => setSuccess("")} sx={{ width: "100%" }}>
                    {success}
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={4000}
                onClose={() => setError("")}
            >
                <Alert severity="error" onClose={() => setError("")} sx={{ width: "100%" }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}
