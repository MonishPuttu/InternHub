const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// Storage keys
const TOKEN_KEY = "token";
const USER_KEY = "user";
const EXPIRES_KEY = "sessionExpires";

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getUser = () => {
  if (typeof window !== "undefined") {
    try {
      const user = localStorage.getItem(USER_KEY);
      if (!user) return null;

      const parsed = JSON.parse(user);

      // Validate user object has required fields
      if (!parsed.role || !parsed.email) {
        console.warn("Invalid user data in localStorage");
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  }
  return null;
};

export const getSessionExpiry = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(EXPIRES_KEY);
  }
  return null;
};

export const isSessionExpired = () => {
  const expiresAt = getSessionExpiry();

  // If no expiry is set, session doesn't expire (changed from true to false)
  if (!expiresAt) return false;

  return new Date() > new Date(expiresAt);
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  const expired = isSessionExpired();

  return !!token && !!user && !expired;
};

export const setAuth = (token, user, expiresAt) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (expiresAt) {
      localStorage.setItem(EXPIRES_KEY, expiresAt);
    }
  }
};

export const clearAuth = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }
};

export const logout = async (redirectPath = "/signin") => {
  try {
    const token = getToken();
    if (token) {
      // Call backend logout endpoint
      await fetch(`${BACKEND_URL}/api/auth/signout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage regardless of API call result
    clearAuth();

    // Use window.location for full page reload (ensures clean state)
    if (typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
  }
};

// Check session validity periodically
export const startSessionChecker = (onExpire) => {
  if (typeof window === "undefined") return null;

  const interval = setInterval(() => {
    if (!isAuthenticated()) {
      clearInterval(interval);
      console.log("Session expired or invalid");
      logout();
      if (onExpire) onExpire();
    }
  }, 60000); // Check every minute

  // Return cleanup function
  return () => clearInterval(interval);
};

// Utility to refresh token (if your backend supports it)
export const refreshToken = async () => {
  try {
    const token = getToken();
    if (!token) return false;

    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token && data.expiresAt) {
        const user = getUser();
        setAuth(data.token, user, data.expiresAt);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
};
