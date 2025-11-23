"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Paper, Typography, Button, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ApplicationsOffersSection({ applications, offers }) {
    const router = useRouter();
    return (
        <Paper
            elevation={2}
            sx={{
                mb: 2,
                p: 2.5,

                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                position: "relative",
            }}
        >
            <IconButton
                onClick={() => router.back()}
                size="small"
                sx={{
                    color: "#8b5cf6",
                    position: "absolute",
                    top: 8,
                    left: 8,
                    display: "flex",
                    alignItems: "center",
                }}
                aria-label="back"
            >
                <ArrowBackIcon />
                <Typography
                    component="span"
                    sx={{ ml: 0.5, fontSize: 14, fontWeight: 500, userSelect: "none" }}
                >
                    Back
                </Typography>
            </IconButton>
            <Typography variant="h6" sx={{ color: "text.primary", mb: 1.5, mt: 4, fontWeight: "bold" }}>
                Applications & Offers
            </Typography>
            {applications.length === 0 && offers.length === 0 ? (
                <Typography sx={{ color: "text.secondary", textAlign: "center", py: 2, fontSize: "0.9rem" }}>
                    No applications or offers yet
                </Typography>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ borderBottom: "1px solid #334155" }}>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Company</TableCell>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Position</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Status</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Offer</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Date</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {applications.map((app, index) => {
                                const relatedOffer = offers.find((offer) => offer.applicationId === app.id);
                                return (
                                    <TableRow key={index} sx={{ borderBottom: "1px solid #334155", "&:hover": { bgcolor: "background.default" } }}>
                                        <TableCell sx={{ color: "text.primary", py: 1.5 }}>{app.companyName}</TableCell>
                                        <TableCell sx={{ color: "text.primary" }}>{app.position}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={app.applicationStatus}
                                                size="small"
                                                sx={{
                                                    bgcolor:
                                                        app.applicationStatus === "applied"
                                                            ? "#f59e0b20"
                                                            : app.applicationStatus === "interview_scheduled"
                                                                ? "#06b6d420"
                                                                : app.applicationStatus === "interviewed"
                                                                    ? "#8b5cf620"
                                                                    : app.applicationStatus === "offer-pending"
                                                                        ? "#10b98120"
                                                                        : "#ef444420",
                                                    color:
                                                        app.applicationStatus === "applied"
                                                            ? "#f59e0b"
                                                            : app.applicationStatus === "interview_scheduled"
                                                                ? "#06b6d4"
                                                                : app.applicationStatus === "interviewed"
                                                                    ? "#8b5cf6"
                                                                    : app.applicationStatus === "offer-pending"
                                                                        ? "#10b981"
                                                                        : "#ef4444",
                                                    fontWeight: 600,
                                                    height: 22,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {relatedOffer ? (
                                                <Chip
                                                    label={relatedOffer.offerStatus}
                                                    size="small"
                                                    sx={{
                                                        bgcolor:
                                                            relatedOffer.offerStatus === "received"
                                                                ? "#10b98120"
                                                                : relatedOffer.offerStatus === "rejected"
                                                                    ? "#ef444420"
                                                                    : "#f59e0b20",
                                                        color:
                                                            relatedOffer.offerStatus === "received"
                                                                ? "#10b981"
                                                                : relatedOffer.offerStatus === "rejected"
                                                                    ? "#ef4444"
                                                                    : "#f59e0b",
                                                        fontWeight: 600,
                                                        height: 22,
                                                    }}
                                                />
                                            ) : (
                                                <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>N/A</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                            {new Date(app.appliedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            {relatedOffer && relatedOffer.offerLetterUrl ? (
                                                <Button
                                                    href={relatedOffer.offerLetterUrl}
                                                    target="_blank"
                                                    download={relatedOffer.fileName || "offer_letter.pdf"}
                                                    size="small"
                                                    sx={{ color: "#8b5cf6", textTransform: "none", fontSize: "0.8rem" }}
                                                >
                                                    Download
                                                </Button>
                                            ) : (
                                                <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>N/A</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}
