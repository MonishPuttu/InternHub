"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

const RecruiterPostsUIContext = createContext(null);

export function RecruiterPostsUIProvider({ children }) {
  const STORAGE_KEY = "recruiter_posts_ui_state";

  const readInitial = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  };

  const initial = typeof window !== "undefined" ? readInitial() : {};

  const [activeTab, setActiveTab] = useState(initial.activeTab ?? 0); // 0=pending, 1=approved, 2=disapproved
  const [counts, setCounts] = useState(initial.counts ?? { pending: 0, approved: 0, disapproved: 0 });

  React.useEffect(() => {
    try {
      const toStore = JSON.stringify({ activeTab, counts });
      sessionStorage.setItem(STORAGE_KEY, toStore);
    } catch (e) {
      // ignore
    }
  }, [activeTab, counts]);

  const value = {
    activeTab,
    setActiveTab,
    counts,
    setCounts,
  };

  return (
    <RecruiterPostsUIContext.Provider value={value}>
      {children}
    </RecruiterPostsUIContext.Provider>
  );
}

export function useRecruiterPostsUI() {
  return useContext(RecruiterPostsUIContext);
}

export default RecruiterPostsUIContext;
