"use client";

import React from "react";
import { Paper, Typography, Grid, Card, Button } from "@mui/material";

export default function SocialLinksSection({ socialLinks }) {
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
                Social Links
            </Typography>
            {!socialLinks?.portfolioWebsite && !socialLinks?.linkedinProfile && !socialLinks?.githubProfile ? (
                <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                    No social links available
                </Typography>
            ) : (
                <Grid container spacing={1.5}>
                    {socialLinks.portfolioWebsite && (
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ bgcolor: "background.default", border: "1px solid #334155", textAlign: "center", p: 1.5 }}>
                                <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontWeight: 600, display: "block", mb: 0.5 }}>
                                    Portfolio
                                </Typography>
                                <Button href={socialLinks.portfolioWebsite} target="_blank" sx={{ color: "#8b5cf6", textTransform: "none", fontSize: "0.85rem", p: 0 }}>
                                    View Site
                                </Button>
                            </Card>
                        </Grid>
                    )}
                    {socialLinks.linkedinProfile && (
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ bgcolor: "background.default", border: "1px solid #334155", textAlign: "center", p: 1.5 }}>
                                <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontWeight: 600, display: "block", mb: 0.5 }}>
                                    LinkedIn
                                </Typography>
                                <Button href={socialLinks.linkedinProfile} target="_blank" sx={{ color: "#8b5cf6", textTransform: "none", fontSize: "0.85rem", p: 0 }}>
                                    View Profile
                                </Button>
                            </Card>
                        </Grid>
                    )}
                    {socialLinks.githubProfile && (
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ bgcolor: "background.default", border: "1px solid #334155", textAlign: "center", p: 1.5 }}>
                                <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontWeight: 600, display: "block", mb: 0.5 }}>
                                    GitHub
                                </Typography>
                                <Button href={socialLinks.githubProfile} target="_blank" sx={{ color: "#8b5cf6", textTransform: "none", fontSize: "0.85rem", p: 0 }}>
                                    View Profile
                                </Button>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            )}
        </Paper>
    );
}
