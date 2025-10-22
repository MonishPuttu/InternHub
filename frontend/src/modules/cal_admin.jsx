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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const CAL_API = `${BACKEND_URL}/api/calendar`;
const POSTS_API = `${BACKEND_URL}/api/posts/applications`;

const statusColors = {
    applied: "#64748b",
    interview_scheduled: "#0ea5e9",
    interviewed: "#8b5cf6",
    offer: "#10b981",
    rejected: "#ef4444",
};

const statusLabels = {
    applied: "Applied",
    interview_scheduled: "Interview Scheduled",
    interviewed: "Interviewed",
    offer: "Offer Received",
    offer: "Offer Received",
    rejected: "Rejected",
};

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
        position: "",
        company_name: "",
        application_date: "",
        deadline_date: "",
        status: "applied",
        industry: "",
        package_offered: "",
        notes: "",
    });

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
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

            // Fetch calendar events
            const calResponse = await fetch(CAL_API);
            const calData = await calResponse.json();

            // Fetch posts
            const postsResponse = await axios.get(`${POSTS_API}?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let allEvents = [];

            // Process calendar events
            if (calData.ok) {
                const calEvents = (calData.calevents || []).map(event => ({
                    ...event,
                    source: 'calendar',
                    displayDate: event.eventDate,
                    displayTitle: event.title
                }));
                allEvents = [...allEvents, ...calEvents];
            }

            // Process posts as events
            if (postsResponse.data.ok) {
                const postEvents = (postsResponse.data.applications || []).map(post => ({
                    id: `post-${post.id}`,
                    postId: post.id,
                    displayTitle: `${post.position} @ ${post.company_name}`,
                    displayDate: post.application_date ? new Date(post.application_date).toISOString().split('T')[0] : null,
                    status: post.status,
                    industry: post.industry || "",
                    package_offered: post.package_offered || "",
                    notes: post.notes || "",
                    deadline_date: post.deadline_date,
                    source: 'post',
                    position: post.position,
                    company_name: post.company_name
                }));
                allEvents = [...allEvents, ...postEvents];
            }

            // Filter by current month
            if (currentDate) {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();

                allEvents = allEvents.filter(event => {
                    const dateToCheck = event.displayDate;
                    if (!dateToCheck) return false;
                    const eventDate = new Date(dateToCheck);
                    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
                });
            }

            // Filter by type
            if (filterType !== "all") {
                allEvents = allEvents.filter(e => e.status === filterType);
            }

            setEvents(allEvents);
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!formData.position || !formData.company_name || !formData.application_date) {
            setErrorMsg("Position, company name, and date are required");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                POSTS_API,
                { ...formData, approval_status: "pending" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.ok) {
                setSuccessMsg("Post created successfully!");
                setShowCreateModal(false);
                fetchAllEvents();
                setFormData({
                    position: "",
                    company_name: "",
                    application_date: "",
                    deadline_date: "",
                    status: "applied",
                    industry: "",
                    package_offered: "",
                    notes: "",
                });
            } else {
                setErrorMsg(response.data.error || "Failed to create post");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to create post");
        }
    };

    const handleEventClick = (event) => {
        if (event.source === 'post') {
            // Redirect to post details page
            window.location.href = `/posts/${event.postId}`;
            return;
        }

        // Open edit modal for calendar events (if any exist in future)
        setActiveEvent(event);
        setShowEditModal(true);
        setFormData({
            position: event.position || "",
            company_name: event.company_name || "",
            application_date: event.displayDate || "",
            deadline_date: event.deadline_date || "",
            status: event.status || "applied",
            industry: event.industry || "",
            package_offered: event.package_offered || "",
            notes: event.notes || "",
        });
    };

    const handleEditSubmit = async () => {
        if (!activeEvent) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${POSTS_API}/${activeEvent.id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
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

    const handleDeletePost = async (eventId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(
                `${POSTS_API}/${eventId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.ok) {
                setSuccessMsg("Post deleted successfully!");
                fetchAllEvents();
                setDeleteConfirm(null);
                setShowEditModal(false);
            } else {
                setErrorMsg(response.data.error || "Failed to delete post");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to delete post");
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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
            day: days[date.getDay()],
            dayNum: date.getDate().toString(),
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
                    isWithinWeek: isWithinWeek(dateKey)
                };
            }
            grouped[dateKey].events.push(event);
        });

        return grouped;
    };

    const groupedEvents = groupEventsByDate();

    const getStatusConfig = (status) => {
        return {
            color: statusColors[status],
            label: statusLabels[status]
        };
    };

    return (
        <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "start", sm: "center" },
                        mb: 2,
                        gap: { xs: 2, sm: 0 }
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
                            Placement Cell Calendar
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                            Manage placement drives and recruitment opportunities
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setShowCreateModal(true)}
                        sx={{ borderRadius: 2, width: { xs: "100%", sm: "auto" } }}
                    >
                        Create
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
                        gap: { xs: 2, md: 0 }
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton size="small" onClick={handlePrevMonth}>
                            <ChevronLeft />
                        </IconButton>
                        <Typography variant="h6" fontWeight="600" sx={{ minWidth: 180, textAlign: "center" }}>
                            {selectedMonth}
                        </Typography>
                        <IconButton size="small" onClick={handleNextMonth}>
                            <ChevronRight />
                        </IconButton>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1, width: { xs: "100%", md: "auto" }, justifyContent: { xs: "center", md: "flex-start" } }}>
                        <Chip
                            label="All Posts"
                            onClick={() => setFilterType("all")}
                            color={filterType === "all" ? "primary" : "default"}
                            variant={filterType === "all" ? "filled" : "outlined"}
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
                        />
                        <Chip
                            label="Applied"
                            onClick={() => setFilterType("applied")}
                            color={filterType === "applied" ? "default" : "default"}
                            variant={filterType === "applied" ? "filled" : "outlined"}
                            sx={{
                                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                bgcolor: filterType === "applied" ? `${statusColors.applied}30` : "transparent",
                                color: filterType === "applied" ? statusColors.applied : "text.primary"
                            }}
                        />
                        <Chip
                            label="Interview"
                            onClick={() => setFilterType("interview_scheduled")}
                            color={filterType === "interview_scheduled" ? "default" : "default"}
                            variant={filterType === "interview_scheduled" ? "filled" : "outlined"}
                            sx={{
                                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                bgcolor: filterType === "interview_scheduled" ? `${statusColors.interview_scheduled}30` : "transparent",
                                color: filterType === "interview_scheduled" ? statusColors.interview_scheduled : "text.primary"
                            }}
                        />
                        <Chip
                            label="Offers"
                            onClick={() => setFilterType("offer")}
                            color={filterType === "offer" ? "success" : "default"}
                            variant={filterType === "offer" ? "filled" : "outlined"}
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
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
                                No posts found for {selectedMonth}
                            </Typography>
                        </Box>
                    ) : (
                        Object.entries(groupedEvents).map(([date, data]) => (
                            <Box key={date} sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                                {/* Date Column */}
                                <Box
                                    sx={{
                                        minWidth: { xs: "100%", sm: 80 },
                                        textAlign: "center",
                                        bgcolor: data.isNearing ? "#ef4444" : data.isWithinWeek ? "#f97316" : "primary.main",
                                        color: "white",
                                        borderRadius: 2,
                                        p: 1.5,
                                        boxShadow: 1,
                                        height: "fit-content",
                                        display: "flex",
                                        flexDirection: { xs: "row", sm: "column" },
                                        alignItems: "center",
                                        justifyContent: { xs: "space-between", sm: "center" },
                                        gap: { xs: 2, sm: 0 }
                                    }}
                                >
                                    <Box sx={{ display: "flex", flexDirection: { xs: "row", sm: "column" }, alignItems: "center", gap: { xs: 1, sm: 0 } }}>
                                        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem" } }}>
                                            {data.dayNum}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: "block", fontSize: { xs: "0.75rem", sm: "0.65rem" } }}>
                                            {data.day}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Events Column */}
                                <Stack spacing={2} sx={{ flex: 1 }}>
                                    {data.events.map((event) => {
                                        const config = getStatusConfig(event.status);
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
                                                        gap: { xs: 2, md: 0 }
                                                    }}
                                                >
                                                    <Box sx={{ flex: 1 }}>
                                                        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}>
                                                            {isNearing && (
                                                                <Chip
                                                                    label={isToday(event.displayDate) ? "TODAY" : "TOMORROW"}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: "bold",
                                                                        color: "white",
                                                                        bgcolor: "#ef4444"
                                                                    }}
                                                                />
                                                            )}
                                                            {isWeek && !isNearing && (
                                                                <Chip
                                                                    label="THIS WEEK"
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: "bold",
                                                                        color: "white",
                                                                        bgcolor: "#f97316"
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

                                                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                                                            {event.displayTitle}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        display: "flex",
                                                        flexDirection: { xs: "column", sm: "row" },
                                                        alignItems: { xs: "start", sm: "start" },
                                                        gap: 2,
                                                        width: { xs: "100%", md: "auto" }
                                                    }}>
                                                        <Stack spacing={0.5} sx={{ minWidth: { xs: "100%", sm: 200 } }}>
                                                            {event.deadline_date && (
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <Schedule fontSize="small" color="action" />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Deadline: {new Date(event.deadline_date).toLocaleDateString()}
                                                                    </Typography>
                                                                </Box>
                                                            )}

                                                            {event.industry && (
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <LocationOn fontSize="small" color="action" />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {event.industry}
                                                                    </Typography>
                                                                </Box>
                                                            )}

                                                            {event.package_offered && (
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <Group fontSize="small" color="action" />
                                                                    <Typography variant="body2" color="text.secondary">
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

            {/* Create Post Modal */}
            <Dialog
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        Create New Post
                        <IconButton onClick={() => setShowCreateModal(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Position"
                            required
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="Software Engineer"
                        />

                        <TextField
                            fullWidth
                            label="Company Name"
                            required
                            value={formData.company_name}
                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            placeholder="Google"
                        />

                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Application Date"
                                type="date"
                                required
                                value={formData.application_date}
                                onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                fullWidth
                                label="Deadline Date"
                                type="date"
                                value={formData.deadline_date}
                                onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <MenuItem value="applied">Applied</MenuItem>
                            <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                            <MenuItem value="interviewed">Interviewed</MenuItem>
                            <MenuItem value="offer">Offer Received</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            label="Industry"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            placeholder="Technology"
                        />

                        <TextField
                            fullWidth
                            label="Package (in Lakhs)"
                            type="number"
                            value={formData.package_offered}
                            onChange={(e) => setFormData({ ...formData, package_offered: e.target.value })}
                            placeholder="12"
                        />

                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional information..."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreatePost}>
                        Create Post
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Post</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this post? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDeletePost(deleteConfirm)}
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