import { getUser } from "@/lib/session";

const roleAccessMap = {
  "/post_student": ["student"], // Browse posts - only students
  "/post": ["recruiter"], // Create opportunity - only recruiters (route is /post)
  "/post_admin": ["placement"], // Manage posts - only placement cell
};

/**
 * Check if user has access to a route
 * @param {string} route - The route path (e.g., "/post_student")
 * @returns {boolean} - True if user can access, false otherwise
 */
export const canAccessRoute = (route) => {
  const user = getUser();
  
  // If not logged in, deny access
  if (!user) return false;
  
  // Check if route requires role restriction
  const allowedRoles = roleAccessMap[route];
  
  // If route has no restrictions, allow
  if (!allowedRoles) return true;
  
  // Check if user's role is in allowed roles
  return allowedRoles.includes(user.role);
};

/**
 * Get user's role
 * @returns {string|null} - User's role or null if not logged in
 */
export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

/**
 * Check if user is a student
 */
export const isStudent = () => getUserRole() === "student";

/**
 * Check if user is a recruiter
 */
export const isRecruiter = () => getUserRole() === "recruiter";

/**
 * Check if user is placement cell
 */
export const isPlacement = () => getUserRole() === "placement";

export default { canAccessRoute, getUserRole, isStudent, isRecruiter, isPlacement };