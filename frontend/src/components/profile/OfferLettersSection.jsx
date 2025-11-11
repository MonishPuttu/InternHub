"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function OfferLettersSection() {
  const theme = useTheme();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setOffers(response.data.offers);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOffer = async (offerId) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/offers/download/${offerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Offer_Letter_${offerId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading offer:", error);
      alert("Failed to download offer letter");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
          >
            Offer Letters
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            View and download your approved offer letters
          </Typography>
        </Box>
      </Box>

      {offers.length === 0 ? (
        <Card
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
          }}
        >
          <WorkIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "text.primary", mb: 1 }}>
            No Offer Letters Yet
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Your approved offer letters will appear here once you receive them
            from companies
          </Typography>
        </Card>
      ) : (
        <Stack spacing={3}>
          {offers.map((offerData) => {
            const offer = offerData.offer;
            const post = offerData.post;

            return (
              <Card
                key={offer.id}
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "#8b5cf6",
                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.15)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "text.primary",
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {offer.position}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "#8b5cf6", fontWeight: 500, mb: 1 }}
                      >
                        {offer.company_name}
                      </Typography>
                      <Chip
                        label="Approved"
                        size="small"
                        sx={{
                          bgcolor: "#10b98120",
                          color: "#10b981",
                          border: "1px solid #10b98140",
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Offer Details Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                      mt: 3,
                      p: 2,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "#1e293b"
                          : "rgba(139, 92, 246, 0.05)",
                      borderRadius: 2,
                    }}
                  >
                    {/* Salary */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#8b5cf620"
                              : "#8b5cf610",
                        }}
                      >
                        <MoneyIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", display: "block" }}
                        >
                          Salary Package
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary", fontWeight: 600 }}
                        >
                          ₹{offer.salary_package} LPA
                        </Typography>
                      </Box>
                    </Box>

                    {/* Joining Date */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#10b98120"
                              : "#10b98110",
                        }}
                      >
                        <CalendarIcon sx={{ color: "#10b981", fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", display: "block" }}
                        >
                          Joining Date
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary", fontWeight: 600 }}
                        >
                          {new Date(offer.joining_date).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Location */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#0ea5e920"
                              : "#0ea5e910",
                        }}
                      >
                        <LocationIcon sx={{ color: "#0ea5e9", fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", display: "block" }}
                        >
                          Location
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary", fontWeight: 600 }}
                        >
                          {offer.location}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Bond Period */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#f59e0b20"
                              : "#f59e0b10",
                        }}
                      >
                        <WorkIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", display: "block" }}
                        >
                          Bond Period
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary", fontWeight: 600 }}
                        >
                          {offer.bond_period === 0
                            ? "No Bond"
                            : `${offer.bond_period} years`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Other Terms */}
                  {offer.other_terms && (
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        bgcolor:
                          theme.palette.mode === "dark" ? "#1e293b" : "#f8fafc",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor:
                          theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Additional Terms & Conditions
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.primary", whiteSpace: "pre-wrap" }}
                      >
                        {offer.other_terms}
                      </Typography>
                    </Box>
                  )}

                  {/* Footer */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 3,
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Received on{" "}
                      {new Date(offer.created_at).toLocaleDateString()}
                    </Typography>
                    {offer.offer_letter_url && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadOffer(offer.id)}
                        sx={{
                          color: "#8b5cf6",
                          borderColor: "#8b5cf6",
                          "&:hover": {
                            borderColor: "#7c3aed",
                            bgcolor: "#8b5cf620",
                          },
                        }}
                      >
                        Download PDF
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
