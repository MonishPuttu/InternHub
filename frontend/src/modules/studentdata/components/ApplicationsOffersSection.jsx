"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Paper, Typography, Button, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box, TablePagination } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ApplicationsOffersSection({ applications = [], offers = [] }) {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        console.log('ApplicationsOffersSection mounted');
        console.log('Applications:', applications);
        console.log('Offers:', offers);
    }, [applications, offers]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedApplications = applications.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 2,
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                position: "relative",
                bgcolor: "background.paper",
            }}
        >
            <IconButton
                onClick={() => router.back()}
                size="small"
                sx={{
                    color: "#8b5cf6",
                    position: "absolute",
                    top: 16,
                    left: 16,
                    display: "flex",
                    alignItems: "center",
                    "&:hover": {
                        bgcolor: "transparent",
                    }
                }}
                aria-label="back"
            >
                <ArrowBackIcon />
                <Typography
                    component="span"
                    sx={{ ml: 0.5, fontSize: 16, fontWeight: 500, userSelect: "none" }}
                >
                    Back
                </Typography>
            </IconButton>

            <Typography
                variant="h5"
                sx={{
                    color: "text.primary",
                    mb: 3,
                    mt: 5,
                    fontWeight: "bold",
                    fontSize: "1.5rem"
                }}
            >
                Applications & Offers
            </Typography>

            {applications.length === 0 && offers.length === 0 ? (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "150px",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "#fafafa",
                    }}
                >
                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: "1rem"
                        }}
                    >
                        No applications or offers yet
                    </Typography>
                </Box>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Company</TableCell>
                                <TableCell sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Position</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Status</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Offer</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Date</TableCell>
                                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: "bold", py: 1.5, fontSize: "0.875rem" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedApplications.map((app, index) => {
                                const relatedOffer = offers.find((offer) => offer.applicationId === app.id);
                                return (
                                    <TableRow
                                        key={app.id || index}
                                        sx={{
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                            "&:hover": { bgcolor: "action.hover" },
                                            "&:last-child": { borderBottom: "none" }
                                        }}
                                    >
                                        <TableCell sx={{ color: "text.primary", py: 2, fontSize: "0.875rem" }}>{app.companyName}</TableCell>
                                        <TableCell sx={{ color: "text.primary", py: 2, fontSize: "0.875rem" }}>{app.position}</TableCell>
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
                                                    fontSize: "0.75rem",
                                                    height: 24,
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
                                                        fontSize: "0.75rem",
                                                        height: 24,
                                                    }}
                                                />
                                            ) : (
                                                <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>N/A</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.875rem", py: 2 }}>
                                            {new Date(app.appliedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            {relatedOffer && relatedOffer.offerLetterUrl ? (
                                                <Button
                                                    href={relatedOffer.offerLetterUrl}
                                                    target="_blank"
                                                    download={relatedOffer.fileName || "offer_letter.pdf"}
                                                    size="small"
                                                    sx={{
                                                        color: "#8b5cf6",
                                                        textTransform: "none",
                                                        fontSize: "0.875rem",
                                                        fontWeight: 500,
                                                        "&:hover": {
                                                            bgcolor: "#8b5cf610"
                                                        }
                                                    }}
                                                >
                                                    Download
                                                </Button>
                                            ) : (
                                                <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>N/A</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {applications.length > 0 && (
                <TablePagination
                    component="div"
                    count={applications.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                        borderTop: "1px solid",
                        borderColor: "divider",
                        mt: 1,
                        ".MuiTablePagination-toolbar": {
                            color: "text.secondary",
                        },
                        ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                            fontSize: "0.875rem",
                        },
                    }}
                />
            )}
        </Paper>
    );
}