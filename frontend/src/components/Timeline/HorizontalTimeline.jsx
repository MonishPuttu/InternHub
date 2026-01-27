"use client";

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Paper, useTheme, alpha } from "@mui/material";

export default function HorizontalTimeline({ items = [] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  /* --------------------------------------------------
     Resolve current index
  -------------------------------------------------- */
  const currentIndex = useMemo(() => {
    const explicit = items.findIndex((it) =>
      ["current", "active", "important", "in_progress"].includes(
        (it.status || "").toLowerCase()
      )
    );
    if (explicit !== -1) return explicit;

    // fallback: first future event
    const now = Date.now();
    const future = items.findIndex(
      (it) => it.date && new Date(it.date).getTime() > now
    );
    return future === -1 ? items.length - 1 : future;
  }, [items]);

  /* --------------------------------------------------
     Progress calculation (START → CURRENT)
  -------------------------------------------------- */
  const totalSegments = Math.max(1, items.length - 1);
  const progressRatio = Math.min(
    1,
    Math.max(0, currentIndex / totalSegments)
  );

  /* --------------------------------------------------
     Animations
  -------------------------------------------------- */
  const keyframes = `
    @keyframes growLine {
      from { width: 0%; }
      to { width: var(--target-width); }
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 ${alpha(theme.palette.error.main, 0.35)}; }
      70% { box-shadow: 0 0 0 14px ${alpha(theme.palette.error.main, 0)}; }
      100% { box-shadow: 0 0 0 0 ${alpha(theme.palette.error.main, 0)}; }
    }

    @keyframes nodePop {
      from { transform: scale(0.9); opacity: 0.6; }
      to { transform: scale(1); opacity: 1; }
    }
  `;

  /* --------------------------------------------------
     Colors (theme-aware)
  -------------------------------------------------- */
  const bg = isDark
    ? "linear-gradient(180deg,#020617,#020617)"
    : "linear-gradient(180deg,#f8fafc,#eef2ff)";

  const cardBg = isDark
    ? alpha(theme.palette.common.white, 0.04)
    : theme.palette.common.white;

  const lineBase = alpha(theme.palette.text.primary, 0.15);

  return (
    <Box sx={{ width: "100%", py: 6, px: { xs: 2, md: 6 }, background: bg }}>
      <style>{keyframes}</style>

      {/* DATES */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        {items.map((it, i) => (
          <Box key={i} flex={1} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              {it.date ? new Date(it.date).toLocaleDateString() : ""}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* LINE + NODES */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        {items.map((it, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          const lineColor = isCompleted
            ? theme.palette.success.main
            : alpha(theme.palette.text.primary, 0.25);

          const dotSize = isCurrent ? 22 : 14;

          return (
            <Box
              key={it.id || idx}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* LEFT LINE */}
              {idx !== 0 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    bgcolor: lineColor,
                    transition: "background-color 300ms ease",
                  }}
                />
              )}

              {/* DOT GAP */}
              <Box
                sx={{
                  width: 36,              // GAP WIDTH (Figma-perfect)
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: "50%",
                    bgcolor: isCompleted
                      ? theme.palette.success.main
                      : isCurrent
                      ? theme.palette.error.main
                      : "transparent",
                    border: isUpcoming
                      ? `2px solid ${alpha(theme.palette.text.primary, 0.4)}`
                      : "none",
                    boxShadow: isCurrent
                      ? `0 0 0 6px ${alpha(theme.palette.error.main, 0.25)}`
                      : "none",
                    transition: "all 240ms ease",
                    animation: isCurrent
                      ? "pulse 1.8s infinite"
                      : "none",
                  }}
                />
              </Box>

              {/* RIGHT LINE */}
              {idx !== items.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    bgcolor: lineColor,
                    transition: "background-color 300ms ease",
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>


      {/* CARDS */}
      <Box display="flex" justifyContent="space-between" gap={2}>
        {items.map((it, i) => {
          const isCurrent = i === currentIndex;
          const isCompleted = i < currentIndex;

          return (
            <Box key={i} flex={1} textAlign="center">
              <Paper
                elevation={isCurrent ? 10 : 3}
                sx={{
                  p: 2,
                  minHeight: 80,
                  bgcolor: cardBg,
                  borderRadius: 2,
                  transition: "all 200ms ease",
                  opacity: isCompleted || isCurrent ? 1 : 0.7,
                  "&:hover": {
                    transform: "translateY(-6px)",
                  },
                }}
              >
                <Typography fontWeight={600}>{it.title}</Typography>
                {it.description && (
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {it.description}
                  </Typography>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

HorizontalTimeline.propTypes = {
  items: PropTypes.array.isRequired,
};
