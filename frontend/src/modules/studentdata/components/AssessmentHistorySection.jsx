"use client";

import React from "react";
import { Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box } from "@mui/material";

export default function AssessmentHistorySection({ assessmentHistory }) {
    return (
        <Paper
            elevation={2}
            sx={{
                p: 2.5,
                mb: 2,
                bgcolor: "background.paper",
                border: "1px solid #334155",
            }}
        >
            <Typography variant="h6" sx={{ color: "text.primary", mb: 1.5, fontWeight: "bold" }}>
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
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Date</TableCell>
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
