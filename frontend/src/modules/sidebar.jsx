"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  CalendarToday as CalenderIcon,
  WorkOutline as WorkOutlineIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School";
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
];

const getFilteredNavigationItems = (user) => {
  if (!user) return navigationItems;

  if (user.role === "student" && user.isHigherEducationOpted) {
    return navigationItems.filter(
      (item) => item.text === "Dashboard" || item.text === "Profile & Resume"
    );
  }

  return navigationItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });
};

export default function TopBar({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = typeof window !== "undefined" ? getUser() : null;
  const userRole = user ? user.role : null;

  const handleNavigation = (path) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const filteredItems = getFilteredNavigationItems(user).filter((item) => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  const isActive = (itemPath) => {
    if (itemPath === "/training/student/report-card") {
      return pathname.startsWith("/training/student/report-card");
    } else if (itemPath === "/training") {
      return (
        pathname === "/training" ||
        pathname.startsWith("/training/placement") ||
        pathname.startsWith("/training/student/leaderboard")
      );
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.04)"
              : "rgba(0, 0, 0, 0.08)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              fontSize: 18,
              cursor: "pointer",
            }}
            onClick={() => handleNavigation("/dashboard")}
          >
            InternHub
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1, flexGrow: 1, ml: 4 }}>
              {filteredItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: active
                        ? "#a78bfa"
                        : theme.palette.mode === "dark"
                          ? "#94a3b8"
                          : "#64748b",
                      backgroundColor: active
                        ? alpha("#8b5cf6", 0.12)
                        : "transparent",
                      fontWeight: active ? 600 : 400,
                      fontSize: "0.875rem",
                      textTransform: "none",
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: active
                          ? alpha("#8b5cf6", 0.18)
                          : alpha("#8b5cf6", 0.04),
                      },
                      "& .MuiButton-startIcon": {
                        color: active
                          ? "#a78bfa"
                          : theme.palette.mode === "dark"
                            ? "#64748b"
                            : "#94a3b8",
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* User Menu - Render children (UserMenu) here */}
          {!isMobile && children}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {children}
              <IconButton
                color="inherit"
                edge="end"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            backgroundColor: "background.default",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "text.primary",
                fontWeight: 700,
              }}
            >
              InternHub
            </Typography>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {filteredItems.map((item) => {
              const active = isActive(item.path);
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: active
                        ? alpha("#8b5cf6", 0.12)
                        : "transparent",
                      color: active
                        ? "#a78bfa"
                        : theme.palette.mode === "dark"
                          ? "#94a3b8"
                          : "#64748b",
                      "&:hover": {
                        backgroundColor: active
                          ? alpha("#8b5cf6", 0.18)
                          : alpha("#8b5cf6", 0.04),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: active
                          ? "#a78bfa"
                          : theme.palette.mode === "dark"
                            ? "#64748b"
                            : "#94a3b8",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: active ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
}