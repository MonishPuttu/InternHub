import { Box, Stack, IconButton, Typography, Chip } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { MONTHS } from "@/constants/calendarConstants";

export default function CalendarFilters({
    currentDate,
    filterType,
    setFilterType,
    onPrevMonth,
    onNextMonth,
}) {
    const selectedMonth = currentDate
        ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
        : "";

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "start", md: "center" },
                mt: 3,
                gap: { xs: 2, md: 0 },
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                <IconButton size="small" onClick={onPrevMonth}>
                    <ChevronLeft />
                </IconButton>
                <Typography
                    variant="h6"
                    fontWeight="600"
                    sx={{ minWidth: 180, textAlign: "center" }}
                >
                    {selectedMonth}
                </Typography>
                <IconButton size="small" onClick={onNextMonth}>
                    <ChevronRight />
                </IconButton>
            </Stack>

            <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{
                    gap: 1,
                    width: { xs: "100%", md: "auto" },
                    justifyContent: { xs: "center", md: "flex-start" },
                }}
            >
                <Chip
                    label="All Events"
                    onClick={() => setFilterType("all")}
                    color={filterType === "all" ? "primary" : "default"}
                    variant={filterType === "all" ? "filled" : "outlined"}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
                />
                <Chip
                    label="On Campus"
                    onClick={() => setFilterType("oncampus")}
                    color={filterType === "oncampus" ? "primary" : "default"}
                    variant={filterType === "oncampus" ? "filled" : "outlined"}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
                />
                <Chip
                    label="Off Campus"
                    onClick={() => setFilterType("offcampus")}
                    color={filterType === "offcampus" ? "secondary" : "default"}
                    variant={filterType === "offcampus" ? "filled" : "outlined"}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
                />
                <Chip
                    label="Hackathons"
                    onClick={() => setFilterType("hackathon")}
                    color={filterType === "hackathon" ? "warning" : "default"}
                    variant={filterType === "hackathon" ? "filled" : "outlined"}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
                />
                <Chip
                    label="Workshops"
                    onClick={() => setFilterType("workshop")}
                    color={filterType === "workshop" ? "success" : "default"}
                    variant={filterType === "workshop" ? "filled" : "outlined"}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
                />
                <Chip
                    label="Opportunities"
                    onClick={() => setFilterType("post")}
                    color={filterType === "post" ? "info" : "default"}
                    variant={filterType === "post" ? "filled" : "outlined"}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
                />
            </Stack>
        </Box>
    );
}
