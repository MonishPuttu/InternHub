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
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
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
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
};

export const isAuthenticated = () => {
  return !!getToken() && !isSessionExpired();
};

export const setAuth = (token, user, expiresAt) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(EXPIRES_KEY, expiresAt);
  }
};

export const logout = async () => {
  try {
    const token = getToken();
    if (token) {
      // Call backend logout endpoint
      await fetch(`${BACKEND_URL}/api/auth/signout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage regardless of API call result
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(EXPIRES_KEY);
      window.location.href = "/signin";
    }
  }
};

// Check session validity periodically
export const startSessionChecker = (onExpire) => {
  if (typeof window === "undefined") return;

  const interval = setInterval(() => {
    if (isSessionExpired()) {
      clearInterval(interval);
      logout();
      if (onExpire) onExpire();
    }
  }, 60000); // Check every minute

  return () => clearInterval(interval);
};
