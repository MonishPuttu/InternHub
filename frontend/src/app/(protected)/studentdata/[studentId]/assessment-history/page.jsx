"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import AssessmentHistorySection from "@/modules/studentdata/components/AssessmentHistorySection";
import axios from "axios";
import { getToken } from "@/lib/session";

export default function AssessmentHistoryPage({ params }) {
    const { studentId } = use(params);
    const router = useRouter();
    const [assessmentHistory, setAssessmentHistory] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssessmentHistory = async () => {
            try {
                const token = getToken();
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/studentdata/students/${studentId}/assessments`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data && response.data.ok) {
                    setAssessmentHistory(response.data.assessments || []);
                } else {
                    setError("Failed to load assessment history.");
                }
            } catch (err) {
                setError("Error fetching assessment history data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssessmentHistory();
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
                <Typography>Loading assessment history...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <AssessmentHistorySection assessmentHistory={assessmentHistory} />
        </Box>
    );
}
