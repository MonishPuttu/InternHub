"use client";

import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import { PostsUIProvider } from "@/modules/Post/PostsUIContext";
import PlacementPostsSidebar from "@/modules/Post/PlacementPostsSidebar";
import { StudentPostsUIProvider } from "@/modules/Post/StudentPostsUIContext";
import StudentPostsSidebar from "@/modules/Post/StudentPostsSidebar";
import { RecruiterPostsUIProvider } from "@/modules/Post/RecruiterPostsUIContext";
import RecruiterPostsSidebar from "@/modules/Post/RecruiterPostsSidebar";
import PlacementSidebar from "@/modules/Dashboard/PlacementSidebar";
import { PlacementUIProvider } from "@/modules/Dashboard/PlacementUIContext";
import PlacementTrainingSidebar from "@/modules/training/PlacementTrainingSidebar";
import { PlacementTrainingUIProvider } from "@/modules/training/PlacementTrainingUIContext";
import StudentTrainingSidebar from "@/modules/training/StudentTrainingSidebar";
import { StudentTrainingUIProvider } from "@/modules/training/StudentTrainingUIContext";
import CalendarSidebar from "@/modules/calendar/CalendarSidebar";
import { CalendarUIProvider } from "@/modules/calendar/CalendarUIContext";
import RecruiterCalendarSidebar from "@/modules/calendar/RecruiterCalendarSidebar";
import { RecruiterCalendarUIProvider } from "@/modules/calendar/RecruiterCalendarUIContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";

export default function GlobalSidebar({ children }) {
  const pathname = usePathname();
  
  // Post routes - distinguish between student and placement
  const isStudentPostRoute = pathname === "/Post/student" || pathname.startsWith("/Post/student/");
  const isPlacementPostRoute = pathname === "/Post/placement" || pathname.startsWith("/Post/placement/");
  const isRecruiterPostRoute = pathname === "/Post/recruiter" || pathname.startsWith("/Post/recruiter/");
  const isPostDetailsRoute = pathname.startsWith("/Post/postdetails");
  const isPostRoute = pathname.startsWith("/Post");
  
  // Dashboard routes
  const isPlacementDashboard = pathname.startsWith("/dashboard/placement");
  
  // Training routes - distinguish between student and placement
  // Exclude take-assessment routes from sidebar (full screen assessment experience)
  const isTrainingStudentAssessment = pathname.includes("/training/student/take-assessment");
  const isTrainingStudent = (pathname === "/training/student" || pathname.startsWith("/training/student/")) && !isTrainingStudentAssessment;
  const isTrainingPlacement = pathname === "/training/placement" || pathname.startsWith("/training/placement/");
  
  // Calendar routes - distinguish between recruiter and others
  const isRecruiterCalendar = pathname === "/calendar/recruiter" || pathname.startsWith("/calendar/recruiter/");
  const isCalendar = pathname.startsWith("/calendar");

  // STUDENT POSTS: sidebar + page share StudentPostsUIProvider
  if (isStudentPostRoute) {
    return (
      <StudentPostsUIProvider>
        <StudentPostsSidebar />
        <Box sx={{ ml: 11, p: 3 }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </StudentPostsUIProvider>
    );
  }

  // RECRUITER POSTS: sidebar + page share RecruiterPostsUIProvider
  if (isRecruiterPostRoute) {
    return (
      <RecruiterPostsUIProvider>
        <RecruiterPostsSidebar />
        <Box sx={{ ml: 11, p: 3 }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </RecruiterPostsUIProvider>
    );
  }

  // PLACEMENT POSTS or POST DETAILS: sidebar + page share PostsUIProvider
  if (isPlacementPostRoute || isPostDetailsRoute || isPostRoute) {
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

  // STUDENT TRAINING: sidebar + page share StudentTrainingUIProvider
  if (isTrainingStudent) {
    return (
      <StudentTrainingUIProvider>
        <StudentTrainingSidebar />
        <Box sx={{ ml: 11, p: 3 }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </StudentTrainingUIProvider>
    );
  }

  // PLACEMENT TRAINING: sidebar + page share PlacementTrainingUIProvider
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

  // RECRUITER CALENDAR: sidebar + page share RecruiterCalendarUIProvider
  if (isRecruiterCalendar) {
    return (
      <RecruiterCalendarUIProvider>
        <RecruiterCalendarSidebar />
        <Box sx={{ ml: 11, p: 3 }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </RecruiterCalendarUIProvider>
    );
  }

  // OTHER CALENDAR ROUTES (student, placement): sidebar + page share CalendarUIProvider
  if (isCalendar) {
    return (
      <CalendarUIProvider>
        <CalendarSidebar />
        <Box sx={{ ml: 11, p: 3 }}>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </CalendarUIProvider>
    );
  }

  // NON-sidebar routes: normal rendering
  return (
    <Box sx={{ p: 3 }}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </Box>
  );
}
