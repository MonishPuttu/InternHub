"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

const PostsUIContext = createContext(null);

export function PostsUIProvider({ children }) {
  // sessionStorage persistence key
  const STORAGE_KEY = "posts_ui_state";

  // initialise from sessionStorage when available
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

  const [activeTab, setActiveTab] = useState(initial.activeTab ?? 0);
  const [industry, setIndustry] = useState(initial.industry ?? "");
  const [search, setSearch] = useState(initial.search ?? "");
  const [counts, setCounts] = useState(initial.counts ?? { pending: 0, approved: 0, disapproved: 0 });

  // persist selected pieces to sessionStorage
  React.useEffect(() => {
    try {
      const toStore = JSON.stringify({ activeTab, industry, search, counts });
      sessionStorage.setItem(STORAGE_KEY, toStore);
    } catch (e) {
      // ignore
    }
  }, [activeTab, industry, search, counts]);

  const resetFilters = useCallback(() => {
    setIndustry("");
    setSearch("");
    setActiveTab(0);
  }, []);

  const value = {
    activeTab,
    setActiveTab,
    industry,
    setIndustry,
    search,
    setSearch,
    resetFilters,
    counts,
    setCounts,
  };

  return (
    <PostsUIContext.Provider value={value}>{children}</PostsUIContext.Provider>
  );
}

export function usePostsUI() {
  return useContext(PostsUIContext);
}

export default PostsUIContext;
