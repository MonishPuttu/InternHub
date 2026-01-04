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
import { useTheme } from "@mui/material/styles";
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
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School";

const drawerWidth = 240;

import { getUser } from "@/lib/session";

const navigationItems = [
  { text: "Dashboard", icon: <HomeIcon />, path: "/dashboard", roles: null },
  { text: "Posts", icon: <DescriptionIcon />, path: "/Post", roles: null },
  {
    text: "Training",
    icon: <SchoolIcon />,
    path: "/training",
    roles: ["student", "placement"],
  },
  {
    text: "Report Cards",
    icon: <AssessmentIcon />,
    path: "/training/student/report-card",
    roles: ["student"],
  },
  {
    text: "Profile & Resume",
    icon: <PersonIcon />,
    path: "/profile",
    roles: ["student"],
  },
  { text: "Calendar", icon: <CalenderIcon />, path: "/calendar", roles: null },

  /*
  {
    text: "Analytics",
    icon: <BarChartIcon />,
    path: "/analytics_rec",
    roles: ["recruiter"],
  },
  */

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
    text: "Student Data",
    path: "/studentdata",
    icon: <WorkOutlineIcon />,
    roles: ["placement"],
  },
  {
    text: "Timeline",
    icon: <TimelineIcon />,
    path: "/timeline",
    roles: ["student"],
  },

  {
    text: "Settings",
    icon: <PersonIcon />,
    path: "/settings",
    roles: ["recruiter", "placement"],
  },

  { text: "Chat", icon: <FeedbackIcon />, path: "/chat", roles: ["student", "placement"] },
];

const getFilteredNavigationItems = (user) => {
  if (!user) return navigationItems;

  // If student has opted for higher education, show only Dashboard and Profile & Resume
  if (user.role === "student" && user.isHigherEducationOpted) {
    return navigationItems.filter(
      (item) => item.text === "Dashboard" || item.text === "Profile & Resume"
    );
  }

  // Default filtering by roles
  return navigationItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });
};

export default function Sidebar({
  variant = "permanent",
  open = false,
  onClose = () => {},
}) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme(); // Add theme hook
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
          backgroundColor: "background.default", // Changed
          borderRight: "1px solid",
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.04)"
              : "rgba(0, 0, 0, 0.08)", // Dynamic border
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
              color: "text.primary", // Changed
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
          {getFilteredNavigationItems(user)
            .filter((item) => {
              if (!item.roles) return true;
              if (!userRole) return false;
              return item.roles.includes(userRole);
            })
            .map((item) => {
              let isActive = false;

              if (item.path === "/training/student/report-card") {
                isActive = pathname.startsWith("/training/student/report-card");
              } else if (item.path === "/training") {
                isActive =
                  pathname === "/training" ||
                  pathname.startsWith("/training/placement") ||
                  pathname.startsWith("/training/student/leaderboard");
              } else {
                isActive = pathname.startsWith(item.path);
              }

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
                      color: isActive
                        ? "#a78bfa"
                        : theme.palette.mode === "dark"
                        ? "#94a3b8"
                        : "#64748b", // Dynamic text color
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
                        color: isActive
                          ? "#a78bfa"
                          : theme.palette.mode === "dark"
                          ? "#64748b"
                          : "#94a3b8", // Dynamic icon color
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
