"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

const StudentPostsUIContext = createContext(null);

export function StudentPostsUIProvider({ children }) {
  const STORAGE_KEY = "student_posts_ui_state";

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

  // Tabs: "available" | "applied" | "history"
  const [activeTab, setActiveTab] = useState(initial.activeTab ?? "available");
  const [industry, setIndustry] = useState(initial.industry ?? "");
  const [search, setSearch] = useState(initial.search ?? "");
  const [showSavedOnly, setShowSavedOnly] = useState(initial.showSavedOnly ?? false);
  const [counts, setCounts] = useState(initial.counts ?? { available: 0, applied: 0, history: 0 });

  React.useEffect(() => {
    try {
      const toStore = JSON.stringify({ activeTab, industry, search, showSavedOnly, counts });
      sessionStorage.setItem(STORAGE_KEY, toStore);
    } catch (e) {
      // ignore
    }
  }, [activeTab, industry, search, showSavedOnly, counts]);

  const resetFilters = useCallback(() => {
    setIndustry("");
    setSearch("");
    setShowSavedOnly(false);
    setActiveTab("available");
  }, []);

  const value = {
    activeTab,
    setActiveTab,
    industry,
    setIndustry,
    search,
    setSearch,
    showSavedOnly,
    setShowSavedOnly,
    resetFilters,
    counts,
    setCounts,
  };

  return (
    <StudentPostsUIContext.Provider value={value}>{children}</StudentPostsUIContext.Provider>
  );
}

export function useStudentPostsUI() {
  return useContext(StudentPostsUIContext);
}

export default StudentPostsUIContext;
