"use client";
import { useState, useEffect } from "react";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function StudentData() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [searchType, setSearchType] = useState("registerNumber");

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = getToken();

            const params = new URLSearchParams();
            if (searchValue.trim()) {
                params.set(searchType, searchValue.trim());
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

    useEffect(() => {
        fetchStudents();
    }, [searchValue, searchType]);

    const searchOptions = [
        { value: "registerNumber", label: "Register Number" },
        { value: "department", label: "Department" },
    ];

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
                <FormControl
                    size="small"
                    sx={{
                        minWidth: 200,
                        "& .MuiOutlinedInput-root": {
                            color: "text.primary",
                            bgcolor: "background.default",
                            "& fieldset": { borderColor: "#334155" },
                            "&:hover fieldset": { borderColor: "#8b5cf6" },
                        },
                        "& .MuiInputLabel-root": { color: "text.secondary" },
                    }}
                >
                    <InputLabel>Search By</InputLabel>
                    <Select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        label="Search By"
                        sx={{
                            color: "text.primary",
                            bgcolor: "background.default",
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#334155",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#8b5cf6",
                            },
                        }}
                    >
                        {searchOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    placeholder={`Enter ${searchOptions.find(opt => opt.value === searchType)?.label}...`}
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
                            <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>Placement Status</TableCell>
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
                                <TableCell colSpan={8} align="center">
                                    No students found
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
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
                                        {student.placementStatus || "Not Placed"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
