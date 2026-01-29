"use client";
import { useState } from "react";
import {
  IconButton,
  Drawer,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import IconRail from "@/components/IconRail";
import { usePostsUI } from "@/modules/Post/PostsUIContext";
import { INDUSTRIES } from "@/constants/postConstants";

export default function PlacementPostsSidebar() {
  const postsUI = usePostsUI();
  const [filtersOpen, setFiltersOpen] = useState(false);
  if (!postsUI) return null;

  const {
    activeTab,
    setActiveTab,
    industry,
    setIndustry,
    search,
    setSearch,
    resetFilters,
    counts,
  } = postsUI;

  const railItems = [
    {
      key: 0,
      icon: <HourglassEmptyIcon />,
      label: `Pending (${counts.pending})`,
      active: activeTab === 0,
      onClick: () => setActiveTab(0),
    },
    {
      key: 1,
      icon: <CheckCircleIcon />,
      label: `Approved (${counts.approved})`,
      active: activeTab === 1,
      onClick: () => setActiveTab(1),
    },
    {
      key: 2,
      icon: <CancelIcon />,
      label: `Disapproved (${counts.disapproved})`,
      active: activeTab === 2,
      onClick: () => setActiveTab(2),
    },
  ];

  return (
    <>
      <IconRail
        items={railItems}
        footer={
          <IconButton
            aria-label="Open filters"
            aria-haspopup="dialog"
            onClick={() => setFiltersOpen(true)}
          >
            <TuneIcon />
          </IconButton>
        }
      />

      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{ sx: { width: 300, p: 2 } }}
      >
        <TextField
          select
          label="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        >
          <MenuItem value="">All industries</MenuItem>
          {INDUSTRIES.map((ind) => (
            <MenuItem key={ind} value={ind}>
              {ind}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company or position"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<ClearIcon />}
          onClick={resetFilters}
        >
          Clear filters
        </Button>
      </Drawer>
    </>
  );
}
