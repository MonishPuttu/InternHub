"use client";

import React from "react";
import { Paper, Typography, Box, Card } from "@mui/material";

export default function EducationSection({ education }) {
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
                Education
            </Typography>
            {education.length === 0 ? (
                <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                    No education details
                </Typography>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {education.map((edu, index) => (
                        <Card key={index} sx={{ bgcolor: "background.default", border: "1px solid #334155", p: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: "bold", mb: 0.5 }}>
                                {edu.degree}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 0.5 }}>
                                {edu.institution}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {edu.startDate ? new Date(edu.startDate).getFullYear() : "N/A"} - {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#10b981", fontWeight: "bold" }}>
                                    {edu.grade || "N/A"}
                                </Typography>
                            </Box>
                        </Card>
                    ))}
                </Box>
            )}
        </Paper>
    );
}
