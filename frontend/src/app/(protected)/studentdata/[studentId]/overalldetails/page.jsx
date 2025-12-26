"use client";

import React, { useState, useEffect, use } from "react";
import { Box, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser } from "@/lib/session";
import OverallDetailsConsolidated from "@/components/studentdata/OverallDetailsConsolidated";

export default function OverallDetailsPage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState(null);
    const studentId = searchParams.get("studentId");

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push("/auth/signin");
            return;
        }
        setUser(currentUser);
    }, [router]);

    if (!studentId) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                backgroundColor: "background.default",
                color: "text.primary",
            }}
        >
            <OverallDetailsConsolidated studentId={studentId} />
        </Box>
    );
}