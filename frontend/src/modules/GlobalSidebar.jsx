"use client";

import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import { PostsUIProvider } from "@/modules/Post/PostsUIContext";
import PlacementPostsSidebar from "@/modules/Post/PlacementPostsSidebar";
import PlacementSidebar from "@/modules/Dashboard/PlacementSidebar";
import { PlacementUIProvider } from "@/modules/Dashboard/PlacementUIContext";
import PlacementTrainingSidebar from "@/modules/training/PlacementTrainingSidebar";
import { PlacementTrainingUIProvider } from "@/modules/training/PlacementTrainingUIContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";

export default function GlobalSidebar({ children }) {
  const pathname = usePathname();
  const isPostRoute = pathname.startsWith("/Post");
  const isPlacementDashboard = pathname.startsWith("/dashboard/placement");
  const isTrainingPlacement = pathname.startsWith("/training/placement");

  // POSTS: sidebar + page share PostsUIProvider
  if (isPostRoute) {
    return (
      <PostsUIProvider>
        <PlacementPostsSidebar />
        <Box sx={{ ml: 11, p: 3 }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </PostsUIProvider>
    );
  }

  if (isPlacementDashboard) {
    return (
      <PlacementUIProvider>
        <PlacementSidebar />
        <Box sx={{ ml: 11, p: 3 }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </PlacementUIProvider>
    );
  }

  if (isTrainingPlacement) {
    return (
      <PlacementTrainingUIProvider>
        <PlacementTrainingSidebar />
        <Box sx={{ ml: 11, p: 3 }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </PlacementTrainingUIProvider>
    );
  }

  // NON-POST routes: normal rendering
  return (
    <Box sx={{ p: 3 }}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </Box>
  );
}
