"use client";

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Paper, useTheme } from "@mui/material";

/**
 * HorizontalTimeline
 * - Renders a left-to-right timeline suitable for recruitment/application flows.
 * - Props: items: [{ id, date, title, description, status }]
 * - Status semantics (flexible):
 *   - 'completed' -> soft green filled node
 *   - 'current' | 'active' | 'important' | 'in_progress' -> accent (amber/red)
 *   - anything else -> upcoming (muted outline)
 *
 * Animation & Interaction rules:
 * - The 'current' node receives a subtle pulse (CSS keyframes). Only one node should be marked current.
 * - Hovering a node card or dot triggers a soft glow and a gentle lift using CSS transitions.
 * - No JS timers; purely CSS-driven animations.
 */
export default function HorizontalTimeline({ items = [] }) {
  const theme = useTheme();

  // find the first item considered "current" for accessibility or fallback animations
  const currentIndex = useMemo(() => {
    return items.findIndex((it) =>
      ["current", "active", "important", "in_progress"].includes((it.status || "").toLowerCase())
    );
  }, [items]);

  // keyframes for pulse used on the current node (subtle halo)
  const pulseKeyframes = `@keyframes hh-pulse { 0% { box-shadow: 0 0 0 0 rgba(255,99,71,0.22); }
    50% { box-shadow: 0 0 0 12px rgba(255,99,71,0.06); }
    100% { box-shadow: 0 0 0 0 rgba(255,99,71,0); } }
  `;

  // compute completed segments to render a glow only behind completed portion
  const totalSegments = Math.max(1, items.length - 1);
  const lastCompletedIndex = items.map((it) => (it.status || "").toLowerCase()).reduce((acc, st, idx) => {
    if (st === "completed") return idx > acc ? idx : acc;
    return acc;
  }, -1);
  const completedRatio = Math.max(0, Math.min(1, (lastCompletedIndex) / totalSegments));

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 3, md: 8 },
        py: { xs: 6, md: 10 },
        // deep navy / charcoal gradient with subtle noise using radial overlay
        background: "linear-gradient(180deg,#071226 0%,#0b1220 100%)",
      }}
    >
      <style>{`
        ${pulseKeyframes}

        @keyframes growLine { from { width: 0% } to { width: var(--grow-width, 0%) } }

        @keyframes nodeFill {
          0% { transform: scale(0.92); opacity: 0.9 }
          100% { transform: scale(1); opacity: 1 }
        }
      `}</style>

      <Box sx={{ maxWidth: "1200px", mx: "auto", color: "#e6eef6" }}>
        {/* horizontal container: dates above, nodes/line center, cards below */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Dates row */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {items.map((it, idx) => (
              <Box key={it.id || idx} sx={{ flex: 1, textAlign: "center", px: 1 }}>
                <Typography variant="caption" sx={{ color: "#9aa6b2" }}>
                  {it.date ? new Date(it.date).toLocaleDateString() : ""}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Line + nodes */}
          <Box sx={{ position: "relative", height: 64, display: "flex", alignItems: "center" }}>
            {/* thin connecting line */}
            <Box sx={{ position: "absolute", left: 24, right: 24, height: 2, bgcolor: "rgba(255,255,255,0.04)", top: "50%", transform: "translateY(-50%)", borderRadius: 1 }} />

            {/* glow for completed portion (animated from 0 -> target width) */}
            {completedRatio >= 0 && (
              <Box
                sx={{
                  position: "absolute",
                  left: 24,
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: 6,
                  borderRadius: 3,
                  // gradient and soft glow for completed segments
                  bgcolor: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                  width: "0%",
                  boxShadow: `0 6px 18px ${theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)'}`,
                  // CSS custom property controls final width (set inline via style)
                  '--grow-width': `${Math.max(0.02, completedRatio * 100)}%`,
                  // animation: animate width from 0 to --grow-width
                  animationName: 'growLine',
                  animationTimingFunction: 'cubic-bezier(.2,.9,.2,1)',
                  animationFillMode: 'forwards',
                  animationDuration: `${Math.max(400, (lastCompletedIndex + 1) * 180 + 200)}ms`,
                }}
              />
            )}

            {items.map((it, idx) => {
              const isCompleted = (it.status || "").toLowerCase() === "completed";
              const isDeadline = (it.status || "").toLowerCase() === "deadline";
              const isCurrent = idx === currentIndex;

              // dot visuals (refined sizes and glow)
              const dotSize = isCurrent ? 22 : 16;
              const dotBase = {
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                display: "inline-block",
                transition: "transform 240ms cubic-bezier(.2,.9,.2,1), box-shadow 240ms ease, background-color 200ms ease, border 200ms ease",
              };

              let dotStyle = {
                ...dotBase,
                backgroundColor: "transparent",
                border: `2px solid rgba(148,163,184,0.6)`,
                boxShadow: 'none',
              };

              if (isCompleted) {
                dotStyle = {
                  ...dotBase,
                  width: 18,
                  height: 18,
                  backgroundColor: theme.palette.success.main,
                  border: 'none',
                  boxShadow: `0 8px 24px rgba(16,185,129,0.12)`,
                };
                // animate completed nodes sequentially
                dotStyle.animationName = 'nodeFill';
                dotStyle.animationDuration = '320ms';
                dotStyle.animationTimingFunction = 'cubic-bezier(.2,.9,.2,1)';
                dotStyle.animationFillMode = 'forwards';
                dotStyle.animationDelay = `${idx * 180}ms`;
              } else if (isDeadline) {
                dotStyle = {
                  ...dotBase,
                  backgroundColor: theme.palette.error.main,
                  border: 'none',
                };
                dotStyle.animationName = 'nodeFill';
                dotStyle.animationDuration = '320ms';
                dotStyle.animationDelay = `${idx * 180}ms`;
              } else if (isCurrent) {
                dotStyle = {
                  ...dotBase,
                  width: 24,
                  height: 24,
                  backgroundColor: theme.palette.error.main,
                  border: `3px solid ${theme.palette.error.dark}`,
                  boxShadow: `0 10px 30px rgba(255,99,71,0.14)`,
                  // current node: first fill animation, then start pulse (pulse delayed until fill completes)
                  animation: `nodeFill 320ms cubic-bezier(.2,.9,.2,1) ${idx * 180}ms forwards, hh-pulse 1800ms infinite ease-out ${idx * 180 + 340}ms`,
                };
              }

              return (
                <Box key={it.id || idx} sx={{ flex: 1, textAlign: "center", px: { xs: 0.5, md: 1 } }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        '&:hover': {
                          transform: "translateY(-6px)",
                        },
                      }}
                    >
                      <Box sx={{ ...dotStyle, '&:hover': { transform: 'scale(1.06)' } }} aria-current={isCurrent ? 'step' : undefined} />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Cards row */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: { xs: 1, md: 2 } }}>
            {items.map((it, idx) => {
              const isCompleted = (it.status || "").toLowerCase() === "completed";
              const isCurrent = ["current", "active", "important", "in_progress"].includes((it.status || "").toLowerCase());

              return (
                <Box key={it.id || idx} sx={{ flex: 1, textAlign: "center", px: { xs: 0.5, md: 1 } }}>
                  <Paper
                    elevation={isCurrent ? 8 : 3}
                    sx={{
                      bgcolor: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                      backgroundBlendMode: 'overlay',
                      color: "#e6eef6",
                      p: { xs: 1.25, md: 2 },
                      borderRadius: 1.5,
                      minHeight: 76,
                      minWidth: 160,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: "transform 200ms cubic-bezier(.2,.9,.2,1), box-shadow 200ms ease",
                      '&:hover': {
                        transform: "translateY(-8px)",
                        boxShadow: isCurrent ? `0 28px 60px rgba(255,99,71,0.12)` : '0 18px 40px rgba(2,6,23,0.6)'
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, letterSpacing: 0.2 }}>{it.title}</Typography>
                    {it.description && (
                      <Typography variant="body2" sx={{ color: "#9aa6b2", mt: 0.5, textAlign: 'center' }}>
                        {it.description}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

HorizontalTimeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
};
