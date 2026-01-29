"use client";

import { Box, IconButton, Tooltip } from "@mui/material";

export default function IconRail({
  items = [],
  footer,
  topOffset = 88, // matches TopBar height visually
  panel,
  panelOpen = false,
  panelWidth = 320,
}) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: `calc(${topOffset}px + (100vh - ${topOffset}px) / 2)`,
        transform: "translateY(-50%)",
        left: 20,
        zIndex: 1400,
        display: "flex",
        alignItems: "flex-start",
        pointerEvents: "none",
      }}
    >
      {/* RAIL */}
      <Box
        sx={{
          pointerEvents: "auto",
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(15,23,42,0.06)",
          borderRadius: 999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          px: 1.25,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.75,
          alignItems: "center",
        }}
      >
        {items.map((item) => (
          <Tooltip key={item.key} title={item.label} placement="right">
            <IconButton
              onClick={item.onClick}
              aria-label={item.label}
              aria-current={item.active ? "true" : undefined}
              sx={{
                width: 42,
                height: 42,
                bgcolor: item.active ? "primary.main" : "transparent",
                color: item.active ? "#fff" : "#cbd5f5",
                "& svg": { fontSize: 20 },
                "&:hover": {
                  bgcolor: item.active
                    ? "primary.main"
                    : "rgba(139,92,246,0.18)",
                },
                transition: "all 160ms ease",
              }}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        ))}

        {footer && <Box sx={{ mt: 1 }}>{footer}</Box>}
      </Box>

      {/* ATTACHED PANEL */}
      <Box
        sx={{
          pointerEvents: panelOpen ? "auto" : "none",
          width: panelWidth,
          ml: 1,
          mt: 0.5,

          transform: panelOpen
            ? "translateX(0) scale(1)"
            : "translateX(-8px) scale(0.98)",

          opacity: panelOpen ? 1 : 0,

          transition: `
            transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 160ms ease
          `,

          transformOrigin: "left center",

          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 20px 48px rgba(0,0,0,0.45)",
          overflow: "visible",
          zIndex: 1,
        }}
      >
        {panel}
      </Box>
    </Box>
  );
}
