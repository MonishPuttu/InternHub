"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import ProjectsSection from "@/modules/studentdata/components/ProjectsSection";
import axios from "axios";
import { getToken } from "@/lib/session";


export default function ProjectsPage({ params }) {
    const { studentId } = use(params);
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = getToken();
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/studentdata/students/${studentId}/projects`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data && response.data.ok) {
                    // Previous code: setProjects(response.data.projects || []);
                    // Transform projects to ensure technologies is an array
                    const transformedProjects = (response.data.projects || []).map(project => {
                        let techArray = [];
                        if (project.technologies && typeof project.technologies === "string") {
                            techArray = project.technologies.split(",").map(t => t.trim()).filter(t => t.length > 0);
                        }
                        return {
                            ...project,
                            technologies: techArray,
                        };
                    });
                    setProjects(transformedProjects);
                } else {
                    setError("Failed to load projects.");
                }
            } catch (err) {
                setError("Error fetching projects data.");
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [studentId]);

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading projects...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <ProjectsSection projects={projects} />
        </Box>
    );
}
