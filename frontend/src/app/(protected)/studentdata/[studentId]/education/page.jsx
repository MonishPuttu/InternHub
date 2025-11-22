"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import EducationSection from "@/modules/studentdata/components/EducationSection";
import axios from "axios";
import { getToken } from "@/lib/session";

export default function EducationPage({ params }) {
    const { studentId } = use(params);
    const router = useRouter();
    const [education, setEducation] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEducation = async () => {
            try {
                const token = getToken();
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/studentdata/${studentId}/education`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data && response.data.ok) {
                    setEducation(response.data.education || []);
                } else {
                    setError("Failed to load education details.");
                }
            } catch (err) {
                setError("Error fetching education data.");
                console.error(err);
            }
        };

        fetchEducation();
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

    if (!education) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading education details...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <EducationSection education={education} />
        </Box>
    );
}
