import { Router } from 'express';
import { db } from "../db/index.js";
import { calevents } from "../db/schema/calendar.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// Helper function to find duplicates
const findDuplicates = async (eventData) => {
    const { title, eventDate, eventTime, eventType, location, eligibleStudents } = eventData;

    return await db
        .select()
        .from(calevents)
        .where(
            and(
                eq(calevents.title, title),
                eq(calevents.eventDate, eventDate),
                eq(calevents.eventTime, eventTime),
                eq(calevents.eventType, eventType || "oncampus"),
                eq(calevents.location, location || null),
                eq(calevents.eligibleStudents, eligibleStudents || null)
            )
        );
};

// Helper function to remove duplicate events
const removeDuplicates = async () => {
    try {
        const allEvents = await db.select().from(calevents);
        const seen = new Map();
        const duplicateIds = [];

        allEvents.forEach(event => {
            // Create a unique key based on all important fields
            const key = `${event.title}|${event.eventDate}|${event.eventTime}|${event.eventType}|${event.location}|${event.eligibleStudents}`;

            if (seen.has(key)) {
                // This is a duplicate, mark for deletion (keep the first one)
                duplicateIds.push(event.id);
            } else {
                seen.set(key, event.id);
            }
        });

        // Delete duplicates
        if (duplicateIds.length > 0) {
            for (const id of duplicateIds) {
                await db.delete(calevents).where(eq(calevents.id, id));
            }
            console.log(`Removed ${duplicateIds.length} duplicate events`);
        }

        return duplicateIds.length;
    } catch (error) {
        console.error("Error removing duplicates:", error);
        return 0;
    }
};

// Get all events (with auto-cleanup of ended events and duplicates)
router.get("/calendar", async (req, res) => {
    try {
        // First remove duplicates
        const duplicatesRemoved = await removeDuplicates();

        // Get all events
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

        res.json({
            ok: true,
            calevents: activeEvents,
            duplicatesRemoved,
            endedEventsRemoved: endedEventIds.length
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

// Create event (with duplicate prevention)
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

        // Check for duplicates before creating
        const existingDuplicates = await findDuplicates({
            title,
            eventDate,
            eventTime,
            eventType,
            location,
            eligibleStudents
        });

        if (existingDuplicates.length > 0) {
            return res.status(409).json({
                ok: false,
                error: "This event already exists",
                duplicate: true,
                existingEvent: existingDuplicates[0]
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

// Manual cleanup endpoint (optional - for admin use)
router.post("/calendar/cleanup", async (req, res) => {
    try {
        const duplicatesRemoved = await removeDuplicates();

        res.json({
            ok: true,
            message: `Cleanup completed. Removed ${duplicatesRemoved} duplicate events.`,
            duplicatesRemoved
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

export default router;