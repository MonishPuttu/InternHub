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

const drawerWidth = 240;

import { getUser } from "@/lib/session";

const navigationItems = [
  { text: "Dashboard", icon: <HomeIcon />, path: "/dashboard", roles: null },

  { text: "Posts", icon: <DescriptionIcon />, path: "/Post", roles: null },

  {
    text: "My Applications",
    icon: <WorkOutlineIcon />,
    path: "/my-applications",
    roles: ["student"],
  },
  {
    text: "Profile & Resume",
    icon: <PersonIcon />,
    path: "/profile",
    roles: null,
  },
  {
    text: "Calendar",
    icon: <CalenderIcon />,
    path: "/calendar",
    roles: ["recruiter"],
  },
  {
    text: "Calendar",
    icon: <CalenderIcon />,
    path: "/cal_admin",
    roles: ["placement"],
  },
  {
    text: "Calendar",
    icon: <CalenderIcon />,
    path: "/cal_students",
    roles: ["student"],
  },
  {
    text: "Analytics",
    icon: <BarChartIcon />,
    path: "/analytics",
    roles: null,
  },
  { text: "Chat", icon: <FeedbackIcon />, path: "/chat", roles: null },
];

export default function Sidebar({
  variant = "permanent",
  open = false,
  onClose = () => {},
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

        <Box sx={{ px: 2, pb: 2, mb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#071026",
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              border: "1px solid rgba(255, 255, 255, 0.03)",
            }}
          >
            <SearchIcon sx={{ color: "#64748b", fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                color: "#94a3b8",
                fontSize: "0.875rem",
                "& input::placeholder": { color: "#64748b", opacity: 1 },
              }}
            />
            <IconButton size="small" sx={{ p: 0.5 }}>
              <ArrowForwardIcon sx={{ color: "#64748b", fontSize: 18 }} />
            </IconButton>
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
