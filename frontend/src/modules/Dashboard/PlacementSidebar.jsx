"use client";

import { useState } from "react";
import { IconButton, TextField, Button, InputAdornment, Box } from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import DeleteIcon from "@mui/icons-material/Delete";

import IconRail from "@/components/IconRail";
import { usePlacementUI } from "@/modules/Dashboard/PlacementUIContext";
import { INDUSTRIES } from "@/constants/postConstants";

export default function PlacementSidebar() {
  const placementUI = usePlacementUI();

  if (!placementUI) return null;

  const {
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    filterPostedDate,
    setFilterPostedDate,
    filterIndustry,
    setFilterIndustry,
    resetFilters,
  } = placementUI;

  const [selectedPanelKey, setSelectedPanelKey] = useState(null);

  const filterItems = [
    { key: "search", icon: <SearchIcon />, label: "Search", onClick: () => setSelectedPanelKey((k) => (k === "search" ? null : "search")) },
    { key: "date", icon: <CalendarTodayIcon />, label: "Posted Date", onClick: () => setSelectedPanelKey((k) => (k === "date" ? null : "date")) },
    { key: "industry", icon: <BusinessCenterIcon />, label: "Industry", onClick: () => setSelectedPanelKey((k) => (k === "industry" ? null : "industry")) },
    { key: "clear", icon: <DeleteIcon />, label: "Clear", onClick: () => { resetFilters(); setSelectedPanelKey(null); } },
  ];

  const items = filterItems;

  const panel = (
    <ClickAwayListener onClickAway={() => setSelectedPanelKey(null)} mouseEvent="onMouseUp" touchEvent="onTouchEnd">
      <Box sx={{ position: "relative", p: 2, width: 320, display: "flex", flexDirection: "column", gap: 2 }}>
        {selectedPanelKey === "search" && (
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by post name..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}> 
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        )}

        {selectedPanelKey === "date" && (
          <TextField
            size="small"
            type="date"
            label="Posted Date"
            value={filterPostedDate}
            onChange={(e) => setFilterPostedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )}

        {selectedPanelKey === "industry" && (
          <TextField
            select
            label="Industry"
            value={filterIndustry ?? ""}
            onChange={(e) => setFilterIndustry(e.target.value)}
            fullWidth
            size="small"
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
          >
            <option value="">All industries</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </TextField>
        )}

        {selectedPanelKey && selectedPanelKey !== "clear" && (
          <Button variant="outlined" size="small" startIcon={<DeleteIcon />} onClick={() => resetFilters()}>
            Clear filters
          </Button>
        )}
      </Box>
    </ClickAwayListener>
  );

  return <IconRail items={items} panel={panel} panelOpen={Boolean(selectedPanelKey)} panelWidth={320} />;
}
