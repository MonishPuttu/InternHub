"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function EditEducationDialog({
  open,
  onClose,
  education,
  onSave,
}) {
  const theme = useTheme();
  const [formData, setFormData] = useState(education || {});

  useEffect(() => {
    setFormData(education || {});
  }, [education]);

  const handleSave = () => {
    onSave(formData);
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: "text.primary",
      bgcolor: "background.default",
      "& fieldset": {
        borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
      },
      "&:hover fieldset": { borderColor: "#8b5cf6" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
    },
    "& .MuiInputLabel-root": {
      color: "text.secondary",
      "&.Mui-focused": { color: "#8b5cf6" },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          backgroundImage: "none",
          border: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
          fontWeight: 600,
        }}
      >
        {education?.id ? "Edit Education" : "Add Education"}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "background.paper", pt: 3 }}>
        <Stack spacing={3}>
          <TextField
            label="Degree"
            value={formData.degree || ""}
            onChange={(e) =>
              setFormData({ ...formData, degree: e.target.value })
            }
            fullWidth
            required
            placeholder="Bachelor of Technology"
            sx={textFieldStyles}
          />
          <TextField
            label="Institution"
            value={formData.institution || ""}
            onChange={(e) =>
              setFormData({ ...formData, institution: e.target.value })
            }
            fullWidth
            required
            placeholder="Indian Institute of Technology"
            sx={textFieldStyles}
          />
          <TextField
            label="Field of Study"
            value={formData.field_of_study || ""}
            onChange={(e) =>
              setFormData({ ...formData, field_of_study: e.target.value })
            }
            fullWidth
            placeholder="Computer Science and Engineering"
            sx={textFieldStyles}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Start Year"
              value={formData.start_date || ""}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              fullWidth
              placeholder="2021"
              sx={textFieldStyles}
            />
            <TextField
              label="End Year"
              value={formData.end_date || ""}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              fullWidth
              placeholder="2025"
              sx={textFieldStyles}
            />
          </Box>
          <TextField
            label="CGPA/Percentage"
            value={formData.grade || ""}
            onChange={(e) =>
              setFormData({ ...formData, grade: e.target.value })
            }
            fullWidth
            placeholder="8.5 CGPA or 85%"
            sx={textFieldStyles}
          />
          <TextField
            label="Relevant Coursework"
            value={formData.coursework || ""}
            onChange={(e) =>
              setFormData({ ...formData, coursework: e.target.value })
            }
            fullWidth
            multiline
            rows={3}
            placeholder="Data Structures, Algorithms, Database Systems, Machine Learning"
            sx={textFieldStyles}
          />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          bgcolor: "background.paper",
          p: 2.5,
          borderTop: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(139, 92, 246, 0.1)"
                  : "rgba(139, 92, 246, 0.05)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            bgcolor: "#8b5cf6",
            textTransform: "none",
            "&:hover": { bgcolor: "#7c3aed" },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
