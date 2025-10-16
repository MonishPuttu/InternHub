import { db } from "../db/index.js";
import { calevents } from "../db/schema.js";
import { eq } from "drizzle-orm";
// import { asc } from "drizzle-orm";

export default function calendarRoutes(router) {
    // Get all events
    router.get("/calendar", async (req, res) => {
        try {
            const allEvents = await db
                .select()
                .from(calevents)
                .orderBy(calevents.eventDate, calevents.eventTime);

            res.json({ ok: true, calevents: allEvents });
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