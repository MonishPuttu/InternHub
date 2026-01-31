"use client";

import FilterListIcon from "@mui/icons-material/FilterList";
import { Box, Stack, Chip, Typography } from "@mui/material";
import IconRail from "@/components/IconRail";
import { useCalendarUI } from "@/modules/calendar/CalendarUIContext";
import { useState } from "react";

export default function CalendarSidebar() {
  const ui = useCalendarUI();
  const [open, setOpen] = useState(false);

  if (!ui) return null;

  const { filterType, setFilterType } = ui;

  const items = [
    {
      key: "filters",
      icon: <FilterListIcon />,
      label: "Filters",
      active: open,
      onClick: () => setOpen((s) => !s),
    },
  ];

  const chips = [
    { key: "all", label: "All Events", value: "all", color: "primary" },
    { key: "oncampus", label: "On Campus", value: "oncampus", color: "default" },
    { key: "offcampus", label: "Off Campus", value: "offcampus", color: "default" },
    { key: "hackathon", label: "Hackathons", value: "hackathon", color: "warning" },
    { key: "workshop", label: "Workshops", value: "workshop", color: "success" },
    { key: "post", label: "Opportunities", value: "post", color: "info" },
  ];

  const panel = (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ mb: 1, fontWeight: 700 }}>Event Filters</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {chips.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            onClick={() => setFilterType(c.value)}
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
