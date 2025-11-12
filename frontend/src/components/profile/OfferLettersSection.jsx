"use client";

import { useState, useEffect } from "react";
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
  Tooltip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const statusColors = {
  approved: "#10b981",
  pending: "#f59e0b",
  "pending-placement-approval": "#f59e0b",
  rejected: "#ef4444",
  "rejected-by-placement": "#ef4444",
  "offer-pending": "#3b82f6",
};

const statusLabels = {
  approved: "Approved",
  pending: "Pending",
  "pending-placement-approval": "Pending Approval",
  rejected: "Rejected",
  "rejected-by-placement": "Rejected",
  "offer-pending": "Offer Pending",
};

export default function OfferLettersSection() {
  const theme = useTheme();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

      // Extract base64 data (remove data:application/pdf;base64, prefix if exists)
      const base64Data = offer.offer_letter_url.includes(",")
        ? offer.offer_letter_url.split(",")[1]
        : offer.offer_letter_url;

      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: offer.file_type || "application/pdf",
      });

      // Download
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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccessMsg("")}
        >
          {successMsg}
        </Alert>
      )}

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
            Your approved offer letters will appear here
          </Typography>
        </Card>
      ) : (
        <Stack spacing={3}>
          {offers.map((offer) => (
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
                  <Chip
                    label={statusLabels[offer.status] || offer.status}
                    sx={{
                      bgcolor: statusColors[offer.status] || "#64748b",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
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
                  Received on{" "}
                  {offer.created_at
                    ? new Date(offer.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </Typography>

                {offer.status === "approved" && offer.offer_letter_url && (
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
                )}

                {!offer.offer_letter_url && (
                  <Alert severity="info">
                    Offer letter document will be available once approved by
                    placement cell
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
