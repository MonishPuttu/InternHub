import { db } from "../db/index.js";
import { calevents } from "../db/schema/calendar.js";
import { eq, lt, and } from "drizzle-orm";

export default function calendarRoutes(router) {
    // Get all events (with auto-cleanup of ended events)
    router.get("/calendar", async (req, res) => {
        try {
            // Get all events first
            const allEvents = await db
                .select()
                .from(calevents)
                .orderBy(calevents.eventDate, calevents.eventTime);

            // Filter and delete ended events
            const now = new Date();
            const endedEventIds = [];

            allEvents.forEach(event => {
                const eventDate = new Date(event.eventDate);
                const timeToCheck = event.endTime || event.eventTime;

                if (timeToCheck) {
                    const [hours, minutes] = timeToCheck.split(':').map(Number);
                    const eventEndDateTime = new Date(eventDate);
                    eventEndDateTime.setHours(hours, minutes, 0, 0);

                    // If event has ended, mark for deletion
                    if (now > eventEndDateTime) {
                        endedEventIds.push(event.id);
                    }
                }
            });

            // Delete ended events from database
            if (endedEventIds.length > 0) {
                for (const id of endedEventIds) {
                    await db
                        .delete(calevents)
                        .where(eq(calevents.id, id));
                }
            }

            // Get fresh list of active events
            const activeEvents = await db
                .select()
                .from(calevents)
                .orderBy(calevents.eventDate, calevents.eventTime);

            res.json({ ok: true, calevents: activeEvents });
        } catch (e) {
            console.error(e);
            res.status(500).json({ ok: false, error: String(e) });
        }
    });

    // Create event
    router.post("/calendar", async (req, res) => {
        try {
            const {
                title,
                eventDate,
                eventTime,
                endTime,
                eventType,
                location,
                eligibleStudents,
                description
            } = req.body;

            if (!title || !eventDate || !eventTime) {
                return res.status(400).json({
                    ok: false,
                    error: "Title, date, and time are required"
                });
            }

            console.log("Creating event:", { title, eventDate, eventTime, eventType });

            const newEvent = await db
                .insert(calevents)
                .values({
                    title,
                    eventDate,
                    eventTime,
                    endTime: endTime || null,
                    eventType: eventType || "oncampus",
                    location: location || null,
                    eligibleStudents: eligibleStudents || null,
                    description: description || null
                })
                .returning();

            res.status(201).json({
                ok: true,
                message: 'Event created successfully',
                event: newEvent[0]
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({ ok: false, error: String(e) });
        }
    });

    // Delete event
    router.delete("/calendar/:id", async (req, res) => {
        try {
            const { id } = req.params;

            const deletedEvent = await db
                .delete(calevents)
                .where(eq(calevents.id, id))
                .returning();

            if (deletedEvent.length === 0) {
                return res.status(404).json({
                    ok: false,
                    error: "Event not found"
                });
            }

            res.json({
                ok: true,
                message: 'Event deleted successfully'
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({ ok: false, error: String(e) });
        }
    });

    return router;
}