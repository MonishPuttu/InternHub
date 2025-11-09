import { Box, Typography, Stack, Chip } from "@mui/material";
import { CalendarMonth, LocationOn, Schedule } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function UpcomingEventsCard({ events }) {
  const theme = useTheme();
  const getEventColor = (type) => {
    const colors = {
      oncampus: "#8b5cf6",
      offcampus: "#06b6d4",
      virtual: "#10b981",
      workshop: "#f59e0b",
    };
    return colors[type] || "#8b5cf6";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Tomorrow";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid #334155",
        p: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: "text.primary", fontWeight: 600, mb: 3 }}
      >
        Upcoming Events
      </Typography>

      <Stack spacing={2}>
        {events.map((event, idx) => (
          <Box
            key={idx}
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: "1px solid #334155",
              "&:hover": {
                borderColor: "#8b5cf6",
                bgcolor: "background.default",
              },
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Stack direction="row" spacing={2}>
              <Box
                sx={{
                  width: 8,
                  bgcolor: getEventColor(event.eventType),
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
                >
                  {event.title}
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Schedule sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {formatDate(event.eventDate)},{" "}
                      {formatTime(event.eventTime)}
                    </Typography>
                  </Stack>
                  {event.location && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocationOn
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {event.location}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                {event.description && (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {event.description}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>

      {events.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CalendarMonth sx={{ fontSize: 48, color: "#334155", mb: 1 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No upcoming events
          </Typography>
        </Box>
      )}
    </Box>
  );
}
