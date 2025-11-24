"use client";

import React, { useState, useEffect, use } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/session";
import StudentDashboardBoxes from "@/components/studentdata/StudentDashboardBoxes";

export default function StudentDetailPage({ params }) {
    const router = useRouter();
    const theme = useTheme();
    const [user, setUser] = useState(null);
    const resolvedParams = use(params);
    const studentId = resolvedParams.studentId;

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
            <StudentDashboardBoxes studentId={studentId} />
        </Box>
    );
}
