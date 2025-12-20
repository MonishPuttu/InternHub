import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";

const PersonalDetailsEditDialog = ({
  open,
  onClose,
  formData,
  onFormChange,
  onSave,
  onCancel,
  hasUnsavedChanges,
  onConfirmSave,
  onCancelSave,
  confirmationDialogOpen,
}) => {
  return (
    <>
      {/* Personal Details Edit Dialog */}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: "text.primary", fontWeight: 600 }}>
          Edit Personal Details
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name || ""}
                onChange={(e) => onFormChange("full_name", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => onFormChange("email", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="Phone Number"
                value={formData.contact_number || ""}
                onChange={(e) => onFormChange("contact_number", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="College Name"
                value={formData.college_name || ""}
                onChange={(e) => onFormChange("college_name", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="Branch"
                value={formData.branch || ""}
                onChange={(e) => onFormChange("branch", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="Current Semester"
                type="number"
                value={formData.current_semester || ""}
                onChange={(e) =>
                  onFormChange("current_semester", e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="CGPA"
                type="number"
                value={formData.cgpa || ""}
                onChange={(e) => onFormChange("cgpa", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="10th Score (%)"
                type="number"
                value={formData.tenth_score || ""}
                onChange={(e) => onFormChange("tenth_score", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="12th Score (%)"
                type="number"
                value={formData.twelfth_score || ""}
                onChange={(e) => onFormChange("twelfth_score", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={formData.linkedin_profile || ""}
                onChange={(e) =>
                  onFormChange("linkedin_profile", e.target.value)
                }
                placeholder="https://linkedin.com/in/yourprofile"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="Skills"
                value={formData.skills || ""}
                onChange={(e) => onFormChange("skills", e.target.value)}
                multiline
                rows={2}
                placeholder="React, Node.js, Python, Machine Learning"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />

              <TextField
                fullWidth
                label="Professional Email"
                type="email"
                value={formData.professional_email || ""}
                onChange={(e) =>
                  onFormChange("professional_email", e.target.value)
                }
                placeholder="your.name@company.com"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.default",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "#8b5cf6" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            variant="contained"
            disabled={!hasUnsavedChanges}
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
              "&:disabled": { bgcolor: "action.disabledBackground" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={onCancelSave}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            borderRadius: 2,
          },
        }}
      >
        <DialogContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", mb: 2, fontWeight: 600 }}
            >
              Confirm Changes
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Are you sure you want to save these changes to your personal
              details?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelSave} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            onClick={onConfirmSave}
            variant="contained"
            sx={{
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Yes, Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PersonalDetailsEditDialog;
