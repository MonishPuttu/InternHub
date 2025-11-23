"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Paper, Typography, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AssessmentHistorySection({ assessmentHistory }) {
    const router = useRouter();

    return (
        <Paper
            elevation={2}
            sx={{
                p: 2.5,
                mb: 2,

                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                position: "relative",
            }}
        >
            <IconButton
                onClick={() => router.back()}
                size="small"
                sx={{
                    color: "#8b5cf6",
                    position: "absolute",
                    top: 8,
                    left: 8,
                    display: "flex",
                    alignItems: "center",
                }}
                aria-label="back"
            >
                <ArrowBackIcon />
                <Typography
                    component="span"
                    sx={{ ml: 0.5, fontSize: 14, fontWeight: 500, userSelect: "none" }}
                >
                    Back
                </Typography>
            </IconButton>
            <Typography variant="h6" sx={{ color: "text.primary", mb: 1.5, mt: 4, fontWeight: "bold" }}>
                Assessment History
            </Typography>
            {assessmentHistory.length === 0 ? (
                <Typography sx={{ color: "text.secondary", textAlign: "center", py: 2, fontSize: "0.9rem" }}>
                    No assessment attempts yet
                </Typography>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ borderBottom: "1px solid #334155" }}>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Assessment</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Score</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>%</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Grade</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {assessmentHistory.map((attempt, index) => (
                                <TableRow key={index} sx={{ borderBottom: "1px solid #334155", "&:hover": { bgcolor: "background.default" } }}>
                                    <TableCell sx={{ color: "text.primary", py: 1.5 }}>{attempt.title || attempt.assessmentTitle}</TableCell>
                                    <TableCell align="center" sx={{ color: "#10b981", fontWeight: "bold" }}>{attempt.overallScore}</TableCell>
                                    <TableCell align="center" sx={{ color: "#f59e0b", fontWeight: "bold" }}>{attempt.percentageScore}%</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={attempt.grade}
                                            size="small"
                                            sx={{ bgcolor: "#10b98120", color: "#10b981", fontWeight: 600, height: 22 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                        {new Date(attempt.attemptDate || attempt.generatedAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}
