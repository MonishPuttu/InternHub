"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { Person, Logout } from "@mui/icons-material";
import { getUser, logout } from "@/lib/session";

export default function UserMenu() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const user = getUser();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    router.push("/dashboard/profile");
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
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

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ p: 0 }}>
        <Avatar
          sx={{
            bgcolor: "#8b5cf6",
            width: 40,
            height: 40,
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          {getInitials(user?.name)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            mt: 1.5,
            minWidth: 220,
            borderRadius: 2,
            "& .MuiMenuItem-root": {
              color: "#e2e8f0",
              px: 2,
              py: 1.5,
              "&:hover": {
                bgcolor: "#334155",
              },
            },
          },
        }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "#e2e8f0", fontWeight: 600 }}
          >
            {user?.name || "User"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            {user?.email}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#8b5cf6",
              display: "block",
              mt: 0.5,
              textTransform: "capitalize",
            }}
          >
            {user?.role}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#334155", my: 1 }} />

        {/* View Profile */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Person fontSize="small" sx={{ color: "#94a3b8" }} />
          </ListItemIcon>
          View Profile
        </MenuItem>

        <Divider sx={{ borderColor: "#334155", my: 1 }} />

        {/* Logout */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: "#ef4444" }} />
          </ListItemIcon>
          <Typography sx={{ color: "#ef4444" }}>Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
