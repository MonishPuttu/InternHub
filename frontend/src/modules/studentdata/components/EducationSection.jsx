"use client";

import React from "react";
import { Paper, Typography, Box, Stack, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";


export default function EducationSection({ education, }) {
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
            <Typography
                variant="h6"
                sx={{ color: "text.primary", mb: 1.5, mt: 4, fontWeight: "bold" }}
            >
                Education
            </Typography>

            <Stack spacing={3}>
                {education.length === 0 ? (
                    <Box
                        sx={{
                            bgcolor: "background.paper",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: (theme) =>
                                theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                            p: 6,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            No education records added yet
                        </Typography>
                    </Box>
                ) : (
                    education.map((edu) => (
                        <Box
                            key={edu.id || edu.degree}
                            sx={{
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: (theme) =>
                                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                                p: 3,
                                transition: "all 0.2s",
                                "&:hover": {
                                    borderColor: "#8b5cf6",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)",
                                },
                            }}
                        >
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={2}
                            >
                                <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 1,
                                            bgcolor: (theme) =>
                                                theme.palette.mode === "dark"
                                                    ? "#334155"
                                                    : "#f1f5f9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="#8b5cf6"
                                            style={{ width: 24, height: 24 }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 14l9-5-9-5-9 5 9 5z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 21.75c-2.05 0-3.98-.632-5.556-1.72a12.08 12.08 0 01.665-6.479L12 14z"
                                            />
                                        </svg>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
                                        >
                                            {edu.degree}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "text.secondary", mb: 0.5 }}
                                        >
                                            {edu.institution}
                                        </Typography>
                                        {edu.field_of_study && (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "text.secondary", mb: 1 }}
                                            >
                                                {edu.field_of_study}
                                            </Typography>
                                        )}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "text.secondary",
                                                display: "block",
                                                mb: 1,
                                            }}
                                        >
                                            {edu.start_date
                                                ? new Date(edu.start_date).toLocaleDateString(
                                                    "en-US",
                                                    { month: "short", year: "numeric" }
                                                )
                                                : "N/A"}{" "}
                                            -{" "}
                                            {edu.end_date
                                                ? new Date(edu.end_date).toLocaleDateString(
                                                    "en-US",
                                                    { month: "short", year: "numeric" }
                                                )
                                                : "Present"}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#10b981", fontWeight: 600 }}
                                        >
                                            {`CGPA/Percentage : ${edu.grade || "N/A"}`}
                                        </Typography>
                                        {edu.coursework && (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "text.secondary", mt: 2, lineHeight: 1.6 }}
                                            >
                                                <strong style={{ color: "inherit" }}>
                                                    Relevant coursework:
                                                </strong>{" "}
                                                {edu.coursework}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Stack>
                        </Box>
                    ))
                )}
            </Stack>
        </Paper>
    );
}
