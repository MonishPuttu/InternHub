import { db } from "../db/index.js";
import { session, user } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

export async function requireAuth(req, res, next) {
  try {
    const token = req.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ ok: false, error: "No token provided" });
    }

    // Fetch session
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessions.length === 0) {
      return res.status(401).json({ ok: false, error: "Invalid token" });
    }

    const userSession = sessions[0];

    if (new Date() > new Date(userSession.expiresAt)) {
      await db.delete(session).where(eq(session.token, token));
      return res
        .status(401)
        .json({ ok: false, error: "Session expired", expired: true });
    }

    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, userSession.userId))
      .limit(1);

    if (users.length === 0) {
      return res.status(401).json({ ok: false, error: "User not found" });
    }

    req.user = users[0];
    req.session = userSession;
    next();
  } catch (e) {
    console.error("Auth middleware error:", e);
    res.status(500).json({ ok: false, error: "Authentication failed" });
  }
}
