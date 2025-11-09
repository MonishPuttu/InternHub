import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Box,
} from "@mui/material";

export default function ApplyDialog({ open, post, onClose, onSubmit }) {
  const theme = useTheme();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(coverLetter, resumeLink);
    setSubmitting(false);
    setCoverLetter("");
    setResumeLink("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 2,
          border: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary" }}
      >
        Apply to {post?.position}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              bgcolor: "rgba(139, 92, 246, 0.1)",
              p: 2,
              borderRadius: 1,
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <Typography
              variant="body1"
              sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
            >
              {post?.position}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
              {post?.company_name}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Resume Link (Optional)"
            placeholder="https://drive.google.com/..."
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                bgcolor: "background.default",
                "& fieldset": {
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
                "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
              },
              "& .MuiInputLabel-root": {
                color: "text.secondary",
                "&.Mui-focused": { color: "#8b5cf6" },
              },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Cover Letter (Optional)"
            placeholder="Tell us why you're a great fit..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                bgcolor: "background.default",
                "& fieldset": {
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
                "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
              },
              "& .MuiInputLabel-root": {
                color: "text.secondary",
                "&.Mui-focused": { color: "#8b5cf6" },
              },
            }}
          />

          <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
            Your profile information will be automatically included with your
            application.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
        }}
      >
        <Button
          onClick={onClose}
          sx={{ color: "text.secondary", textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            bgcolor: "#8b5cf6",
            "&:hover": { bgcolor: "#7c3aed" },
            textTransform: "none",
            px: 3,
          }}
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
