"use client";

import React from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import {
    Person,
    Description,
    Work,
    School,
    FolderOpen,
    Link as LinkIcon,
} from "@mui/icons-material";

export default function StudentDashboardBoxes({ studentId }) {
    const router = useRouter();

    const sections = [
        {
            title: "Profile & Academic Scores",
            subtitle: "View full profile details",
            icon: Person,
            color: "#8b5cf6",
            path: `/studentdata/${studentId}/profile`,
        },
        {
            title: "Assessment History",
            subtitle: "View assessment details",
            icon: Description,
            color: "#06b6d4",
            path: `/studentdata/${studentId}/assessment-history`,
        },
        {
            title: "Applications & Offers",
            subtitle: "View job applications and offers",
            icon: Work,
            color: "#10b981",
            path: `/studentdata/${studentId}/applications-offers`,
        },
        {
            title: "Education",
            subtitle: "View educational background",
            icon: School,
            color: "#f59e0b",
            path: `/studentdata/${studentId}/education`,
        },
        {
            title: "Projects",
            subtitle: "View project portfolio",
            icon: FolderOpen,
            color: "#ef4444",
            path: `/studentdata/${studentId}/projects`,
        },
        {
            title: "Social Links",
            subtitle: "View social and professional links",
            icon: LinkIcon,
            color: "#2563eb",
            path: `/studentdata/${studentId}/social-links`,
        },
    ];

    return (
        <Box
            sx={{
                p: 3,
                backgroundColor: "background.default",
                minHeight: "100vh",
                color: "text.primary",
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                    },
                    gap: 3,
                }}
            >
                {sections.map(({ title, subtitle, icon: Icon, color, path }, idx) => (
                    <Paper
                        key={idx}
                        onClick={() => router.push(path)}
                        sx={{
                            p: 2.5,
                            bgcolor: "background.paper",
                            border: "1px solid #334155",
                            borderRadius: 2,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": {
                                borderColor: color,
                                bgcolor: "background.default",
                                transform: "translateY(-2px)",
                            },
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1.5,
                                    bgcolor: `${color}20`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Icon sx={{ color: color, fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography
                                    variant="body1"
                                    sx={{ color: "text.primary", fontWeight: 600, mb: 0.25 }}
                                >
                                    {title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {subtitle}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
}
