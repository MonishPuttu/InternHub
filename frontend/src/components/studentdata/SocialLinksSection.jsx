"use client";

import React from "react";
import { Paper, Typography, Box, Stack, IconButton, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
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
            icon: <LanguageIcon sx={{ fontSize: 28, color: "text.primary" }} />,
            buttonLabel: "View Site",
        },
        {
            key: "linkedinProfile",
            label: "LinkedIn",
            url: socialLinks?.linkedinProfile,
            icon: <LinkedInIcon sx={{ fontSize: 28, color: "#0A66C2" }} />,
            buttonLabel: "View Profile",
        },
        {
            key: "githubProfile",
            label: "GitHub",
            url: socialLinks?.githubProfile,
            icon: <GitHubIcon sx={{ fontSize: 28, color: "text.primary" }} />,
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