"use client";
import React, { createContext, useContext, useState } from "react";

const PlacementTrainingUIContext = createContext(null);

export function PlacementTrainingUIProvider({ children }) {
  const STORAGE_KEY = "placement_training_ui_state";

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

  const [searchQuery, setSearchQuery] = useState(initial.searchQuery ?? "");
  const [filterPostedDate, setFilterPostedDate] = useState(initial.filterPostedDate ?? "");
  const [filterIndustry, setFilterIndustry] = useState(initial.filterIndustry ?? "");
  const [tab, setTab] = useState(initial.tab ?? "recent");

  React.useEffect(() => {
    try {
      const toStore = JSON.stringify({ searchQuery, filterPostedDate, filterIndustry, tab });
      sessionStorage.setItem(STORAGE_KEY, toStore);
    } catch (e) {
      // ignore
    }
  }, [searchQuery, filterPostedDate, filterIndustry, tab]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterPostedDate("");
    setFilterIndustry("");
  };

  const value = {
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
    <PlacementTrainingUIContext.Provider value={value}>{children}</PlacementTrainingUIContext.Provider>
  );
}

export function usePlacementTrainingUI() {
  return useContext(PlacementTrainingUIContext);
}

export default PlacementTrainingUIContext;
