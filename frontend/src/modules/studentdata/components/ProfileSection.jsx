"use client";

import React from "react";
import { Paper, Typography, TableContainer, Table, TableBody, TableRow, TableCell } from "@mui/material";

export default function ProfileSection({ profile }) {
    if (!profile) {
        return null;
    }

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                mb: 2,
                bgcolor: "background.paper",
                border: "1px solid #e5e7eb",
                borderRadius: 1,
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid #e5e7eb",
                }}
            >
                Profile & Academic Scores
            </Typography>

            <TableContainer>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                Full Name
                            </TableCell>
                            <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.fullName}
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                Roll Number
                            </TableCell>
                            <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.rollNumber}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                Branch
                            </TableCell>
                            <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.branch || "N/A"}
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                Semester
                            </TableCell>
                            <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.currentSemester || "N/A"}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                Email
                            </TableCell>
                            <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.email || "N/A"}
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                Phone
                            </TableCell>
                            <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.contactNumber || "N/A"}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                CGPA
                            </TableCell>
                            <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.cgpa || "N/A"}
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                10th Score
                            </TableCell>
                            <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.tenthScore || "N/A"}%
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                12th Score
                            </TableCell>
                            <TableCell sx={{ color: "text.primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.twelfthScore || "N/A"}%
                            </TableCell>
                            <TableCell sx={{ color: "text-secondary", fontWeight: "bold", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                Career Path
                            </TableCell>
                            <TableCell sx={{ color: "text-primary", py: 1, borderBottom: "1px solid #e5e7eb" }}>
                                {profile.careerPath || "N/A"}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
