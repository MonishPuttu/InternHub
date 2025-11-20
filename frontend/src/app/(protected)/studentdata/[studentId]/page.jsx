"use client";

import { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/session";
import StudentDetail from "@/modules/studentdata/StudentDetail";

export default function StudentDetailPage({ params }) {
    const router = useRouter();
    const theme = useTheme();
    const [user, setUser] = useState(null);
    const [studentId, setStudentId] = useState(null);

    useEffect(() => {
        const extractParams = async () => {
            try {
                const resolvedParams = await params;
                setStudentId(resolvedParams.studentId);
            } catch (err) {
                console.error("Error extracting params:", err);
                router.push("/studentdata");
            }
        };

        extractParams();

        const currentUser = getUser();
        if (!currentUser) {
            router.push("/auth/signin");
            return;
        }
        setUser(currentUser);
    }, [router, params]);

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
            <StudentDetail studentId={studentId} />
        </Box>
    );
}
