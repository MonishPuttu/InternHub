import { Router } from 'express';
import { db } from "../db/index.js";
import { calevents } from "../db/schema/calendar.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = Router();

// Helper function to find duplicates for a specific user
const findDuplicates = async (eventData, userId) => {
    const { title, eventDate, eventTime, eventType, location, eligibleStudents } = eventData;

    return await db
        .select()
        .from(calevents)
        .where(
            and(
                eq(calevents.userId, userId),
                eq(calevents.title, title),
                eq(calevents.eventDate, eventDate),
                eq(calevents.eventTime, eventTime),
                eq(calevents.eventType, eventType || "events"),
                eq(calevents.location, location || null),
                eq(calevents.eligibleStudents, eligibleStudents || null)
            )
        );
};

// Helper function to remove duplicate events for a user
const removeDuplicates = async (userId) => {
    try {
        const allEvents = await db
            .select()
            .from(calevents)
            .where(eq(calevents.userId, userId));

        const seen = new Map();
        const duplicateIds = [];

        allEvents.forEach(event => {
            const key = `${event.title}|${event.eventDate}|${event.eventTime}|${event.eventType}|${event.location}|${event.eligibleStudents}`;

            if (seen.has(key)) {
                duplicateIds.push(event.id);
            } else {
                seen.set(key, event.id);
            }
        });

        if (duplicateIds.length > 0) {
            for (const id of duplicateIds) {
                await db.delete(calevents).where(
                    and(
                        eq(calevents.id, id),
                        eq(calevents.userId, userId)
                    )
                );
            }
            console.log(`Removed ${duplicateIds.length} duplicate events for user ${userId}`);
        }

        return duplicateIds.length;
    } catch (error) {
        console.error("Error removing duplicates:", error);
        return 0;
    }
};

// Helper function to delete old events for a user
const deleteOldEvents = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayString = today.toISOString().split('T')[0];

        const allEvents = await db
            .select()
            .from(calevents)
            .where(eq(calevents.userId, userId));

        const oldEventIds = [];

        allEvents.forEach(event => {
            if (event.eventDate < todayString) {
                oldEventIds.push(event.id);
            }
        });

        if (oldEventIds.length > 0) {
            for (const id of oldEventIds) {
                await db.delete(calevents).where(
                    and(
                        eq(calevents.id, id),
                        eq(calevents.userId, userId)
                    )
                );
            }
            console.log(`Auto-deleted ${oldEventIds.length} old events for user ${userId}`);
        }

        return oldEventIds.length;
    } catch (error) {
        console.error("Error deleting old events:", error);
        return 0;
    }
};

// Auto-cleanup function for specific user
const autoCleanup = async (userId) => {
    const duplicatesRemoved = await removeDuplicates(userId);
    const oldEventsRemoved = await deleteOldEvents(userId);
    return { duplicatesRemoved, oldEventsRemoved };
};

// Get user's events (with auto-cleanup) - Protected route
router.get("/calendar", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Auto-cleanup old events and duplicates for this user
        const { duplicatesRemoved, oldEventsRemoved } = await autoCleanup(userId);

        // Get all remaining events for this user
        const activeEvents = await db
            .select()
            .from(calevents)
            .where(eq(calevents.userId, userId))
            .orderBy(calevents.eventDate, calevents.eventTime);

        res.json({
            ok: true,
            calevents: activeEvents,
            duplicatesRemoved,
            oldEventsRemoved
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

// Create event (with duplicate prevention) - Protected route
router.post("/calendar", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

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

        // Check if the event date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDateObj = new Date(eventDate);
        eventDateObj.setHours(0, 0, 0, 0);

        if (eventDateObj < today) {
            return res.status(400).json({
                ok: false,
                error: "Cannot create events for past dates"
            });
        }

        // Check for duplicates for this user
        const existingDuplicates = await findDuplicates({
            title,
            eventDate,
            eventTime,
            eventType,
            location,
            eligibleStudents
        }, userId);

        if (existingDuplicates.length > 0) {
            return res.status(409).json({
                ok: false,
                error: "This event already exists",
                duplicate: true,
                existingEvent: existingDuplicates[0]
            });
        }

        console.log("Creating event for user:", userId, { title, eventDate, eventTime, eventType });

        const newEvent = await db
            .insert(calevents)
            .values({
                title,
                eventDate,
                eventTime,
                endTime: endTime || null,
                eventType: eventType || "events",
                location: location || null,
                eligibleStudents: eligibleStudents || null,
                description: description || null,
                userId: userId
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

// Update event (only if user owns it) - Protected route
router.put("/calendar/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
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

        // Check if the event date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDateObj = new Date(eventDate);
        eventDateObj.setHours(0, 0, 0, 0);

        if (eventDateObj < today) {
            return res.status(400).json({
                ok: false,
                error: "Cannot update events to past dates"
            });
        }

        // Update only if user owns this event
        const updatedEvent = await db
            .update(calevents)
            .set({
                title,
                eventDate,
                eventTime,
                endTime: endTime || null,
                eventType: eventType || "events",
                location: location || null,
                eligibleStudents: eligibleStudents || null,
                description: description || null
            })
            .where(
                and(
                    eq(calevents.id, id),
                    eq(calevents.userId, userId)
                )
            )
            .returning();

        if (updatedEvent.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "Event not found or you don't have permission to update it"
            });
        }

        res.json({
            ok: true,
            message: 'Event updated successfully',
            event: updatedEvent[0]
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

// Delete event (only if user owns it) - Protected route
router.delete("/calendar/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Delete only if user owns this event
        const deletedEvent = await db
            .delete(calevents)
            .where(
                and(
                    eq(calevents.id, id),
                    eq(calevents.userId, userId)
                )
            )
            .returning();

        if (deletedEvent.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "Event not found or you don't have permission to delete it"
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

// Manual cleanup endpoint (for current user only) - Protected route
router.post("/calendar/cleanup", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { duplicatesRemoved, oldEventsRemoved } = await autoCleanup(userId);

        res.json({
            ok: true,
            message: `Cleanup completed. Removed ${duplicatesRemoved} duplicates and ${oldEventsRemoved} old events.`,
            duplicatesRemoved,
            oldEventsRemoved
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

export default router;