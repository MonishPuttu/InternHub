"use client";

import React from "react";
import { Paper, Typography, Box, Card, Chip, Button } from "@mui/material";

export default function ProjectsSection({ projects }) {
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
                Projects
            </Typography>
            {projects.length === 0 ? (
                <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>No projects available</Typography>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {projects.map((project, index) => (
                        <Card key={index} sx={{ bgcolor: "background.default", border: "1px solid #334155", p: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: "bold", mb: 0.5 }}>
                                {project.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 1 }}>
                                {project.description}
                            </Typography>
                            {project.technologies && project.technologies.length > 0 && (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
                                    {project.technologies.map((tech, techIndex) => (
                                        <Chip key={techIndex} label={tech} size="small" sx={{ bgcolor: "#8b5cf620", color: "#8b5cf6", fontSize: "0.7rem", height: 20 }} />
                                    ))}
                                </Box>
                            )}
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {project.startDate ? new Date(project.startDate).getFullYear() : "N/A"} - {project.endDate ? new Date(project.endDate).getFullYear() : "Present"}
                                </Typography>
                                {project.projectUrl && (
                                    <Button href={project.projectUrl} target="_blank" size="small" sx={{ color: "#8b5cf6", textTransform: "none", p: 0, minWidth: "auto", fontSize: "0.8rem" }}>
                                        View
                                    </Button>
                                )}
                            </Box>
                        </Card>
                    ))}
                </Box>
            )}
        </Paper>
    );
}
