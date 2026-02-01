"use client";

import { useRouter } from "next/navigation";
import { Box, Avatar, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getUser } from "@/lib/session";

export default function UserMenu() {
  const router = useRouter();
  const user = getUser();
  const theme = useTheme();

  const handleProfile = () => {
    if (user?.role === "placement" || user?.role === "recruiter") {
      router.push("/settings");
    } else {
      router.push("/profile");
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleProfile();
    }
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleProfile}
      onKeyDown={handleKeyDown}
      aria-label={`View profile for ${user?.name || "User"}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        cursor: "pointer",
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        transition: "background-color 0.2s",
        "&:hover, &:focus-visible": {
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.04)",
          outline: "none",
        },
        "&:focus-visible": {
          boxShadow: "0 0 0 2px #8b5cf6",
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: "#8b5cf6",
          width: 36,
          height: 36,
          fontSize: "0.85rem",
          fontWeight: 600,
        }}
      >
        {getInitials(user?.name)}
      </Avatar>
      <Box sx={{ textAlign: "left" }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: (t) => (t.palette.mode === "dark" ? "#e2e8f0" : "#1e293b"),
            lineHeight: 1.2,
            fontSize: "0.85rem",
          }}
        >
          {user?.name || "User"}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: (t) => (t.palette.mode === "dark" ? "#94a3b8" : "#64748b"),
            fontSize: "0.7rem",
            textTransform: "capitalize",
          }}
        >
          {user?.role || "User"}
        </Typography>
      </Box>
    </Box>
  );
}
