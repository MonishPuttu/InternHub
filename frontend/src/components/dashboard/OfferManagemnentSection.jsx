"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "@/lib/session";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function OfferManagementSection() {
  const theme = useTheme();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [viewOfferDialog, setViewOfferDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [tabValue, setTabValue] = useState(0); // 0: Pending, 1: Approved, 2: Rejected

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/offers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.ok) {
        setOffers(response.data.offers);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setErrorMsg("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOffer = async (offerId) => {
    try {
      const token = getToken();
      await axios.put(
        `${BACKEND_URL}/api/offers/approve/${offerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMsg("Offer approved and forwarded to student");
      fetchOffers(); // Refresh
    } catch (error) {
      console.error("Error approving offer:", error);
      setErrorMsg("Failed to approve offer");
    }
  };

  const handleRejectOffer = async () => {
    try {
      const token = getToken();
      await axios.put(
        `${BACKEND_URL}/api/offers/reject-offer/${selectedOffer.offer.id}`,
        { reason: rejectReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMsg("Offer rejected");
      setRejectDialog(false);
      setRejectReason("");
      fetchOffers(); // Refresh
    } catch (error) {
      console.error("Error rejecting offer:", error);
      setErrorMsg("Failed to reject offer");
    }
  };

  const handleViewOffer = (offer) => {
    setSelectedOffer(offer);
    setViewOfferDialog(true);
  };

  const handleDownloadOffer = async (offer) => {
    try {
      if (!offer.offer.offer_letter_url) {
        setErrorMsg("No offer letter file available");
        return;
      }

      // Extract base64 data
      const base64Data = offer.offer.offer_letter_url.includes(",")
        ? offer.offer.offer_letter_url.split(",")[1]
        : offer.offer.offer_letter_url;

      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: offer.offer.file_type || "application/pdf",
      });

      // Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        offer.offer.file_name ||
          `Offer_${offer.offer.company_name}_${offer.offer.position}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg("Offer letter downloaded successfully");
    } catch (error) {
      console.error("Error downloading offer letter:", error);
      setErrorMsg("Failed to download offer letter");
    }
  };

  const getFilteredOffers = () => {
    if (tabValue === 0) {
      // Pending
      return offers.filter(
        (o) => o.offer.status === "pending_placement_approval"
      );
    } else if (tabValue === 1) {
      // Approved
      return offers.filter((o) => o.offer.status === "approved");
    } else {
      // Rejected
      return offers.filter((o) => o.offer.status === "rejected_by_placement");
    }
  };

  const filteredOffers = getFilteredOffers();

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Loading offers...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h5"
        sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
      >
        Offer Letter Management
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{
          mb: 3,
          "& .MuiTab-root": { color: "text.secondary" },
          "& .Mui-selected": { color: "#8b5cf6 !important" },
          "& .MuiTabs-indicator": { bgcolor: "#8b5cf6" },
        }}
      >
        <Tab
          label={`Pending Approval (${
            offers.filter(
              (o) => o.offer.status === "pending_placement_approval"
            ).length
          })`}
        />
        <Tab
          label={`Approved (${
            offers.filter((o) => o.offer.status === "approved").length
          })`}
        />
        <Tab
          label={`Rejected (${
            offers.filter((o) => o.offer.status === "rejected_by_placement")
              .length
          })`}
        />
      </Tabs>

      {/* Offers Table */}
      {filteredOffers.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="body2" color="text.secondary">
            No offers in this category
          </Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Student Name",
                  "Company",
                  "Position",
                  "Salary (LPA)",
                  "Joining Date",
                  "Location",
                  "Status",
                  "Received On",
                  "Actions",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      bgcolor: "background.paper",
                      color: "text.primary",
                      fontWeight: 700,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow
                  key={offer.offer.id}
                  sx={{
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <TableCell
                    sx={{
                      color: "text.primary",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {offer.application?.full_name || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.secondary",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {offer.offer.company_name}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.secondary",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {offer.offer.position}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.secondary",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    ₹{offer.offer.salary_package}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.secondary",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {new Date(offer.offer.joining_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.secondary",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {offer.offer.location}
                  </TableCell>

                  {/* Status Column - Shows status chip */}
                  <TableCell
                    sx={{
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Chip
                      label={
                        offer.offer.status === "pending_placement_approval"
                          ? "Pending"
                          : offer.offer.status === "approved"
                          ? "Approved"
                          : "Rejected"
                      }
                      size="small"
                      sx={{
                        bgcolor:
                          offer.offer.status === "pending_placement_approval"
                            ? "#f59e0b20"
                            : offer.offer.status === "approved"
                            ? "#10b98120"
                            : "#ef444420",
                        color:
                          offer.offer.status === "pending_placement_approval"
                            ? "#f59e0b"
                            : offer.offer.status === "approved"
                            ? "#10b981"
                            : "#ef4444",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "text.secondary",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {new Date(offer.offer.created_at).toLocaleDateString()}
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell
                    sx={{
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack direction="row" spacing={0.5}>
                      {/* View Button - Always visible */}
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => handleViewOffer(offer)}
                          sx={{ color: "#8b5cf6" }}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Download Button - Always visible if file exists */}
                      {offer.offer.offer_letter_url && (
                        <Tooltip title="Download">
                          <IconButton
                            onClick={() => handleDownloadOffer(offer)}
                            sx={{ color: "#10b981" }}
                            size="small"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Approve/Reject Buttons - Only for pending offers */}
                      {offer.offer.status === "pending_placement_approval" && (
                        <>
                          <Tooltip title="Forward to Student">
                            <IconButton
                              onClick={() => handleApproveOffer(offer.offer.id)}
                              sx={{ color: "#10b981" }}
                              size="small"
                            >
                              <SendIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Offer">
                            <IconButton
                              onClick={() => {
                                setSelectedOffer(offer);
                                setRejectDialog(true);
                              }}
                              sx={{ color: "#ef4444" }}
                              size="small"
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Offer Details Dialog */}
      <Dialog
        open={viewOfferDialog}
        onClose={() => setViewOfferDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          Offer Letter Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedOffer && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Student Name
                </Typography>
                <Typography variant="body1">
                  {selectedOffer.application?.full_name || "N/A"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1">
                  {selectedOffer.offer.company_name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Position
                </Typography>
                <Typography variant="body1">
                  {selectedOffer.offer.position}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Salary Package
                </Typography>
                <Typography variant="body1">
                  ₹{selectedOffer.offer.salary_package} LPA
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Joining Date
                </Typography>
                <Typography variant="body1">
                  {new Date(
                    selectedOffer.offer.joining_date
                  ).toLocaleDateString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  {selectedOffer.offer.location}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Bond Period
                </Typography>
                <Typography variant="body1">
                  {selectedOffer.offer.bond_period || 0} years
                  {(selectedOffer.offer.bond_period === 0 ||
                    !selectedOffer.offer.bond_period) &&
                    " (No Bond)"}
                </Typography>
              </Box>

              {selectedOffer.offer.other_terms && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Other Terms & Conditions
                  </Typography>
                  <Typography variant="body1">
                    {selectedOffer.offer.other_terms}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={
                    selectedOffer.offer.status === "pending_placement_approval"
                      ? "Pending Approval"
                      : selectedOffer.offer.status === "approved"
                      ? "Approved"
                      : "Rejected"
                  }
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor:
                      selectedOffer.offer.status ===
                      "pending_placement_approval"
                        ? "#f59e0b20"
                        : selectedOffer.offer.status === "approved"
                        ? "#10b98120"
                        : "#ef444420",
                    color:
                      selectedOffer.offer.status ===
                      "pending_placement_approval"
                        ? "#f59e0b"
                        : selectedOffer.offer.status === "approved"
                        ? "#10b981"
                        : "#ef4444",
                  }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
          <Button
            onClick={() => setViewOfferDialog(false)}
            sx={{ color: "text.secondary" }}
          >
            Close
          </Button>
          {selectedOffer?.offer.offer_letter_url && (
            <Button
              onClick={() => handleDownloadOffer(selectedOffer)}
              variant="contained"
              sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
            >
              Download Offer Letter
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Offer Dialog */}
      <Dialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          Reject Offer Letter
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                bgcolor: "background.default",
                "& fieldset": { borderColor: "divider" },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
              },
              "& .MuiInputLabel-root": { color: "text.secondary" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
          <Button
            onClick={() => {
              setRejectDialog(false);
              setRejectReason("");
            }}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectOffer}
            variant="contained"
            sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}
          >
            Reject Offer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
      >
        <Alert severity="success">{successMsg}</Alert>
      </Snackbar>
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={5000}
        onClose={() => setErrorMsg("")}
      >
        <Alert severity="error">{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
