"use client";

import FilterListIcon from "@mui/icons-material/FilterList";
import EventIcon from "@mui/icons-material/Event";
import WorkIcon from "@mui/icons-material/Work";
import { Box, Stack, Chip, Typography } from "@mui/material";
import IconRail from "@/components/IconRail";
import { useRecruiterCalendarUI } from "@/modules/calendar/RecruiterCalendarUIContext";
import { useState } from "react";

export default function RecruiterCalendarSidebar() {
  const ui = useRecruiterCalendarUI();
  const [open, setOpen] = useState(false);

  if (!ui) return null;

  const { filterType, setFilterType } = ui;

  const items = [
    {
      key: "all",
      icon: <EventIcon />,
      label: "All Events",
      active: filterType === "all" && !open,
      onClick: () => {
        setFilterType("all");
        setOpen(false);
      },
    },
    {
      key: "post",
      icon: <WorkIcon />,
      label: "My Posts",
      active: filterType === "post" && !open,
      onClick: () => {
        setFilterType("post");
        setOpen(false);
      },
    },
    {
      key: "filters",
      icon: <FilterListIcon />,
      label: "More Filters",
      active: open,
      onClick: () => setOpen((s) => !s),
    },
  ];

  const chips = [
    { key: "all", label: "All Events", value: "all", color: "primary" },
    { key: "interview", label: "Interviews", value: "interview", color: "info" },
    { key: "deadline", label: "Deadlines", value: "deadline", color: "error" },
    { key: "post", label: "My Posts", value: "post", color: "secondary" },
  ];

  const panel = (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ mb: 1, fontWeight: 700 }}>Event Filters</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {chips.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            onClick={() => {
              setFilterType(c.value);
              setOpen(false);
            }}
            color={filterType === c.value ? c.color : "default"}
            variant={filterType === c.value ? "filled" : "outlined"}
            sx={{ fontSize: "0.8125rem" }}
          />
        ))}
      </Stack>
    </Box>
  );

  return <IconRail items={items} panel={panel} panelOpen={open} />;
}
