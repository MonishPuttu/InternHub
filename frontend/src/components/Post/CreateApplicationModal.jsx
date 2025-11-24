"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Modal,
  Snackbar,
  Alert,
  MenuItem,
  FormControl,
  Select,
  Chip,
  Divider, // Keep Divider import for the Action Buttons separator
  Stack,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

const VIOLET_PRIMARY = "#8b5cf6";
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_POSITIONS = 5; // Restriction constant
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Consulting",
  "Manufacturing",
  "Retail",
  "Education",
  "Other",
];
const DEPARTMENTS = [
  "CSE",
  "IT",
  "AIML",
  "ECE",
  "EEE",
  "CIVIL",
  "MECH",
  "MBA",
  "MCA",
];
const JOB_TYPES = ["Full Time", "Internship"];

// MediaPreview component remains the same
const MediaPreview = ({ file, onDelete, preview }) => {
  const theme = useTheme();
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      sx={{
        p: 2,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(139, 92, 246, 0.05)",
        borderRadius: "8px",
        border: `1px solid ${VIOLET_PRIMARY}4D`,
      }}
    >
      {preview ? (
        <Box
          component="img"
          src={preview}
          alt="Preview"
          sx={{
            width: 60,
            height: 60,
            minWidth: 60,
            borderRadius: "8px",
            objectFit: "cover",
          }}
        />
      ) : (
        <InsertDriveFileIcon sx={{ color: VIOLET_PRIMARY, fontSize: 32 }} />
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{ color: "text.primary", fontWeight: 500 }}
        >
          {file.name}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {sizeMB} MB
        </Typography>
      </Box>
      <IconButton size="small" onClick={onDelete} sx={{ color: "#EF4444" }}>
        <DeleteIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Stack>
  );
};

export const CreateApplicationModal = ({ open, onClose }) => {
  const theme = useTheme();
  // General post info
  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    deadline: "",
    notes: "",
    target_departments: [],
  });

  // Multiple positions state
  const [positions, setPositions] = useState([
    {
      position: "",
      job_type: "Full Time",
      package_offered: "",
      duration: "",
      skills: "",
    },
  ]);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // General post field change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDepartmentChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      target_departments: event.target.value,
    }));
  };

  // Position fields change handler
  const handlePositionChange = (idx, field, value) => {
    setPositions((prev) => {
      const newArr = [...prev];
      newArr[idx][field] = value;
      if (field === "job_type" && value !== "Internship")
        newArr[idx].duration = "";
      return newArr;
    });
  };

  const addPosition = () => {
    if (positions.length < MAX_POSITIONS) {
      // Check for max limit
      setPositions((prev) => [
        ...prev,
        {
          position: "",
          job_type: "Full Time",
          package_offered: "",
          duration: "",
          skills: "",
        },
      ]);
    }
  };

  const removePosition = (idx) => {
    setPositions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMsg("File must be an image (JPG, PNG, GIF, WebP)");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg("File size exceeds 1MB limit");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
    setMediaFile(file);
    e.target.value = "";
  };
  const removeMediaFile = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    // ... [rest of the handleSubmit logic remains the same] ...
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("You must be logged in");
        setLoading(false);
        return;
      }
      const positionArray = positions.map((pos) => ({
        title: pos.position,
        job_type: pos.job_type,
        package_offered: pos.package_offered,
        duration: pos.duration,
        skills: pos.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
      const payload = {
        company_name: formData.company_name,
        industry: formData.industry,
        application_deadline: formData.deadline || null,
        notes: formData.notes || null,
        target_departments: formData.target_departments,
        media: mediaPreview,
        positions: positionArray,
      };
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
        }/api/posts/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (result.ok) {
        setSuccessMsg("Opportunity posted successfully!");
        setFormData({
          company_name: "",
          industry: "",
          deadline: "",
          notes: "",
          target_departments: [],
        });
        setPositions([
          {
            position: "",
            job_type: "Full Time",
            package_offered: "",
            duration: "",
            skills: "",
          },
        ]);
        setMediaFile(null);
        setMediaPreview(null);
        setTimeout(() => {
          onClose();
          setSuccessMsg("");
        }, 2000);
      } else {
        setErrorMsg(result.error || "Failed to post opportunity");
      }
    } catch (error) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={12}
          sx={{
            width: { xs: "98vw", sm: "650px", md: "750px" },
            maxWidth: "750px",
            height: "auto",
            maxHeight: "96vh",
            borderRadius: "16px",
            backgroundColor: "background.paper",
            boxShadow: theme.shadows[20],
            overflow: "auto",
            position: "relative",
          }}
        >
          {/* Close Button at the top right */}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "text.secondary",
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              pt: 4,
              pb: 3,
              px: { xs: 2, sm: 4, md: 5 },
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              gap: 3, // Maintains overall section spacing
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: VIOLET_PRIMARY,
                fontWeight: 700,
                mb: 1,
                textAlign: "center",
              }}
            >
              Post New Opportunity
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 1 }}
            >
              Fill out the company and position details below.
            </Typography>

            {/* General Fields - Title Only */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "text.primary", mt: 2, mb: 1 }}
            >
              General Information
            </Typography>
            {/* Removed Divider */}
            <Box
              sx={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              <TextField
                fullWidth
                label="Company Name *"
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleInputChange}
                disabled={loading}
                variant="outlined"
              />
              <TextField
                fullWidth
                select
                label="Industry *"
                name="industry"
                required
                value={formData.industry}
                onChange={handleInputChange}
                disabled={loading}
                variant="outlined"
                error={!formData.industry && formData.company_name.length > 0}
              >
                {INDUSTRIES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Departments & Deadline - Consistent 1fr 1fr Grid */}
            <Box
              sx={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              {/* Department Select with InputLabel */}
              <FormControl fullWidth disabled={loading} variant="outlined">
                <InputLabel id="target-departments-label" required>
                  Target Departments *
                </InputLabel>
                <Select
                  labelId="target-departments-label"
                  multiple
                  required
                  value={formData.target_departments}
                  onChange={handleDepartmentChange}
                  input={<OutlinedInput label="Target Departments *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          sx={{
                            backgroundColor: VIOLET_PRIMARY,
                            color: "white",
                            fontWeight: 500,
                            height: 24,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="datetime-local"
                label="Application Deadline *"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleInputChange}
                disabled={loading}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={5}
              label="Overall Description / Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={loading}
              variant="outlined"
              placeholder="Any general requirements, company culture, or key benefits..."
            />

            {/* Positions Section - Title Only */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "text.primary", mt: 2, mb: 1 }}
            >
              Positions & Roles
            </Typography>
            {/* Removed Divider */}
            <Box
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(139,92,246,0.07)"
                    : "#f7f4ff",
                borderRadius: "12px",
                border: `1px dashed ${VIOLET_PRIMARY}A0`,
                p: 3,
                pb: 2,
                width: "100%",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: VIOLET_PRIMARY,
                  mb: 2,
                  fontSize: "1rem",
                }}
              >
                Add up to {MAX_POSITIONS} Positions
              </Typography>
              {positions.map((pos, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    mt: 2,
                    p: 3,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.04)"
                        : "#fff",
                    borderRadius: "12px",
                    boxShadow: theme.shadows[1],
                    border: `1px solid ${VIOLET_PRIMARY}33`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {/* Remove Position Button - Placed at the top right of the card */}
                  {positions.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => removePosition(idx)}
                      disabled={loading}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: theme.palette.error.main,
                        "&:hover": {
                          backgroundColor: "rgba(239, 68, 68, 0.08)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: VIOLET_PRIMARY,
                      mb: 2,
                      pr: positions.length > 1 ? 4 : 0,
                    }}
                  >
                    Position {idx + 1}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Job Title / Position *"
                      required
                      fullWidth
                      value={pos.position}
                      onChange={(e) =>
                        handlePositionChange(idx, "position", e.target.value)
                      }
                      disabled={loading}
                    />
                    <TextField
                      select
                      label="Job Type *"
                      required
                      fullWidth
                      value={pos.job_type}
                      onChange={(e) =>
                        handlePositionChange(idx, "job_type", e.target.value)
                      }
                      disabled={loading}
                    >
                      {JOB_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: pos.job_type === "Internship" ? "1fr 1fr" : "1fr",
                      },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Salary / Package (e.g. 10 LPA / ₹50k)"
                      fullWidth
                      value={pos.package_offered}
                      onChange={(e) =>
                        handlePositionChange(
                          idx,
                          "package_offered",
                          e.target.value
                        )
                      }
                      disabled={loading}
                    />
                    {pos.job_type === "Internship" && (
                      <TextField
                        label="Duration (e.g. 3-6 months)"
                        fullWidth
                        value={pos.duration}
                        onChange={(e) =>
                          handlePositionChange(idx, "duration", e.target.value)
                        }
                        disabled={loading}
                      />
                    )}
                  </Box>
                  <TextField
                    sx={{ mt: 2 }}
                    label="Required Skills (comma separated)"
                    fullWidth
                    value={pos.skills}
                    onChange={(e) =>
                      handlePositionChange(idx, "skills", e.target.value)
                    }
                    disabled={loading}
                    placeholder="e.g. React, Node.js, SQL"
                  />
                </Paper>
              ))}
              <Box sx={{ mt: 2, mb: 1, textAlign: "right", width: "100%" }}>
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  variant="outlined"
                  size="medium"
                  sx={{
                    color: VIOLET_PRIMARY,
                    borderColor: VIOLET_PRIMARY,
                    px: 3,
                    fontWeight: 600,
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: `${VIOLET_PRIMARY}10`,
                      borderColor: VIOLET_PRIMARY,
                    },
                  }}
                  onClick={addPosition}
                  disabled={loading || positions.length >= MAX_POSITIONS}
                >
                  {positions.length >= MAX_POSITIONS
                    ? `Max ${MAX_POSITIONS} Positions`
                    : "Add Another Position"}
                </Button>
              </Box>
            </Box>

            {/* Upload Section - Title Only */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "text.primary", mt: 2, mb: 1 }}
            >
              Poster/Media (Optional)
            </Typography>
            {/* Removed Divider */}
            <Paper
              elevation={0}
              sx={{
                mb: 1.5,
                borderRadius: "12px",
                border: `2px dashed ${VIOLET_PRIMARY}66`,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(139,92,246,0.05)"
                    : "#faf0ff",
                cursor: "pointer",
                width: "100%",
                opacity: loading || mediaFile ? 0.6 : 1,
              }}
            >
              <input
                type="file"
                accept="image/*"
                id="media-input"
                onChange={handleFileSelect}
                disabled={loading || mediaFile}
                style={{ display: "none" }}
              />
              <label
                htmlFor="media-input"
                style={{
                  cursor: loading || mediaFile ? "not-allowed" : "pointer",
                  display: "block",
                  padding: theme.spacing(3),
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: VIOLET_PRIMARY, mb: 1 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.primary"
                    fontWeight={500}
                  >
                    {mediaFile
                      ? "File selected (Remove to change)"
                      : "Click to upload an image poster (Max 1MB, JPG, PNG, GIF, WebP)"}
                  </Typography>
                </Box>
              </label>
            </Paper>
            {mediaFile && (
              <Box sx={{ mt: 1 }}>
                <MediaPreview
                  file={mediaFile}
                  preview={mediaPreview}
                  onDelete={removeMediaFile}
                />
              </Box>
            )}

            {/* Action Buttons (Divider kept here to separate content from footer actions) */}
            <Box
              sx={{
                pt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                width: "100%",
                borderTop: "1px solid",
                borderColor: theme.palette.divider,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={loading}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  color: "text.secondary",
                  borderColor: "text.secondary",
                  "&:hover": { borderColor: "text.secondary" },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  backgroundColor: VIOLET_PRIMARY,
                  "&:hover": { backgroundColor: "#6D28D9" },
                  "&:disabled": { backgroundColor: "#A0A0A0" },
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 3,
                  boxShadow: `0 4px 10px 0 ${VIOLET_PRIMARY}40`,
                }}
              >
                {loading ? "Posting..." : "Post Opportunity"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Modal>
      {/* Snackbar alerts remain the same */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={5000}
        onClose={() => setErrorMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
};
