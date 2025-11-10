"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Add,
  Schedule,
  LocationOn,
  Close,
  Group,
} from "@mui/icons-material";
import axios from "axios";
import {
  formatDateOnly,
  dateInputToUTC,
  getCurrentISTForInput,
} from "@/lib/dateUtils";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const CAL_API = `${BACKEND_URL}/api/calendar`;
const POSTS_API = `${BACKEND_URL}/api/posts/applications`;

const statusColors = {
  posts: "#3b82f6",
  events: "#8b5cf6",
  announcements: "#f59e0b",
  drive: "#10b981",
  tests: "#ef4444",
};

const statusLabels = {
  posts: "Post",
  events: "Event",
  announcements: "Announcement",
  drive: "Drive",
  tests: "Test",
};

const EVENT_TYPES = [
  { value: "posts", label: "Post" },
  { value: "events", label: "Event" },
  { value: "announcements", label: "Announcement" },
  { value: "drive", label: "Drive" },
  { value: "tests", label: "Test" },
];

export default function AdminCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    eventDate: "",
    eventTime: "",
    endTime: "",
    eventType: "events",
    location: "",
    eligibleStudents: "",
    description: "",
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    if (currentDate) {
      fetchAllEvents();
    }
  }, [currentDate, filterType]);

  const selectedMonth = currentDate
    ? `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : "";

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found, some features may be limited");
      }

      // Fetch calendar events - FIXED: removed duplicate token declaration and fixed variable name
      const response = await fetch(CAL_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const calData = await response.json();

      // Fetch posts (only approved ones, excluding rejected)
      const postsResponse = await axios.get(`${POSTS_API}?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let allEvents = [];

      // Process calendar events
      if (calData.ok) {
        const calEvents = (calData.calevents || []).map((event) => ({
          ...event,
          source: "calendar",
          displayDate: event.eventDate,
          displayTitle: event.title,
          event_type: event.eventType || "events",
        }));
        allEvents = [...allEvents, ...calEvents];
      }

      // Process approved posts (exclude rejected/disapproved)
      if (postsResponse.data.ok) {
        const postEvents = (postsResponse.data.applications || [])
          .filter((post) => {
            // Only include approved posts
            return post.approval_status === "approved";
          })
          .map((post) => ({
            id: `post-${post.id}`,
            postId: post.id,
            displayTitle: `${post.position} @ ${post.company_name}`,
            displayDate: post.application_date
              ? new Date(post.application_date).toISOString().split("T")[0]
              : null,
            event_type: post.event_type || "posts",
            industry: post.industry || "",
            package_offered: post.package_offered || "",
            notes: post.notes || "",
            deadline_date: post.deadline_date,
            source: "post",
            position: post.position,
            company_name: post.company_name,
          }));
        allEvents = [...allEvents, ...postEvents];
      }

      // Filter by current month
      if (currentDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        allEvents = allEvents.filter((event) => {
          const dateToCheck = event.displayDate;
          if (!dateToCheck) return false;
          const eventDate = new Date(dateToCheck);
          return (
            eventDate.getFullYear() === year && eventDate.getMonth() === month
          );
        });
      }

      // Filter by type
      if (filterType !== "all") {
        allEvents = allEvents.filter((e) => e.event_type === filterType);
      }

      setEvents(allEvents);
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.eventDate || !formData.eventTime) {
      setErrorMsg("Title, date, and time are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Creating calendar event:", formData);

      const eventData = {
        title: formData.title,
        eventDate: dateInputToUTC(formData.eventDate), // ✅ Convert to UTC
        eventTime: formData.eventTime,
        endTime: formData.endTime || null,
        eventType: formData.eventType,
        location: formData.location || null,
        eligibleStudents: formData.eligibleStudents || null,
        description: formData.description || null,
      };

      console.log("Posting data to calendar:", eventData);

      const response = await axios.post(CAL_API, eventData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response:", response.data);

      if (response.data.ok) {
        setSuccessMsg("Event created successfully!");
        setShowCreateModal(false);
        fetchAllEvents();
        setFormData({
          title: "",
          eventDate: "",
          eventTime: "",
          endTime: "",
          eventType: "events",
          location: "",
          eligibleStudents: "",
          description: "",
        });
      } else {
        setErrorMsg(response.data.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 409) {
        setErrorMsg("This event already exists in the calendar");
      } else {
        setErrorMsg(
          error.response?.data?.error ||
            error.message ||
            "Failed to create event"
        );
      }
    }
  };

  const handleEventClick = (event) => {
    if (event.source === "post") {
      // Redirect to post details page
      window.location.href = `/Post/postdetails/${event.postId}`;
      return;
    }

    // Open edit modal for calendar events
    setActiveEvent(event);
    setShowEditModal(true);
    setFormData({
      title: event.title || "",
      eventDate: event.eventDate || "",
      eventTime: event.eventTime || "",
      endTime: event.endTime || "",
      eventType: event.eventType || "events",
      location: event.location || "",
      eligibleStudents: event.eligibleStudents || "",
      description: event.description || "",
    });
  };

  const handleEditSubmit = async () => {
    if (!activeEvent || activeEvent.source === "post") return;

    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        eventDate: dateInputToUTC(formData.eventDate),
      };

      const response = await axios.put(
        `${CAL_API}/${activeEvent.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        setSuccessMsg("Event updated successfully!");
        setShowEditModal(false);
        setActiveEvent(null);
        fetchAllEvents();
      } else {
        setErrorMsg(response.data.error || "Failed to update event");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Failed to update event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      if (!eventId || eventId.startsWith("post-")) {
        setErrorMsg("Cannot delete posts from calendar view");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.delete(`${CAL_API}/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.ok) {
        setSuccessMsg("Event deleted successfully!");
        fetchAllEvents();
        setDeleteConfirm(null);
        setShowEditModal(false);
      } else {
        setErrorMsg(response.data.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Failed to delete event");
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  if (!currentDate) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return {
      day: days[date.getUTCDay()],
      dayNum: date.getUTCDate().toString(),
    };
  };

  const isToday = (dateString) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return today.toDateString() === eventDate.toDateString();
  };

  const isTomorrow = (dateString) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(dateString);
    return tomorrow.toDateString() === eventDate.toDateString();
  };

  const isNearingPost = (dateString) => {
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

  const groupEventsByDate = () => {
    const grouped = {};

    const sortedEvents = [...events].sort((a, b) => {
      const aIsToday = isToday(a.displayDate);
      const bIsToday = isToday(b.displayDate);
      const aIsTomorrow = isTomorrow(a.displayDate);
      const bIsTomorrow = isTomorrow(b.displayDate);

      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;
      if (aIsTomorrow && !bIsTomorrow) return -1;
      if (!aIsTomorrow && bIsTomorrow) return 1;

      return new Date(a.displayDate) - new Date(b.displayDate);
    });

    sortedEvents.forEach((event) => {
      const dateKey = event.displayDate;
      if (!grouped[dateKey]) {
        const { day, dayNum } = formatDate(dateKey);
        grouped[dateKey] = {
          day,
          dayNum,
          events: [],
          isNearing: isNearingPost(dateKey),
          isWithinWeek: isWithinWeek(dateKey),
        };
      }
      grouped[dateKey].events.push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByDate();

  const getStatusConfig = (eventType) => {
    return {
      color: statusColors[eventType] || statusColors.posts,
      label: statusLabels[eventType] || statusLabels.posts,
    };
  };

  return (
    <Box
      sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "start", sm: "center" },
            mb: 2,
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
            >
              Placement Cell Calendar
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}
            >
              Manage placement drives and recruitment opportunities
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setShowCreateModal(true)}
            sx={{ borderRadius: 2, width: { xs: "100%", sm: "auto" } }}
          >
            Create Event
          </Button>
        </Box>

        {/* Month Navigation & Filters */}
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
            <IconButton size="small" onClick={handlePrevMonth}>
              <ChevronLeft />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight="600"
              sx={{ minWidth: 180, textAlign: "center" }}
            >
              {selectedMonth}
            </Typography>
            <IconButton size="small" onClick={handleNextMonth}>
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
              label="Posts"
              onClick={() => setFilterType("posts")}
              variant={filterType === "posts" ? "filled" : "outlined"}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                bgcolor:
                  filterType === "posts"
                    ? `${statusColors.posts}30`
                    : "transparent",
                color:
                  filterType === "posts" ? statusColors.posts : "text.primary",
              }}
            />
            <Chip
              label="Events"
              onClick={() => setFilterType("events")}
              variant={filterType === "events" ? "filled" : "outlined"}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                bgcolor:
                  filterType === "events"
                    ? `${statusColors.events}30`
                    : "transparent",
                color:
                  filterType === "events"
                    ? statusColors.events
                    : "text.primary",
              }}
            />
            <Chip
              label="Announcements"
              onClick={() => setFilterType("announcements")}
              variant={filterType === "announcements" ? "filled" : "outlined"}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                bgcolor:
                  filterType === "announcements"
                    ? `${statusColors.announcements}30`
                    : "transparent",
                color:
                  filterType === "announcements"
                    ? statusColors.announcements
                    : "text.primary",
              }}
            />
            <Chip
              label="Drives"
              onClick={() => setFilterType("drive")}
              variant={filterType === "drive" ? "filled" : "outlined"}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                bgcolor:
                  filterType === "drive"
                    ? `${statusColors.drive}30`
                    : "transparent",
                color:
                  filterType === "drive" ? statusColors.drive : "text.primary",
              }}
            />
            <Chip
              label="Tests"
              onClick={() => setFilterType("tests")}
              variant={filterType === "tests" ? "filled" : "outlined"}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                bgcolor:
                  filterType === "tests"
                    ? `${statusColors.tests}30`
                    : "transparent",
                color:
                  filterType === "tests" ? statusColors.tests : "text.primary",
              }}
            />
          </Stack>
        </Box>
      </Box>

      {/* Events List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={4}>
          {Object.entries(groupedEvents).length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No events found for {selectedMonth}
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
                    bgcolor: "primary.main",
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
                  {data.events.map((event) => {
                    const config = getStatusConfig(event.event_type);
                    const isNearing = isNearingPost(event.displayDate);
                    const isWeek = isWithinWeek(event.displayDate);

                    return (
                      <Box
                        key={event.id}
                        onClick={() => handleEventClick(event)}
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
                                    isToday(event.displayDate)
                                      ? "TODAY"
                                      : "TOMORROW"
                                  }
                                  size="small"
                                  sx={{
                                    fontWeight: "bold",
                                    bgcolor: "#8b5cf620",
                                    color: "white",
                                    border: data.isNearing
                                      ? "2px solid #ef4444"
                                      : "primary.main",
                                  }}
                                />
                              )}
                              {isWeek && !isNearing && (
                                <Chip
                                  label="THIS WEEK"
                                  size="small"
                                  sx={{
                                    bgcolor: "#8b5cf620",
                                    color: "white",
                                    border: data.isNearing
                                      ? "2px solid #efcd44ff"
                                      : "primary.main",
                                  }}
                                />
                              )}
                              <Chip
                                label={config.label}
                                size="small"
                                sx={{
                                  bgcolor: `${config.color}30`,
                                  color: config.color,
                                  fontWeight: 600,
                                }}
                              />
                            </Stack>

                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              gutterBottom
                              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                            >
                              {event.displayTitle}
                            </Typography>

                            {event.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                              >
                                {event.description}
                              </Typography>
                            )}
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
                              {event.eventTime && (
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
                                    {event.eventTime}{" "}
                                    {event.endTime && `- ${event.endTime}`}
                                  </Typography>
                                </Box>
                              )}

                              {event.deadlinedate && (
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
                                    Deadline:{" "}
                                    {formatDateOnly(event.deadlinedate)}
                                  </Typography>
                                </Box>
                              )}

                              {(event.location || event.industry) && (
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
                                    {event.location || event.industry}
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

                              {event.package_offered && (
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
                                    ₹{event.package_offered}L
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      )}

      {/* Create Event Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Create Calendar Event
            <IconButton onClick={() => setShowCreateModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              select
              label="Event Type"
              value={formData.eventType}
              onChange={(e) =>
                setFormData({ ...formData, eventType: e.target.value })
              }
            >
              {EVENT_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Event Title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Google Campus Drive"
            />

            <TextField
              fullWidth
              label="Event Date"
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) =>
                setFormData({ ...formData, eventDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                required
                value={formData.eventTime}
                onChange={(e) =>
                  setFormData({ ...formData, eventTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: getCurrentISTForInput(),
                }}
              />
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: getCurrentISTForInput(),
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., Main Auditorium"
            />

            <TextField
              fullWidth
              label="Eligible Students"
              value={formData.eligibleStudents}
              onChange={(e) =>
                setFormData({ ...formData, eligibleStudents: e.target.value })
              }
              placeholder="e.g., CS/IT 2024 Batch"
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Additional details about the event..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateEvent}>
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Event Details
            <IconButton onClick={() => setShowEditModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {activeEvent && activeEvent.source === "calendar" ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                select
                label="Event Type"
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
              >
                {EVENT_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Event Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Event Date"
                type="date"
                value={formData.eventDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: getCurrentISTForInput(),
                }}
              />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) =>
                    setFormData({ ...formData, eventTime: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: getCurrentISTForInput(),
                  }}
                />
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: getCurrentISTForInput(),
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Eligible Students"
                value={formData.eligibleStudents}
                onChange={(e) =>
                  setFormData({ ...formData, eligibleStudents: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteConfirm(activeEvent.id)}
                fullWidth
              >
                Delete Event
              </Button>
            </Stack>
          ) : (
            <Typography color="text.secondary">
              This is a post entry. Click to view full details.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowEditModal(false)}>Close</Button>
          {activeEvent && activeEvent.source === "calendar" && (
            <Button variant="contained" onClick={handleEditSubmit}>
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this event? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteEvent(deleteConfirm)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
