"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, CircularProgress } from "@mui/material";
import ApplicationsOffersSection from "@/modules/studentdata/components/ApplicationsOffersSection";
import axios from "axios";
import { getToken } from "@/lib/session";
import { use } from "react";

export default function ApplicationsOffersPage({ params }) {
    const studentParams = use(params);
    const studentId = studentParams.studentId;
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [offers, setOffers] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApplicationsAndOffers = async () => {
            try {
                setIsLoading(true);
                const token = getToken();
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/studentdata/students/${studentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log('API Response:', response.data);

                if (response.data && response.data.ok) {
                    setApplications(response.data.student.applications || []);
                    setOffers(response.data.student.offers || []);
                } else {
                    setError("Failed to load applications and offers.");
                }
            } catch (err) {
                setError("Error fetching applications and offers.");
                console.error('Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplicationsAndOffers();
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

    if (isLoading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading applications and offers...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <ApplicationsOffersSection applications={applications} offers={offers} />
        </Box>
    );
}