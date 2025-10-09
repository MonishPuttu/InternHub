import { db } from "../db/index.js";
import { session, user } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function requireAuth(req, res, next) {
  try {
    const token = req.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ ok: false, error: "Missing token" });
    }

    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    const s = sessions[0];
    if (!s) {
      return res.status(401).json({ ok: false, error: "Invalid session" });
    }

    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, s.userId))
      .limit(1);

    const u = users[0];
    if (!u) {
      return res.status(401).json({ ok: false, error: "User not found" });
    }

    req.user = u; // attach the user object to the request
    next();
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
