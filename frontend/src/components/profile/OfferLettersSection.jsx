"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const statusColors = {
  approved: "#10b981",
  pending: "#f59e0b",
  pending_placement_approval: "#3b82f6",
  rejected: "#ef4444",
  rejected_by_placement: "#ef4444",
};

const statusLabels = {
  approved: "Approved by Placement",
  pending: "Under Review",
  pending_placement_approval: "Pending Approval",
  rejected: "Rejected",
  rejected_by_placement: "Rejected by Placement",
};

export default function OfferLettersSection() {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    company_name: "",
    position: "",
    salary_package: "",
    joining_date: "",
    location: "",
    bond_period: "",
    offer_letter_file: "",
    file_name: "",
    file_type: "",
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/offers/my-offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.ok) {
        setOffers(response.data.offers || []);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setErrorMsg("Failed to load offer letters");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOffer = async (offer) => {
    try {
      if (!offer.offer_letter_url) {
        setErrorMsg("Offer letter file not available");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }

      const base64Data = offer.offer_letter_url.includes(",")
        ? offer.offer_letter_url.split(",")[1]
        : offer.offer_letter_url;

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: offer.file_type || "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        offer.file_name || `${offer.company_name}_${offer.position}_Offer.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg("Offer letter downloaded successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error downloading offer letter:", error);
      setErrorMsg("Failed to download offer letter");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMsg("Please upload a PDF file");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be less than 5MB");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadFormData({
        ...uploadFormData,
        offer_letter_file: event.target.result,
        file_name: file.name,
        file_type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    try {
      if (
        !uploadFormData.company_name ||
        !uploadFormData.position ||
        !uploadFormData.salary_package ||
        !uploadFormData.joining_date ||
        !uploadFormData.location ||
        !uploadFormData.offer_letter_file
      ) {
        setErrorMsg("Please fill all required fields and select a file");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }

      setUploading(true);
      const token = getToken();

      const payload = {
        company_name: uploadFormData.company_name,
        position: uploadFormData.position,
        package_offered: parseFloat(uploadFormData.salary_package),
        joining_date: uploadFormData.joining_date,
        location: uploadFormData.location,
        bond_period: uploadFormData.bond_period
          ? parseInt(uploadFormData.bond_period)
          : 0,
        offer_letter_file: uploadFormData.offer_letter_file,
        file_name: uploadFormData.file_name,
        file_type: uploadFormData.file_type,
      };

      await axios.post(`${BACKEND_URL}/api/offers/student-upload`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMsg("Offer letter uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);

      setUploadDialogOpen(false);
      setUploadFormData({
        company_name: "",
        position: "",
        salary_package: "",
        joining_date: "",
        location: "",
        bond_period: "",
        offer_letter_file: "",
        file_name: "",
        file_type: "",
      });

      fetchOffers();
    } catch (error) {
      console.error("Error uploading offer letter:", error);
      setErrorMsg(
        error.response?.data?.error || "Failed to upload offer letter"
      );
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setUploadFormData({
      company_name: "",
      position: "",
      salary_package: "",
      joining_date: "",
      location: "",
      bond_period: "",
      offer_letter_file: "",
      file_name: "",
      file_type: "",
    });
  };

  // Helper function to check if offer is self-uploaded
  const isSelfUploaded = (offer) => {
    return !offer.recruiter_id && !offer.application_id && !offer.post_id;
  };

  // Helper function to determine if download is available
  const canDownload = (offer) => {
    return (
      offer.offer_letter_url &&
      (offer.status === "approved" || isSelfUploaded(offer))
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box>
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg("")} sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg("")}
          sx={{ mb: 2 }}
        >
          {successMsg}
        </Alert>
      )}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >
          Offer Letters
        </Typography>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          sx={{
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            textTransform: "none",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
              borderColor: theme.palette.primary.dark,
            },
          }}
        >
          Upload Offer
        </Button>
      </Stack>

      {offers.length === 0 ? (
        <Card
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            p: 6,
            textAlign: "center",
          }}
        >
          <BusinessIcon
            sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }}
          />
          <Typography
            variant="h6"
            sx={{ color: theme.palette.text.primary, mb: 1 }}
          >
            No Offer Letters Yet
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            Your offer letters will appear here
          </Typography>
        </Card>
      ) : (
        <Stack spacing={3}>
          {offers.map((offer) => {
            const selfUploaded = isSelfUploaded(offer);
            const downloadable = canDownload(offer);

            return (
              <Card
                key={offer.id}
                sx={{
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 2,
                  border: `2px solid ${theme.palette.divider}`,
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: theme.palette.text.primary,
                          fontWeight: 700,
                          mb: 0.5,
                        }}
                      >
                        {offer.position}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                        }}
                      >
                        {offer.company_name}
                      </Typography>
                    </Box>

                    {/* Status Badge */}
                    {selfUploaded ? (
                      <Chip
                        icon={<CloudUploadIcon sx={{ fontSize: 18 }} />}
                        label="Self Uploaded"
                        sx={{
                          bgcolor: "#6366f1",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      <Chip
                        label={statusLabels[offer.status] || offer.status}
                        sx={{
                          bgcolor: statusColors[offer.status] || "#64748b",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MoneyIcon
                        sx={{ color: theme.palette.primary.main, fontSize: 24 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Salary Package
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          ₹
                          {offer.salary_package
                            ? parseFloat(offer.salary_package).toFixed(2)
                            : "N/A"}{" "}
                          LPA
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon
                        sx={{ color: theme.palette.primary.main, fontSize: 24 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Joining Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {offer.joining_date
                            ? new Date(offer.joining_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationIcon
                        sx={{ color: theme.palette.primary.main, fontSize: 24 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Location
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {offer.location || "N/A"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <WorkIcon
                        sx={{ color: theme.palette.primary.main, fontSize: 24 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Bond Period
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {offer.bond_period
                            ? `${offer.bond_period} years`
                            : "No Bond"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: "block",
                      mb: 2,
                    }}
                  >
                    {selfUploaded ? "Uploaded" : "Received"} on{" "}
                    {offer.created_at
                      ? new Date(offer.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </Typography>

                  {downloadable ? (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadOffer(offer)}
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        "&:hover": { bgcolor: theme.palette.primary.dark },
                        py: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      Download Offer Letter
                    </Button>
                  ) : (
                    <Alert severity="info">
                      {selfUploaded
                        ? "Offer letter is under review by placement cell"
                        : "Offer letter will be available once approved by placement cell"}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "text.primary",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Upload Offer Letter
          <IconButton onClick={handleCloseUploadDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Company Name *"
              value={uploadFormData.company_name}
              onChange={(e) =>
                setUploadFormData({
                  ...uploadFormData,
                  company_name: e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              label="Position *"
              value={uploadFormData.position}
              onChange={(e) =>
                setUploadFormData({
                  ...uploadFormData,
                  position: e.target.value,
                })
              }
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                label="Salary Package (LPA) *"
                type="number"
                value={uploadFormData.salary_package}
                onChange={(e) =>
                  setUploadFormData({
                    ...uploadFormData,
                    salary_package: e.target.value,
                  })
                }
              />

              <TextField
                label="Joining Date *"
                type="date"
                value={uploadFormData.joining_date}
                onChange={(e) =>
                  setUploadFormData({
                    ...uploadFormData,
                    joining_date: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              fullWidth
              label="Location *"
              value={uploadFormData.location}
              onChange={(e) =>
                setUploadFormData({
                  ...uploadFormData,
                  location: e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              label="Bond Period (years)"
              type="number"
              value={uploadFormData.bond_period}
              onChange={(e) =>
                setUploadFormData({
                  ...uploadFormData,
                  bond_period: e.target.value,
                })
              }
              placeholder="Leave empty if no bond"
            />

            <Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  textTransform: "none",
                  py: 1.5,
                  "&:hover": {
                    borderColor: theme.palette.primary.dark,
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {uploadFormData.file_name
                  ? uploadFormData.file_name
                  : "Select Offer Letter PDF *"}
              </Button>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 1 }}
              >
                Maximum file size: 5MB. Only PDF files are accepted.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleCloseUploadDialog}
            disabled={uploading}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            disabled={uploading}
            sx={{
              bgcolor: theme.palette.primary.main,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            {uploading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
