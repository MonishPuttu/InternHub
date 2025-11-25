import { useState, useEffect } from "react";
import { dateInputToUTC, isToday, isTomorrow } from "@/lib/dateUtils";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const CAL_API = `${BACKEND_URL}/api/calendar`;
const APPROVED_POSTS_API = `${BACKEND_URL}/api/posts/approved-posts`;

export const useCalendarEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("all");
    const [currentDate, setCurrentDate] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    useEffect(() => {
        setCurrentDate(new Date());
    }, []);

    useEffect(() => {
        if (currentDate) {
            fetchAllEvents();
        }
    }, [currentDate, filterType]);

    const fetchAllEvents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            // Fetch calendar events
            const calResponse = await fetch(CAL_API, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const calData = await calResponse.json();

            // Fetch approved posts
            const postsResponse = await fetch(APPROVED_POSTS_API, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const postsData = await postsResponse.json();

            let allEvents = [];

            // Process calendar events
            if (calData.ok) {
                const calEvents = (calData.calevents || []).map((event) => ({
                    ...event,
                    source: "calendar",
                    date: event.eventDate,
                    time: event.eventTime,
                }));
                allEvents = [...allEvents, ...calEvents];
            }

            // Process posts as events
            if (postsData.ok) {
                const postEvents = (postsData.posts || []).map((post) => ({
                    id: `post-${post.id}`,
                    postId: post.id,
                    title: `${post.positions && Array.isArray(post.positions) && post.positions.length > 0 ? post.positions.map(p => p.title).join(", ") : 'Unknown Position'} @ ${post.company_name}`,
                    eventDate: post.application_date
                        ? new Date(post.application_date).toISOString().split("T")[0]
                        : null,
                    eventTime: "09:00",
                    eventType: "post",
                    location: post.industry || "",
                    description: post.notes || "",
                    eligibleStudents: post.package_offered
                        ? `₹${post.package_offered}L`
                        : "",
                    source: "post",
                    date: post.application_date
                        ? new Date(post.application_date).toISOString().split("T")[0]
                        : null,
                    time: "09:00",
                }));
                allEvents = [...allEvents, ...postEvents];
            }

            // Filter by current month
            if (currentDate) {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();

                allEvents = allEvents.filter((event) => {
                    if (!event.eventDate) return false;
                    const eventDate = new Date(event.eventDate);
                    return (
                        eventDate.getFullYear() === year && eventDate.getMonth() === month
                    );
                });
            }

            // Filter by type
            if (filterType !== "all") {
                allEvents = allEvents.filter((e) => e.eventType === filterType);
            }

            setEvents(allEvents);
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const createEvent = async (formData) => {
        if (!formData.title || !formData.eventDate || !formData.eventTime) {
            setErrorMsg("Title, date, and time are required");
            return false;
        }

        try {
            const token = localStorage.getItem("token");

            const payload = {
                ...formData,
                eventDate: dateInputToUTC(formData.eventDate),
            };

            const response = await fetch(CAL_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.ok) {
                setSuccessMsg("Event created successfully!");
                fetchAllEvents();
                return true;
            } else {
                if (data.duplicate) {
                    setErrorMsg("This event already exists!");
                } else {
                    setErrorMsg(data.error || "Failed to create event");
                }
                return false;
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to create event");
            return false;
        }
    };

    const updateEvent = async (eventId, formData) => {
        try {
            const token = localStorage.getItem("token");

            const payload = {
                ...formData,
                eventDate: dateInputToUTC(formData.eventDate),
            };

            const response = await fetch(`${CAL_API}/${eventId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.ok) {
                setSuccessMsg("Event updated successfully!");
                fetchAllEvents();
                return true;
            } else {
                setErrorMsg(data.error || "Failed to update event");
                return false;
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to update event");
            return false;
        }
    };

    const deleteEvent = async (eventId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${CAL_API}/${eventId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.ok) {
                setSuccessMsg("Event deleted successfully!");
                fetchAllEvents();
                return true;
            } else {
                setErrorMsg(data.error || "Failed to delete event");
                return false;
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg("Failed to delete event");
            return false;
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

    return {
        events,
        loading,
        filterType,
        setFilterType,
        currentDate,
        errorMsg,
        setErrorMsg,
        successMsg,
        setSuccessMsg,
        fetchAllEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        handlePrevMonth,
        handleNextMonth,
    };
};
