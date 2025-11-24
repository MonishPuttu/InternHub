"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import SocialLinksSection from "@/components/studentdata/SocialLinksSection";
import axios from "axios";
import { getToken } from "@/lib/session";

export default function SocialLinksPage({ params }) {
  const paramsObject = use(params);
  const { studentId } = paramsObject;
  const router = useRouter();
  const [socialLinks, setSocialLinks] = useState(null);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const token = getToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/studentdata/students/${studentId}/social-links`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data && response.data.ok) {
          setSocialLinks(response.data.socialLinks || null);
        } else {
          setError("Failed to load social links.");
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setNotFound(true);
          setSocialLinks(null);
          setError("");
        } else {
          setError("Error fetching social links data.");
          setNotFound(false);
        }
        console.error(err);
      }
    };

    fetchSocialLinks();
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

  if (!socialLinks) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading social links...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <SocialLinksSection socialLinks={socialLinks} />
    </Box>
  );
}
