import { Box, Typography, Stack, Chip } from "@mui/material";
import { Schedule, LocationOn, Group } from "@mui/icons-material";
import { getEventTypeConfig } from "@/constants/calendarConstants";

export default function EventCard({ event, onClick }) {
    const config = getEventTypeConfig(event.eventType);

    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes.padStart(2, "0")} ${ampm}`;
    };

    const isToday = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(dateString + "T00:00:00");
        eventDate.setHours(0, 0, 0, 0);
        return today.getTime() === eventDate.getTime();
    };

    const isTomorrow = (dateString) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const eventDate = new Date(dateString + "T00:00:00");
        eventDate.setHours(0, 0, 0, 0);
        return tomorrow.getTime() === eventDate.getTime();
    };

    const isNearingEvent = (dateString) => {
        return isToday(dateString) || isTomorrow(dateString);
    };

    const isWithinWeek = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(dateString);
        eventDate.setHours(0, 0, 0, 0);
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 1 && diffDays <= 7;
    };

    const isNearing = isNearingEvent(event.eventDate);
    const isWeek = isWithinWeek(event.eventDate);

    return (
        <Box
            onClick={onClick}
            sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                p: { xs: 1.5, sm: 2 },
                boxShadow: 1,
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                "&:hover": { boxShadow: 5 },
                transition: "box-shadow 0.3s",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "start", md: "start" },
                    gap: { xs: 2, md: 0 },
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}
                    >
                        {isNearing && (
                            <Chip
                                label={
                                    isToday(event.eventDate)
                                        ? "TODAY"
                                        : "TOMORROW"
                                }
                                size="small"
                                sx={{
                                    fontWeight: "bold",
                                    bgcolor: "#8b5cf6",
                                    color: "white",
                                    border: isNearing
                                        ? "2px solid #ef4444"
                                        : "primary.main",
                                }}
                            />
                        )}

                        <Chip
                            label={`${config.icon} ${config.label}`}
                            color={config.color}
                            size="small"
                        />
                        {event.source === "post" && (
                            <Chip
                                label="From Posts"
                                size="small"
                                sx={{
                                    bgcolor: "#8b5cf620",
                                    color: "#8b5cf6",
                                }}
                            />
                        )}
                    </Stack>

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                    >
                        {event.title}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "start", sm: "start" },
                        gap: 2,
                        width: { xs: "100%", md: "auto" },
                    }}
                >
                    <Stack
                        spacing={0.5}
                        sx={{ minWidth: { xs: "100%", sm: 200 } }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Schedule fontSize="small" color="action" />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {formatTime(event.eventTime)}
                                {event.endTime &&
                                    ` - ${formatTime(event.endTime)}`}
                            </Typography>
                        </Box>

                        {event.location && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <LocationOn fontSize="small" color="action" />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {event.location}
                                </Typography>
                            </Box>
                        )}

                        {event.eligibleStudents && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Group fontSize="small" color="action" />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {event.eligibleStudents}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
