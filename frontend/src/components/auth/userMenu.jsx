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
import { useTheme } from "@mui/material/styles";
import { Person, Logout, Brightness4, Brightness7 } from "@mui/icons-material";
import { useColorMode } from "@/lib/themeRegistry";
import { getUser, logout } from "@/lib/session";

export default function UserMenu() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const user = getUser();

  // Initialize theme hooks
  const colorMode = useColorMode();
  const theme = useTheme();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    if (user?.role === "placement" || user?.role === "recruiter") {
      router.push("/settings");
    } else {
      router.push("/profile");
    }
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  const handleThemeToggle = () => {
    colorMode.toggleColorMode();
    // Don't close menu when toggling theme
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
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            mt: 1.5,
            minWidth: 220,
            borderRadius: 2,
            "& .MuiMenuItem-root": {
              color: "text.primary",
              px: 2,
              py: 1.5,
              "&:hover": {
                bgcolor: theme.palette.mode === "dark" ? "#334155" : "#f1f5f9",
              },
            },
          },
        }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            {user?.name || "User"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
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

        <Divider
          sx={{
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            my: 1,
          }}
        />

        {/* Theme Toggle */}
        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon>
            {theme.palette.mode === "dark" ? (
              <Brightness7 fontSize="small" sx={{ color: "text.secondary" }} />
            ) : (
              <Brightness4 fontSize="small" sx={{ color: "text.secondary" }} />
            )}
          </ListItemIcon>
          {theme.palette.mode === "dark" ? "Light Mode" : "Dark Mode"}
        </MenuItem>

        <Divider
          sx={{
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            my: 1,
          }}
        />

        {/* View Profile */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Person fontSize="small" sx={{ color: "text.secondary" }} />
          </ListItemIcon>
          View Profile
        </MenuItem>

        <Divider
          sx={{
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            my: 1,
          }}
        />

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
