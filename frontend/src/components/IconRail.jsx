"use client";

import { Box, IconButton, Tooltip } from "@mui/material";

export default function IconRail({ items, footer, topOffset = 72 }) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: topOffset,
        left: 16,
        zIndex: (theme) => theme.zIndex.drawer + 10,

        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.08)"
            : "rgba(15,23,42,0.06)",

        borderRadius: "999px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
        px: 1,
        py: 2,

        display: "flex",
        flexDirection: "column",
        gap: 1.5,
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
              width: 40,
              height: 40,
              bgcolor: item.active ? "primary.main" : "transparent",
              color: item.active ? "#fff" : "#e5e7eb",
              "& svg": { fontSize: 20 },
              "&:hover": {
                bgcolor: item.active
                  ? "primary.main"
                  : "rgba(139,92,246,0.16)",
              },
            }}
          >
            {item.icon}
          </IconButton>
        </Tooltip>
      ))}

      {footer && <Box sx={{ mt: 1 }}>{footer}</Box>}
    </Box>
  );
}
