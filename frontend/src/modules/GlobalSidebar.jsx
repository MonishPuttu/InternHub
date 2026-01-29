"use client";

import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import { PostsUIProvider } from "@/modules/Post/PostsUIContext";
import PlacementPostsSidebar from "@/modules/Post/PlacementPostsSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";

export default function GlobalSidebar({ children }) {
  const pathname = usePathname();
  const isPostRoute = pathname.startsWith("/Post");

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

  // NON-POST routes: normal rendering
  return (
    <Box sx={{ p: 3 }}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </Box>
  );
}
