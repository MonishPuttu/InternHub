"use client";

import { useState } from "react";
import {
  IconButton,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Box,
} from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
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
  const [open, setOpen] = useState(false);

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
      key: "pending",
      icon: <HourglassEmptyIcon />,
      label: `Pending (${counts.pending})`,
      active: activeTab === 0,
      onClick: () => setActiveTab(0),
    },
    {
      key: "approved",
      icon: <CheckCircleIcon />,
      label: `Approved (${counts.approved})`,
      active: activeTab === 1,
      onClick: () => setActiveTab(1),
    },
    {
      key: "disapproved",
      icon: <CancelIcon />,
      label: `Disapproved (${counts.disapproved})`,
      active: activeTab === 2,
      onClick: () => setActiveTab(2),
    },
  ];

  const panel = (
    <ClickAwayListener 
      onClickAway={() => setOpen(false)}
      mouseEvent="onMouseUp"
      touchEvent="onTouchEnd"
    >
      <Box
        sx={{
          position: "relative",
          p: 2,
          width: 300,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          select
          label="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          fullWidth
          size="small"
          SelectProps={{
            MenuProps: {
              disablePortal: true,
              disableScrollLock: true,
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
              PaperProps: {
                sx: {
                  mt: 0.5,
                  borderRadius: 1.5,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                },
              },
              MenuListProps: {
                sx: {
                  py: 0.5,
                },
              },
            },
          }}
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
          size="small"
          startIcon={<ClearIcon />}
          onClick={() => {
            resetFilters();
            setOpen(false);
          }}
        >
          Clear filters
        </Button>
      </Box>
    </ClickAwayListener>
  );

  return (
    <IconRail
      items={railItems}
      footer={
        <IconButton onClick={() => setOpen((v) => !v)}>
          <TuneIcon />
        </IconButton>
      }
      panel={panel}
      panelOpen={open}
      panelWidth={320}
    />
  );
}
