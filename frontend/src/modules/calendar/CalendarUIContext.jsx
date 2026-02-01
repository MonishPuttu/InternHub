"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CalendarUIContext = createContext(null);

export function CalendarUIProvider({ children }) {
  const storageKey = "calendar_ui_state";
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
    <CalendarUIContext.Provider value={{ filterType, setFilterType }}>
      {children}
    </CalendarUIContext.Provider>
  );
}

export function useCalendarUI() {
  return useContext(CalendarUIContext);
}

export default CalendarUIContext;
