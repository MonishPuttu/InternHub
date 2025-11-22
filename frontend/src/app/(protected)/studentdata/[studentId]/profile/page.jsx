"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import ProfileSection from "@/modules/studentdata/components/ProfileSection";
import axios from "axios";
import { getToken } from "@/lib/session";

export default function ProfilePage({ params }) {
  const { studentId } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/studentdata/students/${studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data && response.data.ok) {
          setProfile(response.data.student || null);
        } else {
          setError("Failed to load profile.");
        }
      } catch (err) {
        setError("Error fetching profile data.");
        console.error(err);
      }
    };

    fetchProfile();
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

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading profile details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ProfileSection profile={profile} />
    </Box>
  );
}
