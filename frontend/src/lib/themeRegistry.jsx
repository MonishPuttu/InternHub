"use client";

import { createContext, useState, useMemo, useContext, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export default function ThemeRegistry({ children }) {
  const [mode, setMode] = useState("dark");

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("themeMode", newMode);
          return newMode;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#8b5cf6", // Your purple
          },
          secondary: {
            main: mode === "dark" ? "#822659" : "#8b5cf6", // Ruby in dark, purple in light
          },
          background: {
            default: mode === "dark" ? "#1A1A1A" : "#f1f5f9",
            paper: mode === "dark" ? "#232323" : "#ffffff",
          },
          text: {
            primary: mode === "dark" ? "#F0F0F0" : "#0f172a",
            secondary: mode === "dark" ? "#888888" : "#64748b",
          },
          action: {
            active: mode === "dark" ? "#8b5cf6" : "#8b5cf6", // Purple for buttons in both modes
          },
        },
        typography: {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
