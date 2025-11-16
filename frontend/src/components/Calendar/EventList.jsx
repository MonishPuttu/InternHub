import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import EventCard from "./EventCard";
import { isToday, isTomorrow } from "@/lib/dateUtils";

export default function EventList({ events, loading, onEventClick }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString + "T00:00:00.000Z");
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        return {
            day: days[date.getUTCDay()],
            dayNum: date.getUTCDate().toString(),
        };
    };

    const isNearingEvent = (dateKey) => {
        const utcDateString = dateKey + "T00:00:00.000Z";
        return isToday(utcDateString) || isTomorrow(utcDateString);
    };

    const isWithinWeek = (dateKey) => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const eventDate = new Date(dateKey + "T00:00:00.000Z");
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 1 && diffDays <= 7;
    };

    const groupEventsByDate = () => {
        const grouped = {};

        const sortedEvents = [...events].sort((a, b) => {
            const aDateKey = a.eventDate.slice(0, 10);
            const bDateKey = b.eventDate.slice(0, 10);
            const aIsToday = isToday(a.eventDate);
            const bIsToday = isToday(b.eventDate);
            const aIsTomorrow = isTomorrow(a.eventDate);
            const bIsTomorrow = isTomorrow(b.eventDate);

            if (aIsToday && !bIsToday) return -1;
            if (!aIsToday && bIsToday) return 1;
            if (aIsTomorrow && !bIsTomorrow) return -1;
            if (!aIsTomorrow && bIsTomorrow) return 1;

            return new Date(a.eventDate) - new Date(b.eventDate);
        });

        sortedEvents.forEach((event) => {
            const dateKey = event.eventDate.slice(0, 10);
            if (!grouped[dateKey]) {
                const { day, dayNum } = formatDate(dateKey);
                grouped[dateKey] = {
                    day,
                    dayNum,
                    events: [],
                    isNearing: isNearingEvent(dateKey),

                };
            }
            grouped[dateKey].events.push(event);
        });

        return grouped;
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const groupedEvents = groupEventsByDate();

    return (
        <Stack spacing={4} sx={{ mt: 4 }}>
            {Object.entries(groupedEvents).length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No events found
                    </Typography>
                </Box>
            ) : (
                Object.entries(groupedEvents).map(([date, data]) => (
                    <Box
                        key={date}
                        sx={{
                            display: "flex",
                            gap: 2,
                            flexDirection: { xs: "column", sm: "row" },
                        }}
                    >
                        {/* Date Column */}
                        <Box
                            sx={{
                                minWidth: { xs: "100%", sm: 80 },
                                textAlign: "center",
                                bgcolor: "#8b5cf6",
                                color: "white",
                                borderRadius: 2,
                                p: 1.5,
                                boxShadow: 1,
                                height: "fit-content",
                                display: "flex",
                                flexDirection: { xs: "row", sm: "column" },
                                alignItems: "center",
                                justifyContent: { xs: "space-between", sm: "center" },
                                gap: { xs: 2, sm: 0 },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "row", sm: "column" },
                                    alignItems: "center",
                                    gap: { xs: 1, sm: 0 },
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem" } }}
                                >
                                    {data.dayNum}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        fontSize: { xs: "0.75rem", sm: "0.65rem" },
                                    }}
                                >
                                    {data.day}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Events Column */}
                        <Stack spacing={2} sx={{ flex: 1 }}>
                            {data.events.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onClick={() => onEventClick(event)}
                                />
                            ))}
                        </Stack>
                    </Box>
                ))
            )}
        </Stack>
    );
}