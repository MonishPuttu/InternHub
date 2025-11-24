"use client";

import React from "react";
import { Paper, Typography, Box, Stack, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

export default function ProfileSection({ profile }) {
    if (!profile) {
        return null;
    }

    const router = useRouter();

    const infoItems = [
        { label: "Full Name", value: profile.fullName || "N/A" },
        { label: "Roll Number", value: profile.rollNumber || "N/A" },
        { label: "Branch", value: profile.branch || "N/A" },
        { label: "Semester", value: profile.currentSemester || "N/A" },
        { label: "Email", value: profile.email || "N/A" },
        { label: "Phone", value: profile.contactNumber || "N/A" },
        { label: "CGPA", value: profile.cgpa || "N/A" },
        { label: "10th Score", value: profile.tenthScore ? profile.tenthScore + "%" : "N/A" },
        { label: "12th Score", value: profile.twelfthScore ? profile.twelfthScore + "%" : "N/A" },
        { label: "Career Path", value: profile.careerPath || "N/A" },
    ];

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                mb: 2,
                bgcolor: "background.paper",
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

            <Typography
                variant="h5"
                sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    mb: 3,
                    mt: 4,
                    pb: 2,
                    borderBottom: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                }}
            >
                Personal Details
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 3,
                }}
            >
                {infoItems.map(({ label, value }, idx) => (
                    <Stack key={idx} spacing={0.5}>
                        <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontWeight: 600 }}
                        >
                            {label}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "text.primary" }}>
                            {value}
                        </Typography>
                    </Stack>
                ))}
            </Box>
        </Paper>
    );
}
