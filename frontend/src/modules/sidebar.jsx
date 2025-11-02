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
  Description as DescriptionIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Feedback as FeedbackIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalenderIcon,
  WorkOutline as WorkOutlineIcon,
} from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School";

const drawerWidth = 240;

import { getUser } from "@/lib/session";
import { text } from "drizzle-orm/gel-core";

const navigationItems = [
  { text: "Dashboard", icon: <HomeIcon />, path: "/dashboard", roles: null },
  { text: "Posts", icon: <DescriptionIcon />, path: "/post", roles: null },
//   {
//     text: "My Applications",
//     icon: <WorkOutlineIcon />,
//     path: "/my-applications",
//     roles: ["student"],
//   },
  {
    text: "Training",
    icon: <SchoolIcon />,
    path: "/training",
    roles: ["student", "placement"],
  },
  {
    text: "Profile & Resume",
    icon: <PersonIcon />,
    path: "/profile",
    roles: ["student"],
  },
  { text: "Calendar", icon: <CalenderIcon />, path: "/calendar", roles: null },

  {
    text: "Analytics",
    icon: <BarChartIcon />,
    path: "/analytics_rec",
    roles: ["recruiter"],
  },

  {
    text: "Analytics",
    icon: <BarChartIcon />,
    path: "/analytics",
    roles: ["student"],
  },

  {
    text: "Analytics",
    path: "/placement-analytics",
    icon: <BarChartIcon />,
    roles: ["placement"],
  },

  {
    text: "Settings",
    icon: <PersonIcon />,
    path: "/settings",
    roles: ["recruiter", "placement"],
  },

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
          position: { xs: "fixed", md: "relative" },
          height: { xs: "100%", md: "100vh" },
          overflow: "visible",
        },
      }}
    >
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
              if (!item.roles) return true;
              if (!userRole) return false;
              return item.roles.includes(userRole);
            })
            .map((item) => {
              const isActive = pathname.startsWith(item.path);
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
