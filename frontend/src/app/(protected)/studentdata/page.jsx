"use client";

import { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/session";
import StudentData from "@/modules/studentdata/studentdata";

export default function StudentDataPage() {
    const router = useRouter();
    const theme = useTheme();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push("/auth/signin");
            return;
        }
        if (currentUser.role !== "placement_cell") {
            router.push("/studentdata");
            return;
        }
        setUser(currentUser);
    }, [router]);



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
            <StudentData />
        </Box>
    );
}
