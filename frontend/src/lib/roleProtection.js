import { getUser } from "@/lib/session";

const roleAccessMap = {
  // Dashboard routes
  "/dashboard/student": ["student"],
  "/dashboard/placement": ["placement"],
  "/dashboard/recruiter": ["recruiter"],

  // Post routes
  "/Post/student": ["student"],
  "/Post/placement": ["placement"],
  "/Post/recruiter": ["recruiter"],
  "/Post/postdetails": ["student", "placement", "recruiter"],

  // Calendar routes
  "/calendar/recruiter": ["recruiter"],
  "/calendar/placement": ["placement"],
  "/calendar/student": ["student"],

  // Training routes
  "/training/student": ["student"],
  "/training/student/assessments": ["student"],
  "/training/student/take-assessment": ["student"],
  "/training/student/report-card": ["student"],
  "/training/placement": ["placement"],
  "/training/placement/create-assessment": ["placement"],
  "/training/placement/leaderboard": ["placement"],

  // Other routes
  "/my-applications": ["student"],
  "/analytics": ["student", "placement", "recruiter"],
  "/profile": ["student", "placement", "recruiter"],
  "/chat": ["student", "placement", "recruiter"],
};

export const canAccessRoute = (route) => {
  const user = getUser();

  // If not logged in, deny access
  if (!user) return false;

  // Check for exact match first
  if (roleAccessMap[route]) {
    return roleAccessMap[route].includes(user.role);
  }

  // Check for pattern matches (e.g., /Post/postdetails/[id])
  for (const [pattern, allowedRoles] of Object.entries(roleAccessMap)) {
    if (route.startsWith(pattern)) {
      return allowedRoles.includes(user.role);
    }
  }

  // If route not in map, allow access (public route within protected area)
  return true;
};

export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

export const isStudent = () => getUserRole() === "student";

export const isRecruiter = () => getUserRole() === "recruiter";

export const isPlacement = () => getUserRole() === "placement";

export default {
  canAccessRoute,
  getUserRole,
  isStudent,
  isRecruiter,
  isPlacement,
};
