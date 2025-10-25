"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputBase,
  IconButton,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  EmojiEvents as EmojiEventsIcon,
  Feedback as FeedbackIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalenderIcon
} from "@mui/icons-material";

const drawerWidth = 240;

import { getUser } from "@/lib/session";

const navigationItems = [
  { text: "Dashboard", icon: <HomeIcon />, path: "/dashboard", roles: null },

  { text: "Browse Posts", icon: <DescriptionIcon />, path: "/post_student", roles: ["student"] },
  { text: "Post Opportunity", icon: <DescriptionIcon />, path: "/post_recruiter", roles: ["recruiter"] },
  { text: "Manage Posts", icon: <DescriptionIcon />, path: "/post_admin", roles: ["placement"] },

  { text: "Profile & Resume", icon: <PersonIcon />, path: "/profile", roles: null },
  { text: "Calendar", icon: <CalenderIcon />, path: "/calendar", roles: ["recruiter"] },
  { text: "Calendar", icon: <CalenderIcon />, path: "/cal_admin", roles: ["placement"] },
  { text: "Calendar", icon: <CalenderIcon />, path: "/cal_students", roles: ["student"] },
  { text: "Analytics", icon: <BarChartIcon />, path: "/analytics", roles: null },

  { text: "Chat", icon: <FeedbackIcon />, path: "/chat", roles: null },

];

export default function Sidebar({
  variant = "permanent",
  open = false,
  onClose = () => { },
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavigation = (path) => {
    router.push(path);
    if (variant === "temporary" && typeof onClose === "function") onClose();
  };

  const user = typeof window !== "undefined" ? getUser() : null;
  const userRole = user ? user.role : null;

  const drawerDisplay =
    variant === "permanent"
      ? { xs: "none", md: "block" }
      : { xs: "block", md: "block" };

  return (
    <Drawer
      variant={variant}
      open={variant === "temporary" ? open : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: drawerDisplay,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#0f172a",
          borderRight: "1px solid rgba(255, 255, 255, 0.04)",
          // overlay on xs, in-flow on md+
          position: { xs: "fixed", md: "relative" },
          height: { xs: "100%", md: "100vh" },
          overflow: "visible",
        },
      }}
    >
      {" "}
      <Box sx={{ width: drawerWidth, pt: 2 }}>
        <Box sx={{ px: 2, mb: 1 }}>
          <Box
            sx={{
              color: "#e2e8f0",
              fontWeight: 700,
              fontSize: 18,
              px: 1,
              py: 0.5,
            }}
          >
            InternHub
          </Box>
        </Box>

        <List sx={{ px: 1.5 }}>
          {navigationItems
            .filter((item) => {
              // If roles is null -> public item
              if (!item.roles) return true;
              // If user not available, hide role-restricted items
              if (!userRole) return false;
              return item.roles.includes(userRole);
            })
            .map((item) => {
              const isActive = pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 1,
                      py: 1,
                      px: 1.5,
                      backgroundColor: isActive
                        ? alpha("#8b5cf6", 0.12)
                        : "transparent",
                      color: isActive ? "#a78bfa" : "#94a3b8",
                      "&:hover": {
                        backgroundColor: isActive
                          ? alpha("#8b5cf6", 0.18)
                          : alpha("#8b5cf6", 0.04),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isActive ? "#a78bfa" : "#64748b",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>

        <Box sx={{ px: 2, mt: 2 }}></Box>
      </Box>
    </Drawer>
  );
}
