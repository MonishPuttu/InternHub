"use client";

import React from "react";
import { Paper, Typography, Box, Stack, IconButton, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

export default function SocialLinksSection({ socialLinks }) {
    const hasNoLinks =
        !socialLinks?.portfolioWebsite &&
        !socialLinks?.linkedinProfile &&
        !socialLinks?.githubProfile;

    const linkItems = [
        {
            key: "portfolioWebsite",
            label: "Portfolio",
            url: socialLinks?.portfolioWebsite,
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#8b5cf6"
                    style={{ width: 24, height: 24 }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 21.75c-2.05 0-3.98-.632-5.556-1.72a12.08 12.08 0 01.665-6.479L12 14z"
                    />
                </svg>
            ),
            buttonLabel: "View Site",
        },
        {
            key: "linkedinProfile",
            label: "LinkedIn",
            url: socialLinks?.linkedinProfile,
            icon: (
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
                        d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"
                    />
                    <rect width="4" height="12" x="2" y="9" rx="1" />
                    <circle cx="4" cy="4" r="2" />
                </svg>
            ),
            buttonLabel: "View Profile",
        },
        {
            key: "githubProfile",
            label: "GitHub",
            url: socialLinks?.githubProfile,
            icon: (
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
                        d="M12 2c-5.523 0-10 4.477-10 10a10 10 0 006.838 9.488c.5.092.682-.218.682-.484v-1.711c-2.782.605-3.369-1.342-3.369-1.342-.455-1.16-1.11-1.468-1.11-1.468-.908-.62.07-.608.07-.608 1.004.071 1.532 1.031 1.532 1.031.892 1.528 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.337-2.22-.252-4.555-1.113-4.555-4.95 0-1.093.39-1.986 1.029-2.688-.103-.253-.446-1.27.098-2.645 0 0 .84-.269 2.75 1.025a9.564 9.564 0 012.5-.336c.85.004 1.705.115 2.5.337 1.91-1.294 2.75-1.025 2.75-1.025.546 1.375.202 2.392.1 2.645.64.702 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.942.36.31.68.923.68 1.861v2.76c0 .268.18.58.688.483A10 10 0 0022 12c0-5.523-4.477-10-10-10z"
                    />
                </svg>
            ),
            buttonLabel: "View Profile",
        },
    ];

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

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3, mt: 4 }}
            >
                <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600 }}>
                    Social Links
                </Typography>
            </Stack>

            <Stack spacing={3}>
                {hasNoLinks ? (
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
                            No social links available
                        </Typography>
                    </Box>
                ) : (
                    linkItems
                        .filter((item) => item.url)
                        .map((item) => (
                            <Box
                                key={item.key}
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
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 1,
                                            bgcolor: (theme) =>
                                                theme.palette.mode === "dark" ? "#334155" : "#f1f5f9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
                                        >
                                            {item.label}
                                        </Typography>
                                        <Button
                                            href={item.url}
                                            target="_blank"
                                            sx={{
                                                color: "#8b5cf6",
                                                textTransform: "none",
                                                fontSize: "0.9rem",
                                                p: 0,
                                            }}
                                        >
                                            {item.buttonLabel}
                                        </Button>
                                    </Box>
                                </Stack>
                            </Box>
                        ))
                )}
            </Stack>
        </Paper>
    );
}
