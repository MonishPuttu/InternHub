//componnents/calendar/cal.jsx



// "use client";
// import { useState, useEffect } from "react";
// import {
//     Box,
//     Typography,
//     Button,
//     Chip,
//     Stack,
//     IconButton,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     TextField,
//     MenuItem,
//     CircularProgress,
//     Alert,
//     Snackbar,
// } from "@mui/material";
// import {
//     ChevronLeft,
//     ChevronRight,
//     Add,
//     Schedule,
//     LocationOn,
//     Close,
//     Group,
//     Delete,
// } from "@mui/icons-material";

// export default function EventCalendar() {
//     const [events, setEvents] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [filterType, setFilterType] = useState("all");
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [currentDate, setCurrentDate] = useState(null);
//     const [currentDateTime, setCurrentDateTime] = useState(new Date());
//     const [errorMsg, setErrorMsg] = useState(null);
//     const [successMsg, setSuccessMsg] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const [formData, setFormData] = useState({
//         title: "",
//         eventDate: "",
//         eventTime: "",
//         eventType: "oncampus",
//         location: "",
//         endTime: "",
//         eligibleStudents: "",
//         description: "",
//     });

//     const API_URL = "http://localhost:4000/api/calendar";

//     useEffect(() => {
//         setCurrentDate(new Date());

//         // Update time every second
//         const timer = setInterval(() => {
//             setCurrentDateTime(new Date());
//         }, 1000);

//         return () => clearInterval(timer);
//     }, []);

//     useEffect(() => {
//         if (currentDate) {
//             fetchEvents();
//         }
//     }, [currentDate, filterType]);

//     const months = [
//         "January", "February", "March", "April", "May", "June",
//         "July", "August", "September", "October", "November", "December"
//     ];

//     const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//     const selectedMonth = currentDate
//         ? `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
//         : "";

//     const formatCurrentDateTime = () => {
//         const day = days[currentDateTime.getDay()];
//         const date = currentDateTime.getDate();
//         const month = months[currentDateTime.getMonth()];
//         const year = currentDateTime.getFullYear();

//         let hours = currentDateTime.getHours();
//         const minutes = currentDateTime.getMinutes();
//         const seconds = currentDateTime.getSeconds();
//         const ampm = hours >= 12 ? 'PM' : 'AM';
//         hours = hours % 12 || 12;

//         const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
//         const dateStr = `${day}, ${month} ${date}, ${year}`;

//         return { dateStr, timeStr };
//     };

//     const fetchEvents = async () => {
//         setLoading(true);
//         try {
//             const response = await fetch(API_URL);
//             const data = await response.json();

//             if (data.ok) {
//                 let filteredEvents = data.calevents || [];

//                 if (currentDate) {
//                     const year = currentDate.getFullYear();
//                     const month = currentDate.getMonth();

//                     filteredEvents = filteredEvents.filter(event => {
//                         const eventDate = new Date(event.eventDate);
//                         return eventDate.getFullYear() === year && eventDate.getMonth() === month;
//                     });
//                 }

//                 if (filterType !== "all") {
//                     filteredEvents = filteredEvents.filter(e => e.eventType === filterType);
//                 }

//                 setEvents(filteredEvents);
//             }
//         } catch (error) {
//             console.error("Error:", error);
//             setErrorMsg("Failed to load events");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDeleteEvent = async (eventId) => {
//         try {
//             const response = await fetch(`${API_URL}/${eventId}`, {
//                 method: "DELETE",
//             });

//             const data = await response.json();

//             if (data.ok) {
//                 setSuccessMsg("Event deleted successfully!");
//                 fetchEvents();
//                 setDeleteConfirm(null);
//             } else {
//                 setErrorMsg(data.error || "Failed to delete event");
//             }
//         } catch (error) {
//             console.error("Error:", error);
//             setErrorMsg("Failed to delete event");
//         }
//     };

//     const handlePrevMonth = () => {
//         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
//     };

//     const handleNextMonth = () => {
//         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
//     };

//     if (!currentDate) {
//         return (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
//                 <CircularProgress />
//             </Box>
//         );
//     }

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
//         return {
//             day: days[date.getDay()],
//             dayNum: date.getDate().toString(),
//         };
//     };

//     const formatTime = (timeString) => {
//         if (!timeString) return "";
//         const [hours, minutes] = timeString.split(":");
//         const hour = parseInt(hours);
//         const ampm = hour >= 12 ? "PM" : "AM";
//         const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
//         return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
//     };

//     const isToday = (dateString) => {
//         const today = new Date();
//         const eventDate = new Date(dateString);
//         return today.toDateString() === eventDate.toDateString();
//     };

//     const isTomorrow = (dateString) => {
//         const tomorrow = new Date();
//         tomorrow.setDate(tomorrow.getDate() + 1);
//         const eventDate = new Date(dateString);
//         return tomorrow.toDateString() === eventDate.toDateString();
//     };

//     const isNearingEvent = (dateString) => {
//         return isToday(dateString) || isTomorrow(dateString);
//     };

//     const groupEventsByDate = () => {
//         const grouped = {};

//         const sortedEvents = [...events].sort((a, b) => {
//             const aIsToday = isToday(a.eventDate);
//             const bIsToday = isToday(b.eventDate);
//             const aIsTomorrow = isTomorrow(a.eventDate);
//             const bIsTomorrow = isTomorrow(b.eventDate);

//             if (aIsToday && !bIsToday) return -1;
//             if (!aIsToday && bIsToday) return 1;
//             if (aIsTomorrow && !bIsTomorrow) return -1;
//             if (!aIsTomorrow && bIsTomorrow) return 1;

//             return new Date(a.eventDate) - new Date(b.eventDate);
//         });

//         sortedEvents.forEach((event) => {
//             const dateKey = event.eventDate;
//             if (!grouped[dateKey]) {
//                 const { day, dayNum } = formatDate(dateKey);
//                 grouped[dateKey] = {
//                     day,
//                     dayNum,
//                     events: [],
//                     isNearing: isNearingEvent(dateKey)
//                 };
//             }
//             grouped[dateKey].events.push(event);
//         });

//         return grouped;
//     };

//     const groupedEvents = groupEventsByDate();

//     const getEventTypeConfig = (type) => {
//         const configs = {
//             oncampus: { color: "primary", label: "Oncampus", icon: "🏢" },
//             offcampus: { color: "secondary", label: "Offcampus", icon: "🌍" },
//             hackathon: { color: "warning", label: "Hackathon", icon: "💻" },
//             workshop: { color: "success", label: "Workshop", icon: "🎓" },
//         };
//         return configs[type] || configs.oncampus;
//     };

//     const handleCreateEvent = async () => {
//         if (!formData.title || !formData.eventDate || !formData.eventTime) {
//             setErrorMsg("Title, date, and time are required");
//             return;
//         }

//         try {
//             const response = await fetch(`${API_URL}`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(formData),
//             });

//             const data = await response.json();

//             if (data.ok) {
//                 setSuccessMsg("Event created successfully!");
//                 setShowCreateModal(false);
//                 fetchEvents();
//                 setFormData({
//                     title: "",
//                     eventDate: "",
//                     eventTime: "",
//                     eventType: "oncampus",
//                     location: "",
//                     endTime: "",
//                     eligibleStudents: "",
//                     description: "",
//                 });
//             } else {
//                 setErrorMsg(data.error || "Failed to create event");
//             }
//         } catch (error) {
//             console.error("Error:", error);
//             setErrorMsg("Failed to create event");
//         }
//     };

//     const { dateStr, timeStr } = formatCurrentDateTime();

//     return (
//         <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3 }}>
//             {/* Current Date & Time Display */}
//             <Box sx={{ mb: 3, textAlign: "center" }}>
//                 <Typography variant="h5" fontWeight="600" color="primary">
//                     {dateStr}
//                 </Typography>
//                 <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>
//                     {timeStr}
//                 </Typography>
//             </Box>

//             {/* Header */}
//             <Box sx={{ mb: 4 }}>
//                 <Box
//                     sx={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         mb: 2,
//                     }}
//                 >
//                     <Box>
//                         <Typography variant="h4" fontWeight="bold" gutterBottom>
//                             Event Calendar
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                             Stay updated with placement drives, hackathons & workshops
//                         </Typography>
//                     </Box>
//                     <Button
//                         variant="outlined"
//                         startIcon={<Add />}
//                         onClick={() => setShowCreateModal(true)}
//                         sx={{ borderRadius: 2 }}
//                     >
//                         Create
//                     </Button>
//                 </Box>

//                 {/* Month Navigation & Filters */}
//                 <Box
//                     sx={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         mt: 3,
//                     }}
//                 >
//                     <Stack direction="row" spacing={1} alignItems="center">
//                         <IconButton size="small" onClick={handlePrevMonth}>
//                             <ChevronLeft />
//                         </IconButton>
//                         <Typography variant="h6" fontWeight="600" sx={{ minWidth: 180, textAlign: "center" }}>
//                             {selectedMonth}
//                         </Typography>
//                         <IconButton size="small" onClick={handleNextMonth}>
//                             <ChevronRight />
//                         </IconButton>
//                     </Stack>

//                     <Stack direction="row" spacing={1}>
//                         <Chip
//                             label="All Events"
//                             onClick={() => setFilterType("all")}
//                             color={filterType === "all" ? "primary" : "default"}
//                             variant={filterType === "all" ? "filled" : "outlined"}
//                         />
//                         <Chip
//                             label="On Campus"
//                             onClick={() => setFilterType("oncampus")}
//                             color={filterType === "oncampus" ? "primary" : "default"}
//                             variant={filterType === "oncampus" ? "filled" : "outlined"}
//                         />
//                         <Chip
//                             label="Off Campus"
//                             onClick={() => setFilterType("offcampus")}
//                             color={filterType === "offcampus" ? "secondary" : "default"}
//                             variant={filterType === "offcampus" ? "filled" : "outlined"}
//                         />
//                         <Chip
//                             label="Hackathons"
//                             onClick={() => setFilterType("hackathon")}
//                             color={filterType === "hackathon" ? "warning" : "default"}
//                             variant={filterType === "hackathon" ? "filled" : "outlined"}
//                         />
//                         <Chip
//                             label="Workshops"
//                             onClick={() => setFilterType("workshop")}
//                             color={filterType === "workshop" ? "success" : "default"}
//                             variant={filterType === "workshop" ? "filled" : "outlined"}
//                         />
//                     </Stack>
//                 </Box>
//             </Box>

//             {/* Events List */}
//             {loading ? (
//                 <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
//                     <CircularProgress />
//                 </Box>
//             ) : (
//                 <Stack spacing={4}>
//                     {Object.entries(groupedEvents).length === 0 ? (
//                         <Box sx={{ textAlign: "center", py: 8 }}>
//                             <Typography variant="h6" color="text.secondary">
//                                 No events found for {selectedMonth}
//                             </Typography>
//                         </Box>
//                     ) : (
//                         Object.entries(groupedEvents).map(([date, data]) => (
//                             <Box key={date} sx={{ display: "flex", gap: 3 }}>
//                                 {/* Date Column */}
//                                 <Box
//                                     sx={{
//                                         minWidth: 80,
//                                         textAlign: "center",
//                                         bgcolor: data.isNearing ? "error.main" : "primary.main",
//                                         color: "white",
//                                         borderRadius: 2,
//                                         p: 2,
//                                         boxShadow: data.isNearing ? 4 : 1,
//                                         height: "fit-content",
//                                         animation: data.isNearing ? "pulse 2s infinite" : "none",
//                                         "@keyframes pulse": {
//                                             "0%, 100%": { transform: "scale(1)" },
//                                             "50%": { transform: "scale(1.05)" }
//                                         }
//                                     }}
//                                 >
//                                     <Typography variant="h3" fontWeight="bold">
//                                         {data.dayNum}
//                                     </Typography>
//                                     <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
//                                         {data.day}
//                                     </Typography>
//                                     {data.isNearing && (
//                                         <Chip
//                                             label={isToday(date) ? "TODAY" : "TOMORROW"}
//                                             size="small"
//                                             sx={{
//                                                 mt: 1,
//                                                 bgcolor: "white",
//                                                 color: "error.main",
//                                                 fontWeight: "bold",
//                                                 fontSize: "0.65rem"
//                                             }}
//                                         />
//                                     )}
//                                 </Box>

//                                 {/* Events Column */}
//                                 <Stack spacing={2} sx={{ flex: 1 }}>
//                                     {data.events.map((event) => {
//                                         const config = getEventTypeConfig(event.eventType);
//                                         const isNearing = isNearingEvent(event.eventDate);

//                                         return (
//                                             <Box
//                                                 key={event.id}
//                                                 sx={{
//                                                     bgcolor: "background.paper",
//                                                     borderRadius: 2,
//                                                     p: 3,
//                                                     boxShadow: isNearing ? 4 : 1,
//                                                     border: isNearing ? "2px solid" : "1px solid",
//                                                     borderColor: isNearing ? "error.main" : "divider",
//                                                     "&:hover": { boxShadow: 5 },
//                                                     transition: "box-shadow 0.3s",
//                                                 }}
//                                             >
//                                                 <Box
//                                                     sx={{
//                                                         display: "flex",
//                                                         justifyContent: "space-between",
//                                                         alignItems: "start",
//                                                     }}
//                                                 >
//                                                     <Box sx={{ flex: 1 }}>
//                                                         <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
//                                                             <Chip
//                                                                 label={`${config.icon} ${config.label}`}
//                                                                 color={config.color}
//                                                                 size="small"
//                                                             />
//                                                             {isNearing && (
//                                                                 <Chip
//                                                                     label={isToday(event.eventDate) ? "TODAY" : "TOMORROW"}
//                                                                     color="error"
//                                                                     size="small"
//                                                                     sx={{ fontWeight: "bold" }}
//                                                                 />
//                                                             )}
//                                                         </Stack>

//                                                         <Typography variant="h6" fontWeight="bold" gutterBottom>
//                                                             {event.title}
//                                                         </Typography>

//                                                         <Stack spacing={0.5}>
//                                                             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                                                                 <Schedule fontSize="small" color="action" />
//                                                                 <Typography variant="body2" color="text.secondary">
//                                                                     {formatTime(event.eventTime)}
//                                                                     {event.endTime && ` - ${formatTime(event.endTime)}`}
//                                                                 </Typography>
//                                                             </Box>

//                                                             {event.location && (
//                                                                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                                                                     <LocationOn fontSize="small" color="action" />
//                                                                     <Typography variant="body2" color="text.secondary">
//                                                                         {event.location}
//                                                                     </Typography>
//                                                                 </Box>
//                                                             )}

//                                                             {event.eligibleStudents && (
//                                                                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                                                                     <Group fontSize="small" color="action" />
//                                                                     <Typography variant="body2" color="text.secondary">
//                                                                         {event.eligibleStudents}
//                                                                     </Typography>
//                                                                 </Box>
//                                                             )}
//                                                         </Stack>
//                                                     </Box>

//                                                     <Stack direction="row" spacing={1}>
//                                                         <IconButton
//                                                             color="error"
//                                                             onClick={() => setDeleteConfirm(event.id)}
//                                                             sx={{ "&:hover": { bgcolor: "error.light" } }}
//                                                         >
//                                                             <Delete />
//                                                         </IconButton>
//                                                         <Button variant="contained" sx={{ borderRadius: 2 }}>
//                                                             Register
//                                                         </Button>
//                                                     </Stack>
//                                                 </Box>
//                                             </Box>
//                                         );
//                                     })}
//                                 </Stack>
//                             </Box>
//                         ))
//                     )}
//                 </Stack>
//             )}

//             {/* Create Event Modal */}
//             <Dialog
//                 open={showCreateModal}
//                 onClose={() => setShowCreateModal(false)}
//                 maxWidth="sm"
//                 fullWidth
//             >
//                 <DialogTitle>
//                     <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                         Create New Event
//                         <IconButton onClick={() => setShowCreateModal(false)}>
//                             <Close />
//                         </IconButton>
//                     </Box>
//                 </DialogTitle>
//                 <DialogContent>
//                     <Stack spacing={2} sx={{ mt: 1 }}>
//                         <TextField
//                             fullWidth
//                             label="Event Title"
//                             required
//                             value={formData.title}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, title: e.target.value })
//                             }
//                             placeholder="Google Campus Drive"
//                         />

//                         <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
//                             <TextField
//                                 fullWidth
//                                 label="Event Date"
//                                 type="date"
//                                 required
//                                 value={formData.eventDate}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, eventDate: e.target.value })
//                                 }
//                                 InputLabelProps={{ shrink: true }}
//                             />
//                             <TextField
//                                 fullWidth
//                                 label="Start Time"
//                                 type="time"
//                                 required
//                                 value={formData.eventTime}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, eventTime: e.target.value })
//                                 }
//                                 InputLabelProps={{ shrink: true }}
//                             />
//                         </Box>

//                         <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
//                             <TextField
//                                 fullWidth
//                                 select
//                                 label="Event Type"
//                                 value={formData.eventType}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, eventType: e.target.value })
//                                 }
//                             >
//                                 <MenuItem value="oncampus">On Campus</MenuItem>
//                                 <MenuItem value="offcampus">Off Campus</MenuItem>
//                                 <MenuItem value="hackathon">Hackathon</MenuItem>
//                                 <MenuItem value="workshop">Workshop</MenuItem>
//                             </TextField>
//                             <TextField
//                                 fullWidth
//                                 label="End Time"
//                                 type="time"
//                                 value={formData.endTime}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, endTime: e.target.value })
//                                 }
//                                 InputLabelProps={{ shrink: true }}
//                             />
//                         </Box>

//                         <TextField
//                             fullWidth
//                             label="Location"
//                             value={formData.location}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, location: e.target.value })
//                             }
//                             placeholder="Auditorium A"
//                         />

//                         <TextField
//                             fullWidth
//                             label="Eligible Students"
//                             value={formData.eligibleStudents}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, eligibleStudents: e.target.value })
//                             }
//                             placeholder="SDE, SDE-2"
//                         />

//                         <TextField
//                             fullWidth
//                             label="Description"
//                             multiline
//                             rows={3}
//                             value={formData.description}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, description: e.target.value })
//                             }
//                             placeholder="Event description..."
//                         />
//                     </Stack>
//                 </DialogContent>
//                 <DialogActions sx={{ p: 2 }}>
//                     <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
//                     <Button variant="contained" onClick={handleCreateEvent}>
//                         Create Event
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             {/* Delete Confirmation Dialog */}
//             <Dialog
//                 open={!!deleteConfirm}
//                 onClose={() => setDeleteConfirm(null)}
//                 maxWidth="xs"
//                 fullWidth
//             >
//                 <DialogTitle>Delete Event</DialogTitle>
//                 <DialogContent>
//                     <Typography>
//                         Are you sure you want to delete this event? This action cannot be undone.
//                     </Typography>
//                 </DialogContent>
//                 <DialogActions sx={{ p: 2 }}>
//                     <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
//                     <Button
//                         variant="contained"
//                         color="error"
//                         onClick={() => handleDeleteEvent(deleteConfirm)}
//                     >
//                         Delete
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Snackbar
//                 open={!!errorMsg}
//                 autoHideDuration={4000}
//                 onClose={() => setErrorMsg(null)}
//                 anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//             >
//                 <Alert severity="error" onClose={() => setErrorMsg(null)}>
//                     {errorMsg}
//                 </Alert>
//             </Snackbar>

//             <Snackbar
//                 open={!!successMsg}
//                 autoHideDuration={4000}
//                 onClose={() => setSuccessMsg(null)}
//                 anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//             >
//                 <Alert severity="success" onClose={() => setSuccessMsg(null)}>
//                     {successMsg}
//                 </Alert>
//             </Snackbar>
//         </Box>
//     );
// }

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
    Delete,
} from "@mui/icons-material";

export default function EventCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        eventDate: "",
        eventTime: "",
        eventType: "oncampus",
        location: "",
        endTime: "",
        eligibleStudents: "",
        description: "",
    });

    const API_URL = "http://localhost:4000/api/calendar";

    useEffect(() => {
        setCurrentDate(new Date());

        // Update time every second
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (currentDate) {
            fetchEvents();
        }
    }, [currentDate, filterType]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const selectedMonth = currentDate
        ? `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
        : "";

    const formatCurrentDateTime = () => {
        const day = days[currentDateTime.getDay()];
        const date = currentDateTime.getDate();
        const month = months[currentDateTime.getMonth()];
        const year = currentDateTime.getFullYear();

        let hours = currentDateTime.getHours();
        const minutes = currentDateTime.getMinutes();
        const seconds = currentDateTime.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
        const dateStr = `${day}, ${month} ${date}, ${year}`;

        return { dateStr, timeStr };
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (data.ok) {
                let filteredEvents = data.calevents || [];

                if (currentDate) {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();

                    filteredEvents = filteredEvents.filter(event => {
                        const eventDate = new Date(event.eventDate);
                        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
                    });
                }

                if (filterType !== "all") {
                    filteredEvents = filteredEvents.filter(e => e.eventType === filterType);
                }

                setEvents(filteredEvents);
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await fetch(`${API_URL}/${eventId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (data.ok) {
                setSuccessMsg("Event deleted successfully!");
                fetchEvents();
                setDeleteConfirm(null);
            } else {
                setErrorMsg(data.error || "Failed to delete event");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to delete event");
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

    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
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

    const isNearingEvent = (dateString) => {
        return isToday(dateString) || isTomorrow(dateString);
    };

    const groupEventsByDate = () => {
        const grouped = {};

        const sortedEvents = [...events].sort((a, b) => {
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
            const dateKey = event.eventDate;
            if (!grouped[dateKey]) {
                const { day, dayNum } = formatDate(dateKey);
                grouped[dateKey] = {
                    day,
                    dayNum,
                    events: [],
                    isNearing: isNearingEvent(dateKey)
                };
            }
            grouped[dateKey].events.push(event);
        });

        return grouped;
    };

    const groupedEvents = groupEventsByDate();

    const getEventTypeConfig = (type) => {
        const configs = {
            oncampus: { color: "primary", label: "Oncampus", icon: "🏢" },
            offcampus: { color: "secondary", label: "Offcampus", icon: "🌍" },
            hackathon: { color: "warning", label: "Hackathon", icon: "💻" },
            workshop: { color: "success", label: "Workshop", icon: "🎓" },
        };
        return configs[type] || configs.oncampus;
    };

    const handleCreateEvent = async () => {
        if (!formData.title || !formData.eventDate || !formData.eventTime) {
            setErrorMsg("Title, date, and time are required");
            return;
        }

        try {
            const response = await fetch(`${API_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.ok) {
                setSuccessMsg("Event created successfully!");
                setShowCreateModal(false);
                fetchEvents();
                setFormData({
                    title: "",
                    eventDate: "",
                    eventTime: "",
                    eventType: "oncampus",
                    location: "",
                    endTime: "",
                    eligibleStudents: "",
                    description: "",
                });
            } else {
                setErrorMsg(data.error || "Failed to create event");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to create event");
        }
    };

    const { dateStr, timeStr } = formatCurrentDateTime();

    return (
        <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3 }}>
            {/* Current Date & Time Display */}
            <Box sx={{ mb: 3, textAlign: "center" }}>
                <Typography variant="h5" fontWeight="600" color="primary">
                    {dateStr}
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>
                    {timeStr}
                </Typography>
            </Box>

            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Event Calendar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Stay updated with placement drives, hackathons & workshops
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setShowCreateModal(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Create
                    </Button>
                </Box>

                {/* Month Navigation & Filters */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 3,
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

                    <Stack direction="row" spacing={1}>
                        <Chip
                            label="All Events"
                            onClick={() => setFilterType("all")}
                            color={filterType === "all" ? "primary" : "default"}
                            variant={filterType === "all" ? "filled" : "outlined"}
                        />
                        <Chip
                            label="On Campus"
                            onClick={() => setFilterType("oncampus")}
                            color={filterType === "oncampus" ? "primary" : "default"}
                            variant={filterType === "oncampus" ? "filled" : "outlined"}
                        />
                        <Chip
                            label="Off Campus"
                            onClick={() => setFilterType("offcampus")}
                            color={filterType === "offcampus" ? "secondary" : "default"}
                            variant={filterType === "offcampus" ? "filled" : "outlined"}
                        />
                        <Chip
                            label="Hackathons"
                            onClick={() => setFilterType("hackathon")}
                            color={filterType === "hackathon" ? "warning" : "default"}
                            variant={filterType === "hackathon" ? "filled" : "outlined"}
                        />
                        <Chip
                            label="Workshops"
                            onClick={() => setFilterType("workshop")}
                            color={filterType === "workshop" ? "success" : "default"}
                            variant={filterType === "workshop" ? "filled" : "outlined"}
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
                            <Box key={date} sx={{ display: "flex", gap: 2 }}>
                                {/* Date Column */}
                                <Box
                                    sx={{
                                        minWidth: 40,
                                        textAlign: "center",
                                        bgcolor: data.isNearing ? "error.main" : "primary.main",
                                        color: "white",
                                        borderRadius: 1.5,
                                        p: 1,
                                        boxShadow: data.isNearing ? 4 : 1,
                                        height: "fit-content",
                                        animation: data.isNearing ? "pulse 2s infinite" : "none",
                                        "@keyframes pulse": {
                                            "0%, 100%": { transform: "scale(1)" },
                                            "50%": { transform: "scale(1.05)" }
                                        }
                                    }}
                                >
                                    <Typography variant="h5" fontWeight="bold">
                                        {data.dayNum}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", fontSize: "0.65rem" }}>
                                        {data.day}
                                    </Typography>
                                    {data.isNearing && (
                                        <Chip
                                            label={isToday(date) ? "TODAY" : "TOMORROW"}
                                            size="small"
                                            sx={{
                                                mt: 0.5,
                                                bgcolor: "white",
                                                color: "error.main",
                                                fontWeight: "bold",
                                                fontSize: "0.55rem",
                                                height: "18px"
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* Events Column */}
                                <Stack spacing={2} sx={{ flex: 1 }}>
                                    {data.events.map((event) => {
                                        const config = getEventTypeConfig(event.eventType);
                                        const isNearing = isNearingEvent(event.eventDate);

                                        return (
                                            <Box
                                                key={event.id}
                                                sx={{
                                                    bgcolor: "background.paper",
                                                    borderRadius: 2,
                                                    p: 2,
                                                    boxShadow: isNearing ? 4 : 1,
                                                    border: isNearing ? "2px solid" : "1px solid",
                                                    borderColor: isNearing ? "error.main" : "divider",
                                                    "&:hover": { boxShadow: 5 },
                                                    transition: "box-shadow 0.3s",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "start",
                                                    }}
                                                >
                                                    <Box sx={{ flex: 1 }}>
                                                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                            <Chip
                                                                label={`${config.icon} ${config.label}`}
                                                                color={config.color}
                                                                size="small"
                                                            />
                                                            {isNearing && (
                                                                <Chip
                                                                    label={isToday(event.eventDate) ? "TODAY" : "TOMORROW"}
                                                                    color="error"
                                                                    size="small"
                                                                    sx={{ fontWeight: "bold" }}
                                                                />
                                                            )}
                                                        </Stack>

                                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                            {event.title}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                                                        <Stack spacing={0.5} sx={{ minWidth: 200 }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                <Schedule fontSize="small" color="action" />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {formatTime(event.eventTime)}
                                                                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                                                                </Typography>
                                                            </Box>

                                                            {event.location && (
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <LocationOn fontSize="small" color="action" />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {event.location}
                                                                    </Typography>
                                                                </Box>
                                                            )}

                                                            {event.eligibleStudents && (
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <Group fontSize="small" color="action" />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {event.eligibleStudents}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Stack>

                                                        <Stack direction="row" spacing={1}>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => setDeleteConfirm(event.id)}
                                                                sx={{ "&:hover": { bgcolor: "error.light" } }}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                            <Button variant="contained" sx={{ borderRadius: 2 }}>
                                                                Register
                                                            </Button>
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
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        Create New Event
                        <IconButton onClick={() => setShowCreateModal(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Event Title"
                            required
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Google Campus Drive"
                        />

                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
                            />
                        </Box>

                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                            <TextField
                                fullWidth
                                select
                                label="Event Type"
                                value={formData.eventType}
                                onChange={(e) =>
                                    setFormData({ ...formData, eventType: e.target.value })
                                }
                            >
                                <MenuItem value="oncampus">On Campus</MenuItem>
                                <MenuItem value="offcampus">Off Campus</MenuItem>
                                <MenuItem value="hackathon">Hackathon</MenuItem>
                                <MenuItem value="workshop">Workshop</MenuItem>
                            </TextField>
                            <TextField
                                fullWidth
                                label="End Time"
                                type="time"
                                value={formData.endTime}
                                onChange={(e) =>
                                    setFormData({ ...formData, endTime: e.target.value })
                                }
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Location"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="Auditorium A"
                        />

                        <TextField
                            fullWidth
                            label="Eligible Students"
                            value={formData.eligibleStudents}
                            onChange={(e) =>
                                setFormData({ ...formData, eligibleStudents: e.target.value })
                            }
                            placeholder="SDE, SDE-2"
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
                            placeholder="Event description..."
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
                        Are you sure you want to delete this event? This action cannot be undone.
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