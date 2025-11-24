"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Paper, Typography, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box, TablePagination } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AssessmentHistorySection({ assessmentHistory = [] }) {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedHistory = assessmentHistory.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                position: "relative",
                bgcolor: "background.paper",
            }}
        >
            <IconButton
                onClick={() => router.back()}
                size="small"
                sx={{
                    color: "#8b5cf6",
                    position: "absolute",
                    top: 16,
                    left: 16,
                    display: "flex",
                    alignItems: "center",
                    "&:hover": {
                        bgcolor: "transparent",
                    }
                }}
                aria-label="back"
            >
                <ArrowBackIcon />
                <Typography
                    component="span"
                    sx={{ ml: 0.5, fontSize: 16, fontWeight: 500, userSelect: "none" }}
                >
                    Back
                </Typography>
            </IconButton>
            <Typography
                variant="h5"
                sx={{
                    color: "text.primary",
                    mb: 3,
                    mt: 5,
                    fontWeight: "bold",
                    fontSize: "1.5rem"
                }}
            >
                Assessment History
            </Typography>
            {assessmentHistory.length === 0 ? (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "150px",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "#fafafa",
                    }}
                >
                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: "1rem"
                        }}
                    >
                        No assessment attempts yet
                    </Typography>
                </Box>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Assessment</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Score</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>%</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Grade</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedHistory.map((attempt, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        "&:hover": { bgcolor: "action.hover" },
                                        "&:last-child": { borderBottom: "none" }
                                    }}
                                >
                                    <TableCell sx={{ color: "text.primary", py: 2, fontSize: "0.875rem" }}>{attempt.title || attempt.assessmentTitle}</TableCell>
                                    <TableCell align="center" sx={{ color: "#10b981", fontWeight: "bold", fontSize: "0.875rem" }}>{attempt.overallScore}</TableCell>
                                    <TableCell align="center" sx={{ color: "#f59e0b", fontWeight: "bold", fontSize: "0.875rem" }}>{attempt.percentageScore}%</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={attempt.grade}
                                            size="small"
                                            sx={{
                                                bgcolor: "#10b98120",
                                                color: "#10b981",
                                                fontWeight: 600,
                                                fontSize: "0.75rem",
                                                height: 24
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.875rem", py: 2 }}>
                                        {new Date(attempt.attemptDate || attempt.generatedAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {assessmentHistory.length > 0 && (
                <TablePagination
                    component="div"
                    count={assessmentHistory.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                        borderTop: "1px solid",
                        borderColor: "divider",
                        mt: 1,
                        ".MuiTablePagination-toolbar": {
                            color: "text.secondary",
                        },
                        ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                            fontSize: "0.875rem",
                        },
                    }}
                />
            )}
        </Paper>
    );
}