"use client";

import { createContext, useContext, useState, useEffect } from "react";

const RecruiterCalendarUIContext = createContext(null);

export function RecruiterCalendarUIProvider({ children }) {
  const storageKey = "recruiter_calendar_ui_state";
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.filterType) setFilterType(parsed.filterType);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ filterType }));
    } catch (e) {}
  }, [filterType]);

  return (
    <RecruiterCalendarUIContext.Provider value={{ filterType, setFilterType }}>
      {children}
    </RecruiterCalendarUIContext.Provider>
  );
}

export function useRecruiterCalendarUI() {
  return useContext(RecruiterCalendarUIContext);
}

export default RecruiterCalendarUIContext;
