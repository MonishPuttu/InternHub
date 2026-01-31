"use client";
import React, { createContext, useContext, useState } from "react";

const StudentTrainingUIContext = createContext(null);

export function StudentTrainingUIProvider({ children }) {
  const STORAGE_KEY = "student_training_ui_state";

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

  // Tabs: "new" | "ongoing" | "completed"
  const [tab, setTab] = useState(initial.tab ?? "new");
  const [counts, setCounts] = useState(initial.counts ?? { new: 0, ongoing: 0, completed: 0 });

  React.useEffect(() => {
    try {
      const toStore = JSON.stringify({ tab, counts });
      sessionStorage.setItem(STORAGE_KEY, toStore);
    } catch (e) {
      // ignore
    }
  }, [tab, counts]);

  const value = {
    tab,
    setTab,
    counts,
    setCounts,
  };

  return (
    <StudentTrainingUIContext.Provider value={value}>{children}</StudentTrainingUIContext.Provider>
  );
}

export function useStudentTrainingUI() {
  return useContext(StudentTrainingUIContext);
}

export default StudentTrainingUIContext;
