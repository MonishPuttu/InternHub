"use client";
import React, { createContext, useContext, useState } from "react";

const PlacementUIContext = createContext(null);

export function PlacementUIProvider({ children }) {
  const STORAGE_KEY = "placement_ui_state";

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

  const [filterStatus, setFilterStatus] = useState(initial.filterStatus ?? "all");
  const [searchQuery, setSearchQuery] = useState(initial.searchQuery ?? "");
  const [filterPostedDate, setFilterPostedDate] = useState(initial.filterPostedDate ?? "");
  const [filterIndustry, setFilterIndustry] = useState(initial.filterIndustry ?? "");
  const [tab, setTab] = useState(initial.tab ?? "recent");

  React.useEffect(() => {
    try {
      const toStore = JSON.stringify({ filterStatus, searchQuery, filterPostedDate, filterIndustry, tab });
      sessionStorage.setItem(STORAGE_KEY, toStore);
    } catch (e) {
      // ignore
    }
  }, [filterStatus, searchQuery, filterPostedDate, filterIndustry, tab]);

  const resetFilters = () => {
    setFilterStatus("all");
    setSearchQuery("");
    setFilterPostedDate("");
    setFilterIndustry("");
  };

  const value = {
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    filterPostedDate,
    setFilterPostedDate,
    filterIndustry,
    setFilterIndustry,
    resetFilters,
    tab,
    setTab,
  };

  return (
    <PlacementUIContext.Provider value={value}>
      {children}
    </PlacementUIContext.Provider>
  );
}

export function usePlacementUI() {
  return useContext(PlacementUIContext);
}

export default PlacementUIContext;
